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

- Aucun composant n'appelle l'API. Les imports de `api/generated` dans `components/` sont uniquement des types.
- Il n'y a pas de couche service : les composables appellent directement `api/generated`.
- `types/entries.ts` et `utils/dates.ts` n'ont aucune dépendance vers les couches supérieures. Ils ne figurent pas sur le schéma pour le garder lisible.

| Module | Utilisé par |
|---|---|
| `types/entries.ts` | `useEntries` (`EntryInput`, `isFoodEntry`), `DayView`, `CategorySelection`, `EntryList`, `ChoiceChips` (`ChoiceOption`), `SportEntryCard`, `FreeEntryCard`, `FoodEntryCard` (libellés `FOOD_TYPE_LABELS`, `BENEFIT_LABELS`, `SPORT_LABELS`), `SportEntryForm`, `FreeEntryForm` (`BENEFIT_OPTIONS`, `FOOD_TYPE_OPTIONS`) |
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
    PeriodSummary --> StatGrid
    DayView --> DaySummary
    DaySummary --> StatGrid
    DayView --> EntryList
    EntryList --> SportEntryCard
    EntryList --> FreeEntryCard
    EntryList --> FoodEntryCard
    DayView -- "« + » ou « Modifier »" --> ModalDialog
    ModalDialog -. "slot fourni par DayView" .-> CategorySelection
    CategorySelection -- "Food" --> FoodEntryPicker
    FoodEntryPicker -- "× modèles" --> FoodModelRow
    CategorySelection -- "Sport" --> SportEntryForm
    CategorySelection -- "Free" --> FreeEntryForm
    SportEntryForm --> IntensitySlider
    SportEntryForm --> ChoiceChips
    FreeEntryForm --> ChoiceChips

    classDef view fill:#dbeafe,stroke:#1d4ed8,color:#111
    classDef smart fill:#dcfce7,stroke:#15803d,color:#111
    classDef dumb fill:#f3f4f6,stroke:#6b7280,color:#111
    class LoginView,HomeView view
    class ErrorView,PeriodView,DayView,FoodEntryPicker,SportEntryForm,FreeEntryForm smart
    class PeriodSummary,DaySummary,StatGrid,ModalDialog,ChoiceChips,IntensitySlider,CategorySelection,FoodModelRow,EntryList,SportEntryCard,FreeEntryCard,FoodEntryCard dumb
```

Bleu : views. Vert : composants qui utilisent au moins un composable. Gris : composants purement présentationnels, qui ne dépendent que de leurs props.

Toute la saisie passe par un seul `ModalDialog`, ouvert par le « + » de l'en-tête (création) ou par « Modifier » d'`EntryList` (modification). Il contient `CategorySelection`, seul parent de `FoodEntryPicker`, `SportEntryForm` et `FreeEntryForm`. En modification, `CategorySelection` masque ses onglets et affiche le formulaire de la catégorie de l'entrée.

`EntryList` n'affiche que des cartes et émet des événements : aucun formulaire n'y est injecté.

La flèche en pointillés indique un contenu de slot : l'emplacement à l'écran, pas une dépendance. `ModalDialog` ne connaît pas `CategorySelection`.

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
| `ErrorView` | `useNotification` | `message`, `tone`, `clear` (affichage seul, le minuteur est dans le composable) |
| `PeriodView` | `useSummary` | `summary`, `fetchSummary` |
| `DayView` | `useEntries` | `entries`, `loaded`, `foodQuantities`, `fetchEntries`, `saveEntry`, `removeEntry`, `setFoodQuantity` |
| | `useSummary` | `summary`, `loaded`, `fetchSummary` |
| | `useModels` | `addFoodModelFromEntry` |
| `FoodEntryPicker` | `useModels` | `foodModels` |
| `SportEntryForm` | `useModels` | `sportModels` |
| `FreeEntryForm` | `useModels` | `freeModels` |

`App`, `PeriodSummary`, `DaySummary`, `StatGrid`, `ModalDialog`, `ChoiceChips`, `IntensitySlider`, `CategorySelection`, `FoodModelRow`, `EntryList` et les trois cartes d'entrée n'utilisent aucun composable.

## 4. Dépendances des composables

```mermaid
flowchart LR
    data["useEntries<br/>useModels<br/>usePeriods<br/>useSummary"] --> useNotification
    data --> api["api/generated.ts"]
    useAuth --> api
    useAuth --> store["stores/auth.ts"]
    useAuth --> router["router/index.ts"]
    api --> fetch["api/fetch-instance.ts"]
    fetch --> store
    router --> store
```

`useNotification` est le seul composable utilisé par d'autres composables, et il ne dépend de rien. Les quatre composables de données passent tous par son `run(appel, { success?, error? })` : un chargement en échec affiche `LOAD_ERROR`, une écriture affiche le message de l'erreur ou son message de succès. `useAuth` ne l'utilise pas : `doLogin` renvoie un booléen et `LoginView` affiche « Identifiants refusés ».

Le routeur et `customFetch` lisent directement le store `auth`, sans passer par `useAuth`. `useAuth.logout` vide la session puis redirige vers `/login`.

| Composable | Portée de l'état | Fonction de l'API | Endpoint |
|---|---|---|---|
| `useAuth` | store Pinia `auth` | `login` | `POST /auth/login` |
| `usePeriods` | local à chaque appel | `getFirstDate` | `GET /entry/firstDate` |
| | | `getRelevantDates` | `GET /entry/get/{date}` |
| `useModels` | module | `getFoodModels` | `GET /model/food` |
| | | `getSportModels` | `GET /model/sport` |
| | | `getFreeModels` | `GET /model/free` |
| | | `createModel` | `POST /model` |
| `useEntries(date)` | local à chaque appel | `getEntries` | `GET /entry/{date}` |
| | | `createEntry` | `POST /entry` |
| | | `updateEntry` | `PUT /entry/{id}` |
| | | `deleteEntry` | `DELETE /entry/{id}` |
| `useSummary(from, to)` | local à chaque appel | `getSummaryInfo` | `GET /entry/summary-info` |
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
            fml["FoodEntryPicker<br/>reçoit foodQuantities du lundi<br/>par ses props"]
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
- Les entrées d'un jour n'ont qu'une source : le `useEntries(date)` de `DayView`, chargé une fois au montage puis mis à jour avec chaque DTO renvoyé par l'API. `foodQuantities` en est dérivé.
- L'affichage des jours d'une semaine n'a qu'une source : `period.loaded` dans `usePeriods`, lié à `PeriodView` par `v-model:loaded`. « Charger toutes les entrées » disparaît donc dès que toutes les semaines sont chargées, même une par une.
- `ErrorView` est hors du `RouterView`, donc la notification reste visible lors d'un changement de route. `HomeView` l'efface à son montage. `notify(texte)` est un succès, qui s'efface seul au bout de 2,5 s (le minuteur est dans `useNotification`) ; `notifyError` et `notify(texte, 'error')` restent affichés jusqu'à ce qu'on les ferme.

## 6. Props et événements

Chaque flèche relie un parent, à gauche, à son enfant. Sur les libellés, `→` indique les données transmises par le parent, `←` les événements émis par l'enfant et `↔` un `v-model`.

```mermaid
flowchart LR
    HomeView <-->|"→ :start-date<br/>↔ v-model:loaded"| PeriodView
    PeriodView -->|"→ :from-date :to-date :summary"| PeriodSummary
    PeriodView <-->|"→ :date<br/>↔ v-model:expanded<br/>← @entries-changed"| DayView
```

```mermaid
flowchart LR
    DayView <-->|"→ :title<br/>← @close"| ModalDialog
    DayView <-->|"dans le slot du modal<br/>→ :entry? :food-quantities<br/>← @set-food-quantity @submit"| CategorySelection
    CategorySelection <-->|"→ :quantities<br/>← @set-quantity(model, quantité)"| FoodEntryPicker
    FoodEntryPicker <-->|"→ :model<br/>↔ v-model:quantity"| FoodModelRow
    CategorySelection <-->|"→ :entry?<br/>← @submit(EntryInput)"| Forms["SportEntryForm<br/>FreeEntryForm"]
    Forms <-->|"↔ v-model<br/>→ :label :options"| ChoiceChips
    Forms <-->|"↔ v-model<br/>→ :label"| IntensitySlider
    DayView -->|"→ :summary"| DaySummary
    DayView <-->|"→ :entries<br/>← @edit @delete @create-model"| EntryList
    EntryList -->|"→ :entry"| Cards["SportEntryCard<br/>FreeEntryCard<br/>FoodEntryCard"]
    DaySummary -->|"→ :stats"| StatGrid
```

`DayView` centralise toutes les écritures : les formulaires, `FoodEntryPicker` et `EntryList` émettent, `CategorySelection` relaie, `DayView` appelle `useEntries`, ou `useModels` pour « Créer un modèle ».

Aucun composant de saisie ne connaît la date ni les entrées du jour : les formulaires émettent un `EntryInput` sans date, `FoodEntryPicker` un modèle et une quantité. `useEntries(date)` ajoute la date, choisit entre création et mise à jour selon la présence d'un `id`, et retrouve l'entrée food d'un modèle avec sa dernière `version`.

`DayView` détient aussi l'ouverture du modal (`dialog`). Il ne se referme qu'après un enregistrement réussi par formulaire, si bien qu'une saisie refusée par le backend reste à l'écran. La saisie food garde le modal ouvert. L'onglet courant, lui, est local à `CategorySelection` et repart sur Food à chaque ouverture en création.

## 7. États d'un jour

Un jour a deux états indépendants.

- **Détail** (`expanded`) : `PeriodView` détient `expandedDay`, qui garantit qu'un seul jour est déplié par semaine. `DayView` le lit et l'écrit via `defineModel('expanded')`.
- **Saisie** (`dialog`) : local à `DayView`, `null` (fermé), `{}` (création) ou `{ entry }` (modification). Le modal est modal, donc un seul est ouvert à la fois dans toute l'application.

Détail :

```mermaid
stateDiagram-v2
    [*] --> Replie
    Replie --> Deplie: clic sur l'en-tête ou la liste (charge le résumé)
    Deplie --> Replie: même clic, ou autre jour déplié
    Replie: replié
    Deplie: déplié (DaySummary + EntryList)
```

Saisie :

```mermaid
stateDiagram-v2
    [*] --> Ferme
    Ferme --> Creation: bouton +, entrées chargées
    Ferme --> Modification: « Modifier » d'une entrée sport ou free
    Creation --> Ferme: Échap, fond, ×, ou formulaire enregistré
    Modification --> Ferme: Échap, fond, ×, ou formulaire enregistré
    Creation --> Creation: + ou − food enregistré
    Ferme: modal fermé
    Creation: création (onglets Food, Sport, Free)
    Modification: modification (formulaire de l'entrée, sans onglets)
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
        F-->>A: ApiError
        A-->>L: false
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
    opt period.loaded (4 premières, ou bouton qui écrit v-model:loaded)
        PV->>D: rendu d'un DayView par jour écoulé
        D->>B: GET /entry/{date}
    end
```

### Enregistrement d'une entrée sport ou free

```mermaid
sequenceDiagram
    participant Form as SportEntryForm / FreeEntryForm
    participant D as DayView
    participant E as useEntries(date)
    participant N as useNotification
    participant PV as PeriodView
    participant B as Backend

    Form->>D: @submit(EntryInput, sans date), relayé par CategorySelection
    D->>E: saveEntry(entrée)
    E->>E: ajoute la date du jour
    alt entrée avec id
        E->>B: PUT /entry/{id}
    else entrée sans id
        E->>B: POST /entry
    end
    alt succès
        B-->>E: DTO enregistré
        E->>N: notify(message de succès)
        E->>E: met à jour entries avec le DTO
        E-->>D: DTO
        D->>D: ferme le modal
        D->>PV: @entries-changed
        PV->>B: GET /entry/summary-info (semaine)
        opt jour déplié
            D->>B: GET /entry/summary-info (jour), via useSummary
        end
    else échec
        B-->>E: erreur HTTP
        E->>N: message de l'erreur, via run
        E-->>D: undefined, rien n'est rechargé et le modal reste ouvert
    end
```

### « + » sur un modèle food

```mermaid
sequenceDiagram
    participant R as FoodModelRow
    participant L as FoodEntryPicker
    participant C as CategorySelection
    participant D as DayView
    participant E as useEntries(date)
    participant B as Backend

    R->>L: update:quantity(quantité + 1)
    L->>C: @set-quantity(model, quantité)
    C->>D: @set-food-quantity, relayé
    D->>E: setFoodQuantity(model, quantité)
    E->>E: cherche l'entrée du modèle
    alt entrée existante
        E->>B: PUT /entry/{id} avec la version courante
    else première saisie
        E->>B: POST /entry, titre et description du modèle
    end
    B-->>E: DTO avec la nouvelle version
    E->>E: met à jour entries, donc foodQuantities
    E-->>D: DTO
    D-->>L: nouveau :quantities via CategorySelection
    D->>D: afterWrite : @entries-changed et résumé du jour, le modal reste ouvert
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
    C->>N: run notifie l'erreur (ErrorView)
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
      auth --> router
      auth --> generated["api/generated.ts"]
      generated --> fetch
  ```

- **La saisie attend le chargement des entrées.** `DayView` n'affiche le bouton « + » qui ouvre le modal que lorsque `loaded` est vrai. Sans cela, le « + » d'un modèle food enverrait un `POST` au lieu d'un `PUT` pour un modèle déjà saisi. Si le chargement échoue, le bouton reste masqué jusqu'au rechargement de la page.
- **Les écritures dépendent du DTO renvoyé.** La liste n'est pas rechargée après une écriture : le backend doit continuer à renvoyer `model` et `version` dans ses réponses à `POST` et `PUT`.
- **Deux clics très rapides sur « + »** partent avec la même `version` si le premier n'a pas encore reçu sa réponse. Le second est alors signalé en erreur.
- **`removeEntry` renvoie un booléen**, alors que les autres mutations renvoient le DTO ou `undefined`.
- **Fonctions générées inutilisées.** `getModel`, `updateModel` et `deleteModel` sont générées mais jamais appelées.
