import apiClient from './axios.config';
import {
  UserListItemDto,
  UserDetailsDto,
  JudgeDetailsDto,
  PoliceOfficerDetailsDto,
  UserCountsDto,
  UpdateUserDto,
  UpdateJudgeDto,
  UpdatePoliceOfficerDto,
  UserSearchFilterDto,
} from '@/models/User';
import { ApiResponse } from '@/models/ApiResponse';

class UserApi {
  /**
   * Get all admins
   */
  async getAllAdmins(): Promise<UserListItemDto[]> {
    const response = await apiClient.get<ApiResponse<UserListItemDto[]>>(
      '/User/admins'
    );
    return response.data.data || [];
  }

  /**
   * Get all court authorities
   */
  async getAllCourtAuthorities(): Promise<UserListItemDto[]> {
    const response = await apiClient.get<ApiResponse<UserListItemDto[]>>(
      '/User/court-authorities'
    );
    return response.data.data || [];
  }

  /**
   * Get all station authorities
   */
  async getAllStationAuthorities(): Promise<UserListItemDto[]> {
    const response = await apiClient.get<ApiResponse<UserListItemDto[]>>(
      '/User/station-authorities'
    );
    return response.data.data || [];
  }

  /**
   * Get all judges
   */
  async getAllJudges(): Promise<JudgeDetailsDto[]> {
    const response = await apiClient.get<ApiResponse<JudgeDetailsDto[]>>(
      '/User/judges'
    );
    return response.data.data || [];
  }

  /**
   * Get all police officers
   */
  async getAllPoliceOfficers(): Promise<PoliceOfficerDetailsDto[]> {
    const response = await apiClient.get<ApiResponse<PoliceOfficerDetailsDto[]>>(
      '/User/police-officers'
    );
    return response.data.data || [];
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<UserDetailsDto> {
    const response = await apiClient.get<ApiResponse<UserDetailsDto>>(
      `/User/${userId}`
    );
    return response.data.data!;
  }

  /**
   * Get user counts/statistics
   */
  async getUserCounts(): Promise<UserCountsDto> {
    const response = await apiClient.get<ApiResponse<UserCountsDto>>(
      '/User/counts'
    );
    return response.data.data!;
  }

  /**
   * Search users
   */
  async searchUsers(filter: UserSearchFilterDto): Promise<UserListItemDto[]> {
    const params = new URLSearchParams();
    if (filter.searchQuery) params.append('searchQuery', filter.searchQuery);
    if (filter.role) params.append('role', filter.role);
    if (filter.isActive !== undefined)
      params.append('isActive', filter.isActive.toString());

    const response = await apiClient.get<ApiResponse<UserListItemDto[]>>(
      `/User/search?${params.toString()}`
    );
    return response.data.data || [];
  }

  /**
   * Update user (Admin, Court Authority, Station Authority)
   */
  async updateUser(userId: number, data: UpdateUserDto): Promise<void> {
    await apiClient.put(`/User/${userId}`, data);
  }

  /**
   * Update judge
   */
  async updateJudge(judgeId: number, data: UpdateJudgeDto): Promise<void> {
    await apiClient.put(`/User/judges/${judgeId}`, data);
  }

  /**
   * Update police officer
   */
  async updatePoliceOfficer(
    officerId: number,
    data: UpdatePoliceOfficerDto
  ): Promise<void> {
    await apiClient.put(`/User/officers/${officerId}`, data);
  }

  /**
   * Activate user
   */
  async activateUser(userId: number): Promise<void> {
    await apiClient.put(`/User/${userId}/activate`);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: number): Promise<void> {
    await apiClient.put(`/User/${userId}/deactivate`);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/User/${userId}`);
  }

  /**
   * Delete judge
   */
  async deleteJudge(judgeId: number): Promise<void> {
    await apiClient.delete(`/User/judges/${judgeId}`);
  }

  /**
   * Delete police officer
   */
  async deletePoliceOfficer(officerId: number): Promise<void> {
    await apiClient.delete(`/User/officers/${officerId}`);
  }
}

export default new UserApi();