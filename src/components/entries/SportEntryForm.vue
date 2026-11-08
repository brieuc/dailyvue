<template>
  <div class="bordered-box">
    Sport Model
    <select v-model="modelId">
      <option v-for="model in sportModels" :key="model.id" :value="model.id">{{ model.title }}</option>
    </select>
    <p>Title &nbsp;<input v-model="title" type="text"></p>
    <p>Description<textarea v-model="description" rows="5" cols="33"></textarea></p>
    <p>Calories &nbsp;<input v-model.number="kcal" type="text"></p>
    <p>Duration &nbsp;<input v-model.number="duration" type="text"></p>
    <p>
      Aerobic
      <select v-model="aerobic">
        <option v-for="value in INTENSITIES" :key="value" :value="value">{{ value }}</option>
      </select>
    </p>
    <p>
      Anaerobic
      <select v-model="anaerobic">
        <option v-for="value in INTENSITIES" :key="value" :value="value">{{ value }}</option>
      </select>
    </p>
    <p>
      benefit
      <select v-model="benefit">
        <option v-for="value in BENEFITS" :key="value" :value="value">{{ value }}</option>
      </select>
    </p>
    <p><button @click="submit">{{ entry ? 'Update Entry' : 'Add Entry' }}</button></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EntrySportDto, EntrySportDtoAllOfBenefit } from '@/api/generated'
import { useModels } from '@/composables/useModels'
import type { SportEntry } from '@/types/entries'

const BENEFITS: EntrySportDtoAllOfBenefit[] = ['base', 'anaerobie', 'sprint', 'tempo', 'vo2max']
// De 0 à 5 par pas de 0.1
const INTENSITIES = Array.from({ length: 51 }, (_, index) => index / 10)

const props = defineProps<{
  date: string
  entry?: SportEntry
}>()
const emit = defineEmits<{ submit: [entry: EntrySportDto] }>()

const { sportModels } = useModels()

const modelId = ref(props.entry?.model?.id ?? props.entry?.modelId)
const title = ref(props.entry?.title)
const description = ref(props.entry?.description)
const kcal = ref(props.entry?.kcal)
const duration = ref(props.entry?.duration)
const aerobic = ref(props.entry?.aerobic)
const anaerobic = ref(props.entry?.anaerobic)
const benefit = ref(props.entry?.benefit)

const submit = () => {
  // Les champs vides partent tels quels : la validation reste celle du backend.
  emit('submit', {
    ...(props.entry && { id: props.entry.id, version: props.entry.version }),
    title: title.value,
    description: description.value,
    date: props.date,
    kcal: kcal.value,
    duration: duration.value,
    aerobic: aerobic.value,
    anaerobic: anaerobic.value,
    benefit: benefit.value,
    modelId: modelId.value,
    type: 'SPORT',
  } as EntrySportDto)
}
</script>
