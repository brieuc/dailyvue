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
  console.log("loadAllEntries")
  periods.value.forEach(period => {
    period.hasBeenLoaded = true;
  });
};

const onGeneratedToken = (token) => {
  console.log("Token reçu:", token);
  console.log("onGeneratedToken - isLoggedIn:", isLoggedIn.value);

  // ✅ Utilise la fonction centralisée avec Promises
  initializeAppData()
    .then(() => {
      console.log("🎉 Données chargées après connexion");
    })
    .catch(error => {
      console.error("💥 Échec du chargement après connexion:", error);
    });
};

// ✅ VERSION AVEC RETURN (CORRECTE)
const initDates = () => {
  return entryService.getMinDate()  // ✅ RETURN de la Promise !
    .then(minDate => {
      console.log("Date minimale:", minDate);
      return entryService.getRelevantDates(minDate, 7);
    })
    .then(dates => {
      periods.value = dates.map((date, index) => 
        useOnePeriodItem(date, index < 4)
        //useOnePeriodItem(date, true)
      );
    })
    .catch(error => {
      console.error("Erreur:", error);
      throw error;  // Re-throw pour l'appelant
    });
  
  // ✅ Cette fonction retourne une Promise que l'appelant peut attendre
};

// ✅ Fonction centralisée pour initialiser toutes les données avec Promises
const initializeAppData = () => {
  console.log("🚀 Début de l'initialisation des données...");
  
  // Charger les modèles et les dates en parallèle pour optimiser les performances
  return Promise.all([
    loadAllModels(),  // ✅ Utilise useModels !
    initDates()
  ])
  .then(() => {
    console.log("✅ Initialisation des données terminée");
  })
  .catch(error => {
    console.error("❌ Erreur lors de l'initialisation:", error);
    store.errorMessage = "Erreur lors du chargement des données";
    throw error; // Re-throw pour permettre la gestion dans les appelants
  });
};


// ✅ Watcher pour initialiser les données quand l'utilisateur se connecte
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    console.log("app.vue watch" + newValue + "isLogged.value " + isLoggedIn.value);
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
  console.log("app.vue onMounted" + isLoggedIn.value);
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
/* =================================
   AMÉLIORATIONS CSS POUR DAILYMON
   ================================= */

/* 1. FOND PLUS MODERNE */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 2. CONTENEUR PRINCIPAL AMÉLIORÉ */
#app {
  border: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 420px;
  max-width: 420px;
  margin: 20px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

/* 3. TABLEAU DES STATS AMÉLIORÉ */
table {
  margin: 20px auto !important;
  border: none !important;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

table td {
  padding: 8px 12px;
  font-weight: 500;
  color: #374151;
}

/* 4. BOUTONS MODERNISÉS */
.button-10 {
  margin: 15px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 12px;
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.button-10:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.button-10:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.button-10:focus {
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4), 0 0 0 3px rgba(102, 126, 234, 0.3);
  outline: 0;
}

.button-10:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

/* 5. BOUTON DÉCONNEXION */
.logout-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* 6. CHAMPS DE SAISIE MODERNISÉS */
input[type="text"], 
input[type="date"], 
input[type="number"],
textarea,
select {
  font-size: 16px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  font-family: inherit;
}

input[type="text"]:focus, 
input[type="date"]:focus, 
input[type="number"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

/* 7. BORDERS MODERNISÉS (OneDay component élargi) */
#border {
  border: none !important;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  margin: 10px auto;
  width: calc(100% - 20px) !important;
  max-width: 400px !important;
  padding: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

#border:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.95);
}

/* 8. CONTENEURS D'ENTRÉES */
.div-entry-center {
  border: none !important;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 15px auto;
  width: 400px;
  padding: 16px;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.div-entry-center:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 9. FLEXBOX AMÉLIORÉ */
.flex, .flex-summary, .flex-summary-day {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 12px;
  margin: 10px 0;
}

.flex-summary-day {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* 10. MESSAGES D'ERREUR AMÉLIORÉS */
.formatted {
  white-space: pre-wrap;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 10px 0;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  font-weight: 500;
}

/* 11. BOUTONS COLORÉS */
.button-color {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  margin: 2px;
}

.button-color:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
}

/* 12. ✨ EN-TÊTE DE DATE MODERNISÉ (OneDay component) */
#border > div:first-child {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  letter-spacing: 0.3px !important;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
}

#border > div:first-child:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

/* 13. ✨ MODEL SELECTION MODERNISÉ */
.flexRow {
  border: none !important;
  background: rgba(255, 255, 255, 0.9) !important;
  color: #374151 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-around !important;
  align-items: center !important;
  text-align: center !important;
  cursor: pointer !important;
  width: 100% !important;
  max-width: 400px !important;
  margin: 10px auto !important;
  padding: 8px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.flexRow > div {
  padding: 8px 16px !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  flex: 1 !important;
  margin: 0 4px !important;
  font-weight: 500 !important;
}

.flexRow > div:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
}

.flexRow > div:active {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
  transform: translateY(0) !important;
}

/* 14. RESPONSIVE AMÉLIORÉ */
@media only screen and (max-width: 480px) {
  #app {
    width: 95%;
    margin: 10px auto;
    padding: 15px;
    border-radius: 12px;
  }
  
  #border {
    width: calc(100% - 10px) !important;
    margin: 8px auto;
  }
  
  .div-entry-center {
    width: 100%;
    margin: 10px 0;
  }
  
  .flexRow {
    width: 100% !important;
  }
  
  table {
    font-size: 14px;
  }
  
  .button-10 {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* 15. ANIMATIONS SUBTILES */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 16. ÉTATS DE CHARGEMENT */
.loading {
  opacity: 0.7;
  pointer-events: none;
  position: relative;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #667eea;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 17. AMÉLIORATIONS TEXTE */
h1, h2, h3, h4 {
  color: #1f2937;
  font-weight: 600;
  margin: 16px 0;
}

p {
  color: #4b5563;
  line-height: 1.5;
}

/* 18. SCROLLBAR PERSONNALISÉE (Webkit) */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.7);
}
</style>