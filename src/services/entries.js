// src/services/entries.js
import { api } from './api.js';

export const entryService = {
  async getByDate(date) {
    return api.get(`/entry/${date}`);
  },

  async getSummary(fromDate, toDate) {
    return api.get(`/entry/summary-info?fromDate=${fromDate}&toDate=${toDate}`);
  },

  async getRelevantDates(date, numberOfDays) {
    return api.get(`/entry/get/${date}?numberOfDays=${numberOfDays}`);
  },

  async create(data, type) {
    const endpoints = {
      FOOD: '/entry/food',
      SPORT: '/entry/sport', 
      FREE: '/entry/free',
      FREE_FOOD: '/entry/free/food'
    };
    return api.post(endpoints[type], data);
  },

  async update(id, data, type) {
    const endpoints = {
      FOOD: `/entry/${id}/food`,
      SPORT: `/entry/${id}/sport`,
      FREE: `/entry/${id}/free`, 
      FREE_FOOD: `/entry/${id}/free/food`
    };
    return api.put(endpoints[type], data);
  },

  async delete(id) {
    return api.delete(`/entry/${id}`);
  },

  async getMinDate() {
    const result = await api.get('/entry/firstDate');
    return result[0];
  }
};