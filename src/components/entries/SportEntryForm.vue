<template>
  <form class="entry-form" @submit.prevent="submit">
    <label class="field">
      <span class="field-label">Modèle</span>
      <select v-model="modelId" class="input">
        <option v-for="model in sportModels" :key="model.id" :value="model.id">{{ model.title }}</option>
      </select>
    </label>

    <label class="field">
      <span class="field-label">Titre</span>
      <input v-model="title" type="text" class="input">
    </label>

    <label class="field">
      <span class="field-label">Description</span>
      <textarea v-model="description" class="input" rows="3"></textarea>
    </label>

    <div class="field-row">
      <label class="field">
        <span class="field-label">Durée</span>
        <span class="input-unit">
          <input v-model.number="duration" type="number" inputmode="numeric" min="0" class="input">
          <span class="unit">min</span>
        </span>
      </label>
      <label class="field">
        <span class="field-label">Calories</span>
        <span class="input-unit">
          <input v-model.number="kcal" type="number" inputmode="numeric" min="0" class="input">
          <span class="unit">kcal</span>
        </span>
      </label>
    </div>

    <div class="field-row">
      <IntensitySlider v-model="aerobic" label="Aérobie" />
      <IntensitySlider v-model="anaerobic" label="Anaérobie" />
    </div>

    <div class="field">
      <span class="field-label">Bénéfice</span>
      <ChoiceChips v-model="benefit" label="Bénéfice" :options="BENEFITS" />
    </div>

    <button type="submit" class="btn btn-primary btn-block">{{ entry ? 'Enregistrer' : 'Ajouter' }}</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EntrySportDto, EntrySportDtoAllOfBenefit } from '@/api/generated'
import ChoiceChips from '@/components/ChoiceChips.vue'
import IntensitySlider from '@/components/entries/IntensitySlider.vue'
import { useModels } from '@/composables/useModels'
import { BENEFIT_LABELS, type SportEntry } from '@/types/entries'

const BENEFITS = (Object.keys(BENEFIT_LABELS) as EntrySportDtoAllOfBenefit[]).map((value) => ({
  value,
  label: BENEFIT_LABELS[value],
}))

const props = defineProps<{
  date: string
  entry?: SportEntry
}>()
const emit = defineEmits<{ submit: [entry: EntrySportDto] }>()

const { sportModels } = useModels()

const modelId = ref(props.entry?.model?.id ?? props.entry?.modelId ?? sportModels.value[0]?.id)
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
