# Dépendances entre views, components et composables

Ce document décrit qui dépend de qui dans dailymon : 2 views, 18 components et 6 composables.
Le détail des props et des comportements de chaque composant se trouve dans [`COMPONENTS.md`](../COMPONENTS.md).

Les diagrammes sont écrits en [Mermaid](https://mermaid.js.org/). GitHub et VS Code (avec une extension Mermaid) les affichent directement.

**Sommaire**

1. [Vue d'ensemble](#1-vue-densemble)
2. [Arbre des composants](#2-arbre-des-composants)
3. [Qui utilise quel composable](#3-qui-utilise-quel-composable)
4. [Dépendances des composables](#4-dépendances-des-composables)
5. [État partagé et état local](#5-état-partagé-et-état-local)
6. [Props et événements](#6-props-et-événements)
7. [États d'un jour](#7-états-dun-jour)
8. [Scénarios](#8-scénarios)
9. [Points d'attention](#9-points-dattention)

## 1. Vue d'ensemble

Les dépendances descendent des views vers l'API. Une seule remonte et ne figure pas sur ce schéma : `customFetch` importe le routeur pour rediriger vers `/login` quand la session expire (voir le schéma de la section [Points d'attention](#9-points-dattention)).

```mermaid
flowchart TD
    main["main.ts"] --> app["App.vue"]
    main --> router["router/index.ts"]
    app --> components
    router --> views["views/<br/>HomeView, LoginView"]
    router --> store
    views --> components["components/<br/>periods, days, entries"]
    views --> composables["composables/<br/>useAuth, useModels, usePeriods,<br/>useEntries, useSummary, useNotification"]
    components --> composables
    composables --> store["stores/auth.ts<br/>token + localStorage"]
    composables --> generated["api/generated.ts<br/>client orval"]
    generated --> fetch["api/fetch-instance.ts<br/>customFetch, ApiError"]
    fetch --> store
    fetch --> backend[("API backend")]
```

Trois règles structurent le code :

- Aucun composant n'appelle l'API. Les imports de `api/generated` dans `components/` sont des types, plus la constante d'enum `EntryFreeFoodDtoAllOfFoodType` dans `FreeEntryForm`.
- Il n'y a pas de couche service : les composables appellent directement `api/generated`.
- `types/entries.ts` et `utils/dates.ts` n'ont aucune dépendance vers les couches supérieures. Ils ne figurent pas sur le schéma pour le garder lisible.

| Module | Utilisé par |
|---|---|
| `types/entries.ts` | `useEntries`, `PeriodView`, `DayView`, `CategorySelection`, `FoodEntryPicker`, `EntryForm`, `EntryList`, `SportEntryCard`, `FreeEntryCard`, `FoodEntryCard`, `SportEntryForm`, `FreeEntryForm` (libellés `FOOD_TYPE_LABELS`, `BENEFIT_LABELS`, `SPORT_LABELS`) |
| `utils/dates.ts` | `usePeriods` (`PERIOD_DAYS`), `PeriodView` (`addDays`, `elapsedDaysDescending`, `PERIOD_DAYS`), `PeriodSummary` (`shortDate`), `DayView` (`weekDayName`, `shortDate`) |

## 2. Arbre des composants

```mermaid
flowchart LR
    App --> ErrorView
    App --> RouterView{{"RouterView"}}
    RouterView -- "/login" --> LoginView
    RouterView -- "/ (requiresAuth)" --> HomeView
    HomeView -- "× N semaines" --> PeriodView
    PeriodView -- "× jours écoulés" --> DayView
    PeriodView --> PeriodSummary
    DayView -- "bouton +" --> ModalDialog
    ModalDialog -. "slot fourni par DayView" .-> CategorySelection
    CategorySelection -- "onglet Food" --> FoodEntryPicker
    FoodEntryPicker -- "× modèles" --> FoodModelRow
    CategorySelection -- "onglets Sport, Free" --> EntryForm
    DayView -- "modification" --> EntryForm
    SportEntryForm --> IntensitySlider
    SportEntryForm --> ChoiceChips
    FreeEntryForm --> ChoiceChips
    EntryForm --> SportEntryForm
    EntryForm --> FreeEntryForm
    DayView --> DaySummary
    DayView --> EntryList
    EntryList --> SportEntryCard
    EntryList --> FreeEntryCard
    EntryList --> FoodEntryCard
    EntryList -. "slot #edit<br/>fourni par DayView" .-> EntryForm

    classDef view fill:#dbeafe,stroke:#1d4ed8,color:#111
    classDef smart fill:#dcfce7,stroke:#15803d,color:#111
    classDef dumb fill:#f3f4f6,stroke:#6b7280,color:#111
    class LoginView,HomeView view
    class ErrorView,PeriodView,DayView,FoodEntryPicker,SportEntryForm,FreeEntryForm smart
    class PeriodSummary,DaySummary,ModalDialog,ChoiceChips,IntensitySlider,CategorySelection,FoodModelRow,EntryForm,EntryList,SportEntryCard,FreeEntryCard,FoodEntryCard dumb
```

Bleu : views. Vert : composants qui utilisent au moins un composable. Gris : composants purement présentationnels, qui ne dépendent que de leurs props.

La saisie n'est plus affichée dans le jour : le bouton « + » de l'en-tête ouvre un `ModalDialog` qui contient `CategorySelection`, parent de `FoodEntryPicker` et de `EntryForm` selon l'onglet choisi.

Les formulaires n'ont qu'un parent, `EntryForm`. `EntryForm` est déclaré par `CategorySelection` pour la création et par `DayView` pour la modification. `DayView` l'injecte alors dans le slot `#edit` de `EntryList` : le formulaire s'affiche à la place de l'entrée, mais `EntryList` ne l'importe pas et ne connaît ni son état ni ses événements.

Les flèches en pointillés indiquent un contenu de slot : l'emplacement à l'écran, pas une dépendance. `ModalDialog` ne connaît pas `CategorySelection`, et `EntryList` ne connaît pas `EntryForm`.

Tous les composants de saisie sont dans `components/entries/` : `CategorySelection`, `FoodEntryPicker` et `FoodModelRow` servent à saisir des entrées, pas à gérer des modèles.

## 3. Qui utilise quel composable

Les views et le bandeau d'erreur :

```mermaid
flowchart LR
    LoginView --> useAuth
    HomeView --> useAuth
    HomeView --> usePeriods
    HomeView --> useModels
    HomeView --> useNotification
    ErrorView --> useNotification
```

Les composants métier :

```mermaid
flowchart LR
    PeriodView --> useSummary
    DayView --> useSummary
    DayView --> useEntries
    DayView --> useModels
    FoodEntryPicker --> useModels
    SportEntryForm --> useModels
    FreeEntryForm --> useModels
```

Le détail de ce que chacun consomme :

| Consommateur | Composable | Éléments utilisés |
|---|---|---|
| `LoginView` | `useAuth` | `doLogin` |
| `HomeView` | `useAuth` | `logout` |
| | `useNotification` | `clear` |
| | `useModels` | `foodModels`, `sportModels`, `freeModels`, `fetchModels`, `resetModels` |
| | `usePeriods` | `periods`, `fetchPeriods`, `loadAllPeriods` |
| `ErrorView` | `useNotification` | `message`, `tone`, `clear` |
| `PeriodView` | `useSummary` | `summary`, `fetchSummary` |
| `DayView` | `useEntries` | `entries`, `loaded`, `fetchEntries`, `addEntry`, `editEntry`, `removeEntry` |
| | `useSummary` | `summary`, `fetchSummary` |
| | `useModels` | `addFoodModelFromEntry` |
| `FoodEntryPicker` | `useModels` | `foodModels` |
| `SportEntryForm` | `useModels` | `sportModels` |
| `FreeEntryForm` | `useModels` | `freeModels` |

`App`, `PeriodSummary`, `DaySummary`, `ModalDialog`, `ChoiceChips`, `IntensitySlider`, `CategorySelection`, `FoodModelRow`, `EntryForm`, `EntryList` et les trois cartes d'entrée n'utilisent aucun composable.

## 4. Dépendances des composables

```mermaid
flowchart LR
    data["useEntries<br/>useModels<br/>usePeriods<br/>useSummary"] --> useNotification
    data --> api["api/generated.ts"]
    useAuth --> api
    useAuth --> store["stores/auth.ts"]
    api --> fetch["api/fetch-instance.ts"]
    fetch --> store
    router["router/index.ts"] --> store
```

`useNotification` est le seul composable utilisé par d'autres composables, et il ne dépend de rien. `useAuth` ne l'utilise pas : les erreurs de connexion sont affichées par `LoginView`.

Le routeur et `customFetch` lisent directement le store `auth`, sans passer par `useAuth`.

| Composable | Portée de l'état | Fonction de l'API | Endpoint |
|---|---|---|---|
| `useAuth` | store Pinia `auth` | `login` | `POST /auth/login` |
| `usePeriods` | local à chaque appel | `getFirstDate` | `GET /entry/firstDate` |
| | | `getRelevantDates` | `GET /entry/get/{date}` |
| `useModels` | module | `getFoodModels` | `GET /model/food` |
| | | `getSportModels` | `GET /model/sport` |
| | | `getFreeModels` | `GET /model/free` |
| | | `createModel` | `POST /model` |
| `useEntries` | local à chaque appel | `getEntries` | `GET /entry/{date}` |
| | | `createEntry` | `POST /entry` |
| | | `updateEntry` | `PUT /entry/{id}` |
| | | `deleteEntry` | `DELETE /entry/{id}` |
| `useSummary` | local à chaque appel | `getSummaryInfo` | `GET /entry/summary-info` |
| `useNotification` | module | aucune | aucun |

## 5. État partagé et état local

L'emplacement du `ref` détermine le partage. Déclaré hors de la fonction `useX`, il est commun à toute l'application. Déclaré dedans, chaque appel crée le sien.

```mermaid
flowchart TB
    subgraph module["État au niveau module : une instance pour toute l'application"]
        models["useModels<br/>foodModels, sportModels, freeModels"]
        notif["useNotification<br/>message, tone"]
    end

    subgraph semaine["PeriodView : une semaine"]
        ps["useSummary<br/>résumé de la semaine"]

        subgraph lundi["DayView lundi"]
            e1["useEntries<br/>entries du lundi"]
            s1["useSummary<br/>résumé du lundi"]
            fml["FoodEntryPicker<br/>reçoit les entries du lundi<br/>par ses props"]
        end

        subgraph mardi["DayView mardi"]
            e2["useEntries<br/>entries du mardi"]
            s2["useSummary<br/>résumé du mardi"]
        end
    end

    home["HomeView<br/>son propre usePeriods"] -- "charge et remet à zéro" --> models
    fml -- "lit foodModels" --> models
    e1 -- "écrit" --> notif
    e2 -- "écrit" --> notif
    ps -- "écrit les erreurs" --> notif
    err["ErrorView"] -- "lit" --> notif
```

Conséquences pratiques :

- Le bouton « Create Model » de `EntryList` émet `@create-model`, et `DayView` ajoute le modèle à `foodModels`. Le compteur de `HomeView` et tous les `FoodEntryPicker` ouverts se mettent à jour sans rechargement.
- `HomeView` charge les modèles à son montage. Les formulaires lisent ensuite les listes sans déclencher d'appel.
- `resetModels` incrémente un compteur `session` : une réponse reçue après une déconnexion est ignorée.
- Les entrées d'un jour n'ont qu'une source : le `useEntries` de `DayView`, chargé une fois au montage puis mis à jour avec chaque DTO renvoyé par l'API.
- `ErrorView` est hors du `RouterView`, donc la notification reste visible lors d'un changement de route. `HomeView` l'efface à son montage. `notify(texte)` est un succès, qui s'efface seul au bout de 2,5 s ; `notifyError` et `notify(texte, 'error')` restent affichés jusqu'à ce qu'on les ferme.

## 6. Props et événements

Chaque flèche relie un parent, à gauche, à son enfant. Sur les libellés, `→` indique les données transmises par le parent, `←` les événements émis par l'enfant et `↔` un `v-model`.

```mermaid
flowchart LR
    HomeView -->|"→ :start-date :loaded"| PeriodView
    PeriodView -->|"→ :from-date :to-date :summary"| PeriodSummary
    PeriodView <-->|"→ :date<br/>↔ v-model:expanded<br/>← @entries-changed"| DayView
```

```mermaid
flowchart LR
    DayView <-->|"→ :title<br/>← @close"| ModalDialog
    DayView <-->|"dans le slot du modal<br/>→ :date :entries<br/>← @set-quantity @submit"| CategorySelection
    CategorySelection <-->|"→ :date :entries<br/>← @set-quantity"| FoodEntryPicker
    FoodEntryPicker <-->|"→ :model :quantity<br/>← @add @sub"| FoodModelRow
    CategorySelection <-->|"→ :date :category<br/>← @submit"| EntryForm
    DayView <-->|"dans le slot #edit<br/>→ :date :entry<br/>← @submit"| EntryForm
    EntryForm <-->|"→ :date :entry<br/>← @submit"| Forms["SportEntryForm<br/>FreeEntryForm"]
    Forms <-->|"↔ v-model<br/>→ :label :options"| ChoiceChips
    Forms <-->|"↔ v-model<br/>→ :label"| IntensitySlider
    DayView -->|"→ :summary"| DaySummary
    EntryList -->|"→ :entry"| Cards["SportEntryCard<br/>FreeEntryCard<br/>FoodEntryCard"]
    DayView <-->|"→ :entries :editing-entry-id<br/>← @edit @delete @create-model<br/>slot #edit"| EntryList
```

`DayView` centralise toutes les écritures : `EntryForm`, `FoodEntryPicker` et `EntryList` émettent, `CategorySelection` relaie, `DayView` appelle `useEntries`, ou `useModels` pour « Create Model ».

`DayView` détient aussi l'ouverture des formulaires : `creating` pour le modal de création, `editingEntryId` pour la modification. Chacun ne se referme qu'après un enregistrement réussi, si bien qu'une saisie refusée par le backend reste à l'écran. La saisie food garde le modal ouvert. `editingEntryId` est aussi remis à `null` quand le jour est replié. L'onglet courant, lui, est local à `CategorySelection` et repart sur Food à chaque ouverture du modal.

## 7. États d'un jour

Un jour a deux états indépendants.

- **Détail** (`expanded`) : `PeriodView` détient `expandedDay`, qui garantit qu'un seul jour est déplié par semaine. `DayView` le lit et l'écrit via `defineModel('expanded')`.
- **Saisie** (`creating`) : local à `DayView`. Le modal est modal, donc un seul est ouvert à la fois dans toute l'application.

Détail :

```mermaid
stateDiagram-v2
    [*] --> Replie
    Replie --> Deplie: clic sur l'en-tête ou la liste, résumé chargé
    Deplie --> Replie: même clic, ou autre jour déplié
    Replie: replié
    Deplie: déplié (DaySummary + EntryList)
```

Saisie :

```mermaid
stateDiagram-v2
    [*] --> Ferme
    Ferme --> Ouvert: bouton +, entrées chargées
    Ouvert --> Ferme: Échap, fond, ×, ou formulaire enregistré
    Ouvert --> Ouvert: + ou − food enregistré
    Ferme: modal fermé
    Ouvert: modal ouvert (CategorySelection)
```

## 8. Scénarios

### Connexion

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant L as LoginView
    participant A as useAuth
    participant S as store auth
    participant F as customFetch
    participant B as Backend

    U->>L: envoie le formulaire
    L->>A: doLogin(credentials)
    A->>F: login() via generated.ts
    F->>B: POST /auth/login
    alt identifiants acceptés
        B-->>F: 200 + token
        F-->>A: réponse
        A->>S: setSession(token)
        A-->>L: true
        L->>L: router.push(redirect ou /)
    else identifiants refusés
        B-->>F: 401 ou 403
        Note over F: /auth/login : la session n'est pas vidée
        F-->>L: ApiError, traversant doLogin
        L->>L: affiche « Identifiants refusés »
    end
```

### Chargement de la page d'accueil

```mermaid
sequenceDiagram
    participant H as HomeView
    participant M as useModels
    participant P as usePeriods
    participant PV as PeriodView (× N)
    participant D as DayView (× jours)
    participant B as Backend

    H->>M: fetchModels()
    M->>B: GET /model/food, /sport, /free
    B-->>M: listes de modèles
    H->>P: fetchPeriods()
    P->>B: GET /entry/firstDate puis /entry/get/{date}
    B-->>P: dates de début de semaine
    P-->>H: periods, dont les 4 premières avec loaded = true
    H->>PV: rendu d'un PeriodView par période
    PV->>B: GET /entry/summary-info (semaine)
    opt loaded, ou bouton « Charger les données »
        PV->>D: rendu d'un DayView par jour écoulé
        D->>B: GET /entry/{date}
    end
```

### Enregistrement d'une entrée sport ou free

```mermaid
sequenceDiagram
    participant Form as EntryForm
    participant D as DayView
    participant E as useEntries
    participant N as useNotification
    participant PV as PeriodView
    participant B as Backend

    Form->>D: @submit(payload)
    alt payload avec id
        D->>E: editEntry(id, payload)
        E->>B: PUT /entry/{id}
    else payload sans id
        D->>E: addEntry(payload)
        E->>B: POST /entry
    end
    alt succès
        B-->>E: DTO enregistré
        E->>N: notify(message de succès)
        E->>E: met à jour entries avec le DTO
        E-->>D: DTO
        D->>D: ferme le formulaire (modal, ou editingEntryId à null)
        D->>PV: @entries-changed
        PV->>B: GET /entry/summary-info (semaine)
        opt jour déplié
            D->>B: GET /entry/summary-info (jour), via useSummary
        end
    else échec
        B-->>E: erreur HTTP
        E->>N: notifyError(ApiError)
        E-->>D: undefined, rien n'est rechargé et le formulaire reste ouvert
    end
```

### « + » sur un modèle food

```mermaid
sequenceDiagram
    participant R as FoodModelRow
    participant L as FoodEntryPicker
    participant C as CategorySelection
    participant D as DayView
    participant E as useEntries
    participant B as Backend

    R->>L: @add
    L->>L: cherche l'entrée dans entriesByModelId
    alt entrée existante
        L->>C: @set-quantity(id, version courante, quantité + 1)
        C->>D: @set-quantity, relayé
        D->>E: editEntry(id, entrée)
        E->>B: PUT /entry/{id}
    else première saisie
        L->>C: @set-quantity(quantité 1)
        C->>D: @set-quantity, relayé
        D->>E: addEntry(entrée)
        E->>B: POST /entry
    end
    B-->>E: DTO avec la nouvelle version
    E->>E: met à jour entries avec le DTO
    E-->>D: DTO
    D-->>L: nouveau :entries via CategorySelection, entriesByModelId recalculée
    D->>D: onEntriesChanged() : résumés, le modal reste ouvert
```

### Session expirée

```mermaid
sequenceDiagram
    participant C as Composable
    participant F as customFetch
    participant S as store auth
    participant R as router
    participant H as HomeView
    participant N as useNotification
    participant B as Backend

    C->>F: appel API
    F->>B: requête avec Authorization: Bearer
    B-->>F: 401 ou 403
    F->>S: clear()
    F->>R: push(login, redirect = route courante)
    F-->>C: ApiError
    C->>N: notifyError ou notify (notification ErrorView)
    R->>H: démontage à la fin de la navigation
    H->>H: resetModels()
```

Le test `auth.isAuthenticated` dans `customFetch` évite une redirection par requête en cours : seule la première réponse 401 ou 403 vide la session.

## 9. Points d'attention

- **Import circulaire.** Il est sans effet aujourd'hui, car `router` et `customFetch` ne sont utilisés qu'à l'intérieur de fonctions, à l'exécution. Il ne faut donc pas les utiliser au niveau module dans ces fichiers.

  ```mermaid
  flowchart LR
      fetch["api/fetch-instance.ts"] --> router["router/index.ts"]
      router --> home["HomeView"]
      home --> auth["useAuth"]
      auth --> generated["api/generated.ts"]
      generated --> fetch
  ```

- **La saisie attend le chargement des entrées.** `DayView` n'affiche le bouton « + » qui ouvre le modal que lorsque `loaded` est vrai. Sans cela, le « + » d'un modèle food enverrait un `POST` au lieu d'un `PUT` pour un modèle déjà saisi. Si le chargement échoue, le bouton reste masqué jusqu'au rechargement de la page.
- **Les écritures dépendent du DTO renvoyé.** La liste n'est pas rechargée après une écriture : le backend doit continuer à renvoyer `model` et `version` dans ses réponses à `POST` et `PUT`.
- **Deux clics très rapides sur « + »** partent avec la même `version` si le premier n'a pas encore reçu sa réponse. Le second est alors signalé en erreur.
- **`useAuth` ne suit pas la convention d'erreurs.** `doLogin` laisse remonter l'`ApiError` et renvoie un booléen. C'est `LoginView` qui attrape l'erreur.
- **`removeEntry` renvoie un booléen**, alors que les autres mutations renvoient le DTO ou `undefined`.
- **Fonctions générées inutilisées.** `getModel`, `updateModel` et `deleteModel` sont générées mais jamais appelées.
