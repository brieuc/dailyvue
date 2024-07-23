<template>
      <div style="background-color: crimson; color: antiquewhite;">
            {{ dailyStore.errorMessage }}
      </div>
</template>

<script setup>
import { useDailyStore } from '@/dailyStore';
const dailyStore = useDailyStore();
</script>