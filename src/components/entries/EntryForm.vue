<template>
  <SportEntryForm v-if="isSport" :date="date" :entry="sportEntry" @submit="emit('submit', $event)" />
  <FreeEntryForm v-else :date="date" :entry="freeEntry" @submit="emit('submit', $event)" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CreateEntryBody } from '@/api/generated'
import FreeEntryForm from '@/components/entries/FreeEntryForm.vue'
import SportEntryForm from '@/components/entries/SportEntryForm.vue'
import { isSportEntry, type EditableEntry, type FormCategory } from '@/types/entries'

// Création : `category` seule. Modification : `entry`, dont le type choisit le formulaire.
const props = defineProps<{
  date: string
  category?: FormCategory
  entry?: EditableEntry
}>()
const emit = defineEmits<{ submit: [entry: CreateEntryBody] }>()

const isSport = computed(() => (props.entry ? isSportEntry(props.entry) : props.category === 'sport'))
const sportEntry = computed(() => (props.entry && isSportEntry(props.entry) ? props.entry : undefined))
const freeEntry = computed(() => (props.entry && !isSportEntry(props.entry) ? props.entry : undefined))
</script>
