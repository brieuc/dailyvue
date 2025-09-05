// src/services/models.js  
import { api } from './api.js';

export const modelService = {
  async getFoodModels() {
    return api.get('/model/food');
  },

  async getSportModels() {
    return api.get('/model/sport');
  },

  async getFreeModels() {
    return api.get('/model/free');
  },

  async createFoodModel(data) {
    return api.post('/model', data);
  },

  async createFromEntry(entry) {
    return this.createFoodModel({
      title: entry.title,
      description: entry.description,
      kcal: entry.kcal,
      foodType: entry.foodType,
      type: 'FOOD'
    });
  }
};