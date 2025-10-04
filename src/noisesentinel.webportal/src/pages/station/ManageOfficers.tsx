import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { authApi } from '../../api/authApi';
import { CreatePoliceOfficerDto } from '../../types/auth.types';
import { PoliceStation } from '../../types/user.types';
import axiosInstance from '../../api/axiosConfig';

export const ManageOfficers: React.FC = () => {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [formData, setFormData] = useState<CreatePoliceOfficerDto>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    cnic: '',
    contactNo: '',
    badgeNumber: '',
    rank: '',
    isInvestigationOfficer: false,
    stationId: 0,
    postingDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await axiosInstance.get('/PoliceStation');
      setStations(response.data);
    } catch (err) {
      console.error('Failed to fetch police stations', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'stationId' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authApi.createPoliceOfficer(formData);
      
      if (response.data) {
        setSuccess(`Police Officer ${response.data.username} created successfully!`);
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          username: '',
          password: '',
          cnic: '',
          contactNo: '',
          badgeNumber: '',
          rank: '',
          isInvestigationOfficer: false,
          stationId: 0,
          postingDate: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create police officer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create Police Officer Account
          </h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CNIC *
                  </label>
                  <input
                    type="text"
                    name="cnic"
                    required
                    placeholder="42101-1234567-8"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.cnic}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    name="contactNo"
                    required
                    placeholder="+92-301-7654321"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.contactNo}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Badge Number *
                  </label>
                  <input
                    type="text"
                    name="badgeNumber"
                    required
                    placeholder="PKL-2025-001"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.badgeNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rank *
                  </label>
                  <select
                    name="rank"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.rank}
                    onChange={handleChange}
                  >
                    <option value="">Select Rank</option>
                    <option value="Constable">Constable</option>
                    <option value="Head Constable">Head Constable</option>
                    <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                    <option value="Sub-Inspector">Sub-Inspector</option>
                    <option value="Inspector">Inspector</option>
                    <option value="DSP">DSP</option>
                    <option value="SP">SP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Police Station *
                  </label>
                  <select
                    name="stationId"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.stationId}
                    onChange={handleChange}
                  >
                    <option value={0}>Select a station</option>
                    {stations.map((station) => (
                      <option key={station.stationId} value={station.stationId}>
                        {station.stationName} - {station.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Posting Date *
                  </label>
                  <input
                    type="date"
                    name="postingDate"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.postingDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    name="isInvestigationOfficer"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={formData.isInvestigationOfficer}
                    onChange={handleChange}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Investigation Officer
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Police Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};