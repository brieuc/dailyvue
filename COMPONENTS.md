# Flux de données entre composants

Carte des liens parent → enfant : qui **fournit** la donnée et qui la **lit**.
À tenir à jour quand un `defineProps`, `defineModel` ou `defineEmits` change.

Légende :
- `:prop` → lecture seule côté enfant
- `v-model[:nom]` → bidirectionnel, l'enfant **écrit** via `defineModel`
- `@event` → l'enfant notifie le parent, qui réagit

## État partagé ou local

| Composable | État | Conséquence |
|---|---|---|
| `useModels()` | module (singleton) | Les listes de modèles sont chargées par `HomeView` à son montage et lues par les formulaires |
| `useNotification()` | module (singleton) | `ErrorView` affiche les messages de toute l'app. `tone` : `success` (s'efface seul) ou `error` (reste jusqu'à fermeture) |
| `usePeriods()` | local à chaque appel | Appelé uniquement par `HomeView` |
| `useEntries()` | local à chaque appel | Chaque `DayView` possède ses entrées, tenues à jour avec les réponses de l'API |
| `useSummary()` | local à chaque appel | Un résumé par `PeriodView` et par `DayView` |
| `useAuth()` | store Pinia `auth` | Token persisté dans le localStorage (clé `token`) |

`HomeView` remet à zéro `useModels` quand on la quitte : c'est la seule route protégée, donc la quitter signifie déconnexion ou session expirée.

## Arbre

```
App
├── ErrorView
└── RouterView
    ├── LoginView                       route /login
    └── HomeView                        route / (requiresAuth)
        └── PeriodView (×N)             :start-date :loaded
            ├── PeriodSummary           :from-date :to-date :summary
            └── DayView (×jours)        :date v-model:expanded @entries-changed
                ├── ModalDialog         :title @close                      (bouton « + »)
                │   └── CategorySelection :date :entries @set-quantity @submit
                │       ├── FoodEntryPicker :date :entries @set-quantity   (onglet Food)
                │       │   └── FoodModelRow :model :quantity @add @sub
                │       └── EntryForm   :date :category @submit            (onglets Sport, Free)
                ├── DaySummary          :summary
                └── EntryList           :entries :editing-entry-id @edit @delete @create-model
                    ├── SportEntryCard  :entry
                    ├── FreeEntryCard   :entry
                    ├── FoodEntryCard   :entry
                    └── #edit           slot rempli par DayView, à la place de la carte :
                        EntryForm       :date :entry @submit               (modification)

EntryForm
├── SportEntryForm                      :date :entry @submit
│   ├── IntensitySlider (×2)            v-model :label
│   └── ChoiceChips                     v-model :label :options   (bénéfice)
└── FreeEntryForm                       :date :entry @submit
    └── ChoiceChips                     v-model :label :options   (type d'aliment)
```

Tous les composants de saisie sont dans `src/components/entries/`. `ModalDialog` est générique et vit à la racine de `src/components/`.

## PeriodView (`src/components/periods/PeriodView.vue`)

Parent : `HomeView`. Une semaine.

- `showDays` : `loaded` (4 premières périodes, ou bouton « Charger toutes les entrées ») ou bouton local « Charger les données ».
- `expandedDay` (`string | null`) : un seul jour déplié par période. Transmis à chaque `DayView` par `v-model:expanded`.
- Le résumé de la semaine est rechargé à chaque `@entries-changed` d'un jour.

## DayView (`src/components/days/DayView.vue`)

Parent : `PeriodView`. Propriétaire des entrées du jour (`useEntries` local), chargées une seule fois au montage.

| État | Déclencheur | Affichage |
|---|---|---|
| `creating` (local) | bouton « + » de l'en-tête, affiché une fois les entrées chargées | `ModalDialog` contenant `CategorySelection` |
| `expanded` (`v-model`) | clic sur l'en-tête ou sur la liste, après chargement du résumé du jour | `DaySummary` et `EntryList` sous le jour |

Le modal et le détail sont indépendants : on peut saisir avec le détail ouvert, il se met à jour. Le clic sur « + » ne déplie pas le jour.

Toutes les écritures d'entrées passent par `persistEntry` : avec un `id` c'est une modification, sinon une création. `useEntries` met `entries` à jour avec le DTO renvoyé, sans rechargement. En cas de succès, `onEntriesChanged` émet `entries-changed` et recharge le résumé du jour s'il est affiché. `DayView` est le seul à déclarer des formulaires, et il détient leur état :

- `creating` : `submitNewEntry` ferme le modal après une création réussie par formulaire. La saisie food passe directement par `persistEntry` et garde le modal ouvert, pour enchaîner les « + ». Échap, le fond ou × ferment le modal.
- `editingEntryId` : entrée en cours de modification, ouverte par `@edit` de `EntryList`. `submitEditedEntry` la remet à `null` après un enregistrement réussi, et elle est aussi remise à `null` quand le jour est replié.

En cas d'échec, le formulaire reste ouvert avec la saisie.

« Create Model » : `EntryList` émet `@create-model` et `DayView` appelle `addFoodModelFromEntry`.

## ModalDialog (`src/components/ModalDialog.vue`)

Modal générique, téléporté dans `<body>`. `:title` et un slot par défaut. Émet `@close` sur Échap, sur un clic sur le fond et sur ×. Le parent le monte avec `v-if` et le démonte sur `@close` : le contenu repart donc de zéro à chaque ouverture.

## CategorySelection (`src/components/entries/CategorySelection.vue`)

Saisie des entrées d'un jour, contenu du modal. Détient l'onglet courant (`food` par défaut) et affiche en dessous `FoodEntryPicker` ou `EntryForm`. Ne fait que relayer `@set-quantity` et `@submit` : aucun composable, aucun appel API.

## FoodEntryPicker (`src/components/entries/FoodEntryPicker.vue`)

Affiche un champ de recherche au-delà de 8 modèles. Chaque `FoodModelRow` reçoit la quantité déjà saisie et désactive « − » à zéro.

Composant sans écriture : `entriesByModelId` est calculée depuis `:entries`, donc « + » et « − » lisent toujours la dernière `version`. Chaque clic émet `@set-quantity` avec l'entrée à enregistrer, relayé par `CategorySelection` jusqu'à `DayView`, qui l'envoie à l'API.

## EntryList (`src/components/entries/EntryList.vue`)

Composant présentationnel : aucun composable, aucun formulaire importé. Chaque entrée est affichée par la carte de son type (`SportEntryCard`, `FreeEntryCard`, `FoodEntryCard`, `:entry` seule) ; `EntryList` ajoute les boutons d'action autour.

- `:editing-entry-id` : l'entrée correspondante est remplacée par le slot `#edit`, qui reçoit `{ entry }` typé `EditableEntry` (sport ou free).
- `@edit(entry)`, `@delete(entry)`, `@create-model(entry)` : le parent décide.
- Les entrées food n'ont pas de bouton « Edit » : leur quantité se règle dans `FoodEntryPicker`.

## Style

- `src/assets/main.css` porte les jetons (couleurs, rayons, ombres), inspirés du thème clair de cashvue, et les primitives partagées : `.card`, `.btn` (`-primary`, `-secondary`, `-ghost`, `-danger`, `-sm`, `-icon`, `-block`), `.field`, `.field-label`, `.field-row`, `.input`, `.input-unit`, `.segmented`, `.stats`/`.stat`, `.dot` (`food`, `sport`, `free`), `.entry-form`, `.entry-card`.
- Les composants n'utilisent que des `var(--…)` et ces primitives ; leurs ajustements restent en `<style scoped>`. Pas de style inline.

## Champs réutilisables

- `ChoiceChips` (`src/components/`) : choix unique parmi quelques valeurs, `v-model` typé par `generic`. Un second clic désélectionne (`undefined`).
- `IntensitySlider` (`src/components/entries/`) : curseur de 0 à 5 par pas de 0,1. Tant qu'on n'y touche pas, la valeur reste `undefined` et s'affiche « — ».

## Formulaires (`EntryForm`, `SportEntryForm`, `FreeEntryForm`)

- `EntryForm` choisit le formulaire : selon `:category` pour une création, selon le type de `:entry` pour une modification.
- `:entry` absent = création, présent = modification.
- Chaque formulaire est un `<form>` : « Ajouter » / « Enregistrer » et la touche Entrée émettent `@submit`.
- Le modèle est présélectionné à la création (premier modèle sport ou free).
- `@submit(payload)` : le formulaire n'appelle jamais l'API, et ne se ferme pas lui-même. C'est `DayView` qui le retire après un enregistrement réussi (fermeture du modal, ou fin de la modification).

## Erreurs

`customFetch` lève une `ApiError` si la réponse n'est pas `ok`. Les composables l'attrapent et alimentent `useNotification`. Les mutations renvoient le DTO, ou `undefined` en cas d'échec.

Un 401 ou 403 hors `/auth/login` vide la session et redirige vers `/login?redirect=…`.
