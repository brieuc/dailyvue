<template>
  <div class="bordered-box">
    <p>
      Model
      <select v-model="modelId">
        <option v-for="model in freeModels" :key="model.id" :value="model.id">{{ model.title }}</option>
      </select>
    </p>
    <p>Title &nbsp;<input v-model="title" type="text"></p>
    <p>Description<textarea v-model="description" rows="5" cols="33"></textarea></p>
    <p v-if="isFreeFood">
      Food type
      <select v-model="foodType">
        <option v-for="value in FOOD_TYPES" :key="value" :value="value">{{ value }}</option>
      </select>
    </p>
    <p v-if="isFreeFood">Calories &nbsp;<input v-model.number="kcal" type="text"></p>
    <p><button @click="submit">{{ entry ? 'Update Entry' : 'Add Entry' }}</button></p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { EntryFreeFoodDtoAllOfFoodType, type EntryFreeFoodDto } from '@/api/generated'
import { useModels } from '@/composables/useModels'
import type { FreeEntry } from '@/types/entries'

const FREE_FOOD_MODEL_TITLE = 'Free Food'
const FOOD_TYPES = Object.values(EntryFreeFoodDtoAllOfFoodType)

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
