<template>
  <form class="entry-form" @submit.prevent="submit">
    <label class="field">
      <span class="field-label">Modèle</span>
      <select v-model="modelId" class="input">
        <option v-for="model in freeModels" :key="model.id" :value="model.id">{{ model.title }}</option>
      </select>
    </label>

    <label class="field">
      <span class="field-label">Titre</span>
      <input v-model="title" type="text" class="input">
    </label>

    <label class="field">
      <span class="field-label">Description</span>
      <textarea v-model="description" class="input" rows="4"></textarea>
    </label>

    <template v-if="isFreeFood">
      <div class="field">
        <span class="field-label">Type d'aliment</span>
        <ChoiceChips v-model="foodType" label="Type d'aliment" :options="FOOD_TYPES" />
      </div>
      <label class="field">
        <span class="field-label">Calories</span>
        <span class="input-unit">
          <input v-model.number="kcal" type="number" inputmode="numeric" min="0" class="input">
          <span class="unit">kcal</span>
        </span>
      </label>
    </template>

    <button type="submit" class="btn btn-primary btn-block">{{ entry ? 'Enregistrer' : 'Ajouter' }}</button>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { EntryFreeFoodDtoAllOfFoodType, type EntryFreeFoodDto } from '@/api/generated'
import ChoiceChips from '@/components/ChoiceChips.vue'
import { useModels } from '@/composables/useModels'
import { FOOD_TYPE_LABELS, type FreeEntry } from '@/types/entries'

const FREE_FOOD_MODEL_TITLE = 'Free Food'
const FOOD_TYPES = (Object.keys(FOOD_TYPE_LABELS) as EntryFreeFoodDtoAllOfFoodType[]).map((value) => ({
  value,
  label: FOOD_TYPE_LABELS[value],
}))

const props = defineProps<{
  date: string
  entry?: FreeEntry
}>()
const emit = defineEmits<{ submit: [entry: EntryFreeFoodDto] }>()

const { freeModels } = useModels()

const modelId = ref(props.entry?.model?.id ?? props.entry?.modelId ?? freeModels.value[0]?.id)
const title = ref(props.entry?.title)
const description = ref(props.entry?.description)
const foodType = ref(props.entry?.foodType)
const kcal = ref(props.entry?.kcal)

const isFreeFood = computed(
  () => freeModels.value.find((model) => model.id === modelId.value)?.title === FREE_FOOD_MODEL_TITLE,
)

const submit = () => {
  if (!modelId.value) return

  // Les champs vides partent tels quels : la validation reste celle du backend.
  emit('submit', {
    ...(props.entry && { id: props.entry.id, version: props.entry.version }),
    title: title.value,
    description: description.value,
    date: props.date,
    modelId: modelId.value,
    type: isFreeFood.value ? 'FREE_FOOD' : 'FREE',
    ...(isFreeFood.value && { foodType: foodType.value, kcal: kcal.value }),
  } as EntryFreeFoodDto)
}
</script>
