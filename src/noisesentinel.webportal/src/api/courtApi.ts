import axiosInstance from './axiosConfig';
import { Court } from '../types/user.types';

export const courtApi = {
  // Get all courts
  getAll: async (): Promise<Court[]> => {
    const response = await axiosInstance.get('/Court');
    return response.data;
  },

  // Get court by ID
  getById: async (id: number): Promise<Court> => {
    const response = await axiosInstance.get(`/Court/${id}`);
    return response.data;
  },

  // Create new court
  create: async (court: Omit<Court, 'courtId'>): Promise<Court> => {
    const response = await axiosInstance.post('/Court', court);
    return response.data;
  },

  // Update court
  update: async (id: number, court: Partial<Court>): Promise<Court> => {
    const response = await axiosInstance.put(`/Court/${id}`, court);
    return response.data;
  },

  // Delete court
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/Court/${id}`);
  },
};