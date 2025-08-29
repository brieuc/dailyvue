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

  async create(data) {
    return api.post('/entry', data);
  },

  async update(id, data) {
    return api.put(`/entry/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/entry/${id}`);
  },

  async getMinDate() {
    const result = await api.get('/entry/firstDate');
    return result[0];
  }
};