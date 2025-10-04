import axiosInstance from './axiosConfig';
import { PoliceStation } from '../types/user.types';

export const stationApi = {
  // Get all police stations
  getAll: async (): Promise<PoliceStation[]> => {
    const response = await axiosInstance.get('/PoliceStation');
    return response.data;
  },

  // Get station by ID
  getById: async (id: number): Promise<PoliceStation> => {
    const response = await axiosInstance.get(`/PoliceStation/${id}`);
    return response.data;
  },

  // Create new station
  create: async (station: Omit<PoliceStation, 'stationId'>): Promise<PoliceStation> => {
    const response = await axiosInstance.post('/PoliceStation', station);
    return response.data;
  },

  // Update station
  update: async (id: number, station: Partial<PoliceStation>): Promise<PoliceStation> => {
    const response = await axiosInstance.put(`/PoliceStation/${id}`, station);
    return response.data;
  },

  // Delete station
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/PoliceStation/${id}`);
  },
};