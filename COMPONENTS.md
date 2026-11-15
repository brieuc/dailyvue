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
| `useNotification()` | module (singleton) | `ErrorView` affiche les messages de toute l'app. `tone` : `success` (s'efface seul au bout de 2,5 s, minuteur dans le composable) ou `error` (reste jusqu'à fermeture) |
| `usePeriods()` | local à chaque appel | Appelé uniquement par `HomeView`. `period.loaded` est la seule source de vérité de l'affichage des jours |
| `useEntries(date)` | local à chaque appel | Chaque `DayView` possède les entrées de son jour, tenues à jour avec les réponses de l'API |
| `useSummary(from, to)` | local à chaque appel | Un résumé par `PeriodView` et par `DayView` |
| `useAuth()` | store Pinia `auth` | Token persisté dans le localStorage (clé `token`). `logout` redirige vers `/login` |

`useEntries` et `useSummary` reçoivent leurs dates à la création : les composants qui les appellent sont indexés par date (`:key`), donc ces dates ne changent pas.

`HomeView` remet à zéro `useModels` quand on la quitte : c'est la seule route protégée, donc la quitter signifie déconnexion ou session expirée.

## Arbre

```
App
├── ErrorView
└── RouterView
    ├── LoginView                       route /login
    └── HomeView                        route / (requiresAuth)
        └── PeriodView (×N)             :start-date v-model:loaded
            ├── PeriodSummary           :from-date :to-date :summary
            │   └── StatGrid            :stats
            └── DayView (×jours)        :date v-model:expanded @entries-changed
                ├── DaySummary          :summary
                │   └── StatGrid        :stats
                ├── EntryList           :entries @edit @delete @create-model
                │   ├── SportEntryCard  :entry
                │   ├── FreeEntryCard   :entry
                │   └── FoodEntryCard   :entry
                └── ModalDialog         :title @close             (« + » ou « Modifier »)
                    └── CategorySelection :entry? :food-quantities @set-food-quantity @submit
                        ├── FoodEntryPicker :quantities @set-quantity          (Food)
                        │   └── FoodModelRow :model v-model:quantity
                        ├── SportEntryForm  :entry? @submit                    (Sport)
                        │   ├── IntensitySlider (×2) v-model :label
                        │   └── ChoiceChips v-model :label :options   (bénéfice)
                        └── FreeEntryForm   :entry? @submit                    (Free)
                            └── ChoiceChips v-model :label :options   (type d'aliment)
```

Tous les composants de saisie sont dans `src/components/entries/`. `ModalDialog`, `ChoiceChips` et `StatGrid` sont génériques et vivent à la racine de `src/components/`.

## PeriodView (`src/components/periods/PeriodView.vue`)

Parent : `HomeView`. Une semaine.

- `v-model:loaded` : les jours ne sont affichés que si la période est chargée. Les 4 premières le sont d'office, les autres par le bouton « Charger les données » (qui écrit `loaded`) ou par « Charger toutes les entrées » de `HomeView`. L'état vit dans `usePeriods`, `HomeView` le lie avec `v-model:loaded="period.loaded"`.
- `expandedDay` (`string | null`) : un seul jour déplié par période. Transmis à chaque `DayView` par `v-model:expanded`.
- Le résumé de la semaine est rechargé à chaque `@entries-changed` d'un jour.

## DayView (`src/components/days/DayView.vue`)

Parent : `PeriodView`. Propriétaire des entrées du jour (`useEntries(date)`), chargées une seule fois au montage.

| État | Déclencheur | Affichage |
|---|---|---|
| `dialog` (local) : `null`, `{}` ou `{ entry }` | « + » de l'en-tête (création, affiché une fois les entrées chargées) ou « Modifier » d'`EntryList` | `ModalDialog` contenant `CategorySelection` |
| `expanded` (`v-model`) | clic sur l'en-tête ou sur la liste | `DaySummary` et `EntryList` sous le jour |

Le résumé du jour est chargé quand le jour se déplie (`watch(expanded)`), et `DaySummary` n'apparaît qu'une fois ce premier chargement fait. Le modal et le détail sont indépendants : le clic sur « + » ne déplie pas le jour.

Toutes les écritures passent par `useEntries`, et `afterWrite` réagit aux succès : émission de `entries-changed`, et rechargement du résumé du jour s'il est déplié.

- `submitEntry` : `saveEntry` crée (sans `id`) ou met à jour (avec `id`), puis ferme le modal en cas de succès. En cas d'échec, le modal reste ouvert avec la saisie.
- `setFoodQuantity` : chaque « + » ou « − » est enregistré tout de suite et le modal reste ouvert, pour enchaîner.
- `deleteEntry`, et « Créer un modèle » (`addFoodModelFromEntry`).

Échap, le fond ou × ferment le modal, ce qui abandonne une saisie en cours.

## ModalDialog (`src/components/ModalDialog.vue`)

Modal générique, téléporté dans `<body>`. `:title` et un slot par défaut. Émet `@close` sur Échap, sur un clic sur le fond et sur ×. Le parent le monte avec `v-if` et le démonte sur `@close` : le contenu repart donc de zéro à chaque ouverture.

## CategorySelection (`src/components/entries/CategorySelection.vue`)

Contenu du modal. Sans `:entry`, c'est une création : il affiche les onglets Food, Sport et Free (Food par défaut). Avec `:entry`, c'est une modification : l'onglet est celui de l'entrée et les onglets sont masqués, une entrée ne changeant pas de catégorie. Affiche `FoodEntryPicker`, `SportEntryForm` ou `FreeEntryForm` et ne fait que relayer leurs événements : aucun composable, aucun appel API.

## FoodEntryPicker (`src/components/entries/FoodEntryPicker.vue`)

Affiche un champ de recherche au-delà de 8 modèles. Reçoit `:quantities` (quantité saisie par id de modèle, calculée par `useEntries.foodQuantities`) et émet `@set-quantity(model, quantité)`. Il ne connaît ni les entrées ni leur `version` : c'est `useEntries.setFoodQuantity` qui choisit entre création et mise à jour, avec la dernière version connue.

`FoodModelRow` expose sa quantité par `v-model:quantity` : « + » et « − » proposent la nouvelle valeur, le parent l'enregistre. « − » est désactivé à zéro.

## EntryList (`src/components/entries/EntryList.vue`)

Composant présentationnel : aucun composable, aucun formulaire. Chaque entrée est affichée par la carte de son type (`SportEntryCard`, `FreeEntryCard`, `FoodEntryCard`, `:entry` seule) ; `EntryList` ajoute les boutons d'action autour.

- `@edit(entry)`, `@delete(entry)`, `@create-model(entry)` : le parent décide.
- Les entrées food n'ont pas de bouton « Modifier » : leur quantité se règle dans `FoodEntryPicker`.

## Style

- `src/assets/main.css` porte les jetons (couleurs, rayons, ombres), inspirés du thème clair de cashvue, et les primitives partagées : `.card`, `.btn` (`-primary`, `-secondary`, `-ghost`, `-danger`, `-sm`, `-icon`, `-block`), `.field`, `.field-label`, `.field-row`, `.input`, `.input-unit`, `.segmented`, `.stats`/`.stat`, `.dot` (`food`, `sport`, `free`), `.entry-form`, `.entry-card`.
- Les composants n'utilisent que des `var(--…)` et ces primitives ; leurs ajustements restent en `<style scoped>`. Pas de style inline.

## Composants réutilisables

- `ChoiceChips` (`src/components/`) : choix unique parmi quelques valeurs, `v-model` typé par `generic`. Un second clic désélectionne (`undefined`). Les options viennent de `FOOD_TYPE_OPTIONS` et `BENEFIT_OPTIONS` (`types/entries.ts`).
- `IntensitySlider` (`src/components/entries/`) : curseur de 0 à 5 par pas de 0,1. Tant qu'on n'y touche pas, la valeur reste `undefined` et s'affiche « — ».
- `StatGrid` (`src/components/`) : grille de statistiques `{ label, value, unit? }`. Le nombre de colonnes se règle par une classe posée par le parent (`.day-stats`, `.period-stats`).

## Formulaires (`SportEntryForm`, `FreeEntryForm`)

- `:entry` absent = création, présent = modification.
- Chaque formulaire est un `<form>` : « Ajouter » / « Enregistrer » et la touche Entrée émettent `@submit`.
- Le modèle est présélectionné à la création (premier modèle sport ou free). Sans modèle, le bouton est désactivé et rien n'est émis.
- `@submit(EntryInput)` : l'entrée n'a pas de date, `useEntries` y ajoute celle de son jour. Le formulaire n'appelle jamais l'API et ne se ferme pas lui-même : `DayView` ferme le modal après un enregistrement réussi.

## Erreurs

`customFetch` lève une `ApiError` si la réponse n'est pas `ok`. Les composables passent tous par `useNotification().run(appel, { success?, error? })`, qui attrape l'erreur, notifie et renvoie `undefined`. Règle : un chargement affiche `LOAD_ERROR` (« Erreur lors du chargement des données »), une écriture affiche le message de l'erreur et, en cas de succès, son message de succès.

Les mutations renvoient le DTO, ou `undefined` en cas d'échec ; `removeEntry` renvoie un booléen. `useAuth.doLogin` renvoie `true` ou `false` sans lever.

Un 401 ou 403 hors `/auth/login` vide la session et redirige vers `/login?redirect=…`.
