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
| `useModels()` | module (singleton + `loaded`) | Les listes de modèles sont chargées une fois, par `HomeView` |
| `usePeriods()` | module (singleton + `loaded`) | Lu uniquement par `HomeView` |
| `useNotification()` | module (singleton) | Le bandeau `ErrorView` affiche les messages de toute l'app |
| `useEntries()` | local à chaque appel | Chaque `DayView` possède ses entrées |
| `useSummary()` | local à chaque appel | Un résumé par `PeriodView` et par `DayView` |
| `useAuth()` | store Pinia `auth` | Token persisté dans le localStorage (clé `token`) |

`HomeView` remet à zéro les singletons quand on la quitte : c'est la seule route protégée, donc la quitter signifie déconnexion ou session expirée.

## Arbre

```
App
├── ErrorView
└── RouterView
    ├── LoginView                       route /login
    └── HomeView                        route / (requiresAuth)
        └── PeriodView (×N)             :start-date :loaded
            ├── PeriodSummary           :from-date :to-date :summary
            └── DayView (×jours)        :date v-model:mode @entries-changed
                ├── ModelSelection      v-model=selectedCategory
                ├── FoodModelList       :date :entries @entries-changed
                │   └── FoodModelRow    :model @add @sub
                ├── SportEntryForm      :date @submit
                ├── FreeEntryForm       :date @submit
                ├── DaySummary          :summary
                └── EntryList           :entries @submit @delete
                    ├── SportEntryForm  :date :entry @submit
                    └── FreeEntryForm   :date :entry @submit
```

## PeriodView (`src/components/periods/PeriodView.vue`)

Parent : `HomeView`. Une semaine.

- `showDays` : `loaded` (4 premières périodes, ou bouton « Charger toutes les entrées ») ou bouton local « Charger les données ».
- `openDay` (`{ date, mode } | null`) : un seul jour ouvert par période. Transmis à chaque `DayView` par `v-model:mode`.
- Le résumé de la semaine est rechargé à chaque `@entries-changed` d'un jour.

## DayView (`src/components/days/DayView.vue`)

Parent : `PeriodView`. Propriétaire des entrées du jour (`useEntries` local), chargées au montage.

| `mode` | Déclencheur | Affichage |
|---|---|---|
| `'entering'` | clic sur l'en-tête | `ModelSelection` et formulaire de la catégorie |
| `'displaying'` | clic sur la liste, après chargement du résumé du jour | `DaySummary` et `EntryList` |
| `null` | second clic, ou autre jour ouvert | rien |

Toutes les écritures sport et free passent par `saveEntry` : avec un `id` c'est une modification, sinon une création. En cas de succès, `refresh` recharge les entrées, émet `entries-changed` et recharge le résumé du jour s'il est affiché.

## FoodModelList (`src/components/models/FoodModelList.vue`)

Seul composant qui écrit lui-même via `useEntries`, car « + » et « − » doivent connaître la dernière `version` renvoyée par l'API.
`entriesByModelId` est initialisée une seule fois depuis `:entries`, puis mise à jour avec les réponses de l'API. Un rechargement encore en cours ne peut donc pas réintroduire une ancienne version.

## Formulaires (`SportEntryForm`, `FreeEntryForm`)

- `:entry` absent = création, présent = modification.
- `@submit(payload)` : le formulaire n'appelle jamais l'API.
- Le formulaire de `EntryList` se ferme quand `:entries` change, donc seulement après un enregistrement réussi.

## Erreurs

`customFetch` lève une `ApiError` si la réponse n'est pas `ok`. Les composables l'attrapent et alimentent `useNotification`. Les mutations renvoient le DTO, ou `undefined` en cas d'échec.

Un 401 ou 403 hors `/auth/login` vide la session et redirige vers `/login?redirect=…`.
