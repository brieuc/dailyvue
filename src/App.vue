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
    <button @click="handleLogout" class="logout-btn">Déconnexion</button>
    
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
import { ref, onMounted, watch, onUpdated } from 'vue';
import ErrorView from './components/ErrorView.vue';
import LoginEntry from './components/LoginEntry.vue';
import OnePeriod from './components/OnePeriod.vue';
import { useOnePeriodItem } from './oneperiod';
import { useDailyStore } from './dailyStore';
import { useAuth, isLoggedIn, error } from './composables/useAuth.js';
import { useModels } from './composables/useModels.js';
import { entryService } from './services/entries.js';

// ✅ Utilisation du composable useAuth
const { logout } = useAuth()
const { loadAllModels } = useModels();
const store = useDailyStore();

const periods = ref([]);

const loadAllEntries = () => {
  periods.value.forEach(period => {
    period.hasBeenLoaded = true;
  });
};

const onGeneratedToken = (token) => {
  // ✅ Utilise la fonction centralisée avec Promises
  initializeAppData()
    .then(() => {
    })
    .catch(error => {
    });
};

// ✅ VERSION AVEC RETURN (CORRECTE)
const initDates = () => {
  return entryService.getMinDate()  // ✅ RETURN de la Promise !
    .then(minDate => {
      return entryService.getRelevantDates(minDate, 7);
    })
    .then(dates => {
      periods.value = dates.map((date, index) => 
        useOnePeriodItem(date, index < 4)
        //useOnePeriodItem(date, true)
      );
    })
    .catch(error => {
      throw error;  // Re-throw pour l'appelant
    });
  
  // ✅ Cette fonction retourne une Promise que l'appelant peut attendre
};

// ✅ Fonction centralisée pour initialiser toutes les données avec Promises
const initializeAppData = () => {
  
  // Charger les modèles et les dates en parallèle pour optimiser les performances
  return Promise.all([
    loadAllModels(),  // ✅ Utilise useModels !
    initDates()
  ])
  .then(() => {
  })
  .catch(error => {
    store.errorMessage = "Erreur lors du chargement des données";
    throw error; // Re-throw pour permettre la gestion dans les appelants
  });
};


// ✅ Watcher pour initialiser les données quand l'utilisateur se connecte
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    initializeAppData()
  } else {
    // Nettoyer les données quand l'utilisateur se déconnecte
    periods.value = []
    store.foodModels.splice(0)
    store.sportModels.splice(0)
    store.freeModels.splice(0)
  }
});

// Initialisation des données au montage si déjà connecté
onMounted(() => {
  console.log("TEST");
  if (isLoggedIn.value) {
    initializeAppData()
  }
});


function handleLogout() {
  logout();
  // La réactivité va automatiquement mettre à jour l'interface
}
</script>

<style>
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