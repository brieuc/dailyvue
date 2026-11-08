<template>
      <div class="formatted" style="background-color: crimson; color: antiquewhite;">
            {{ dailyStore.errorMessage }}
      </div>
</template>

<script setup lang="ts">
import { useDailyStore } from '@/dailyStore';
const dailyStore = useDailyStore();
</script>

<style>
.formatted {
    white-space:pre-wrap;
}
</style>