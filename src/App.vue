<template>
  <ErrorView />
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorView from '@/components/ErrorView.vue'
</script>
