<template>
  <error-view></error-view>
  
  <div v-if="!isLoggedIn">
    <login-entry @on-generated-token="onGeneratedToken"></login-entry>
  </div>
  
  <div v-else>
    <table style="margin: auto; border: 1px; border-style: dashed;">
      <tbody>
        <tr>
          <td>food models</td><td>{{ store.foodModels.length }}</td>
          <td>sport models</td><td>{{ store.sportModels.length }}</td>
          <td>free models</td><td>{{ store.freeModels.length }}</td>
        </tr>
      </tbody>
    </table>
    
    <button class="button-10" @click="loadAllEntries()">
      Charger toutes les entrées
    </button>
    
    <div v-for="period in periods" :key="period.startDate">
      <one-period 
        :initial-date="period.startDate"
        :has-loaded-entries="period.hasBeenLoaded"
        :number-of-days="7">
      </one-period>
      <p></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ErrorView from './components/ErrorView.vue';
import LoginEntry from './components/LoginEntry.vue';
import OnePeriod from './components/OnePeriod.vue';
import { useOnePeriodItem } from './oneperiod';
import { useDailyStore } from './dailyStore';
import { useAuth } from './composables/useAuth.js';
import { useModels } from './composables/useModels.js';
import { entryService } from './services/entries.js';

const { isLoggedIn } = useAuth();
const { loadAllModels } = useModels();
const store = useDailyStore();

const periods = ref([]);

const loadAllEntries = () => {
  periods.value.forEach(period => {
    period.hasBeenLoaded = true;
  });
};

const onGeneratedToken = async (token) => {
  console.log("Token reçu:", token);
  console.log("onGeneratedTokem is logged in " + isLoggedIn.value);

  try {
    // Charger les modèles après connexion
    await loadAllModels();
    
    // Initialiser les dates
    await initDates();
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
    store.errorMessage = "Erreur lors du chargement des données";
  }
};

const initDates = async () => {
  try {
    // Récupérer la date minimale
    const minDate = await entryService.getMinDate();
    if (!minDate) {
      console.warn("Aucune date minimale trouvée");
      return;
    }

    // Récupérer les dates pertinentes
    const dates = await entryService.getRelevantDates(minDate, 7);
    
    // Créer les périodes
    periods.value = dates.map((date, index) => ({
      ...useOnePeriodItem(date, index < 2), // Charger seulement les 2 premières
      startDate: new Date(date)
    }));

  } catch (error) {
    console.error("Erreur lors de l'initialisation des dates:", error);
    store.errorMessage = "Impossible de charger les dates";
  }
};

onMounted(async () => {
    console.log("App.vue is logged in " + isLoggedIn.value);
  // Si déjà connecté au montage, charger les données
  if (isLoggedIn.value) {
    try {
      await loadAllModels();
      await initDates();
    } catch (error) {
      console.error("Erreur au montage:", error);
    }
  }
});
</script>

<style>
.button-10 {
  margin: auto;
  display: flex;
  justify-content: space-evenly;
  padding: 6px 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  border-radius: 6px;
  border: none;
  color: #fff;
  background: linear-gradient(180deg, #4B91F7 0%, #367AF6 100%);
  background-origin: border-box;
  box-shadow: 0px 0.5px 1.5px rgba(54, 122, 246, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-10:focus {
  box-shadow: inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1.5px rgba(54, 122, 246, 0.25), 0px 0px 0px 3.5px rgba(58, 108, 217, 0.5);
  outline: 0;
}

body {
  background-image: linear-gradient(to right bottom, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
  background-attachment: fixed;
}

@media only screen and (max-width: 393px) {
  body {
    background-image: linear-gradient(to right bottom, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
  }
}

input[type="text"] {
  font-size: 16px;
}

textarea {
  font-size: 16px;
}

#app {
  border: 1px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 400px;
  max-width: 400px;
  margin: auto;
}

@media only screen and (max-width: 393px) {
  #app {
    border: 1px;
    width: 100%;
    text-align: center;
  }
}
</style>