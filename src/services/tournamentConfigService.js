import api from '../api/api';

export const tournamentConfigService = {
  /**
   * Get tournament configuration
   */
  getConfig: async (tournamentId) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/config`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament config:', error);
      // Return default config if not found
      return {
        poolMatchPoints: 15,
        knockoutMatchPoints: 21,
        breakTimeMinutes: 5,
        estimatedMatchDurationMinutes: 30,
        courtSchedule: JSON.stringify([
          { startTime: '09:00', courts: 4 },
          { startTime: '10:00', courts: 4 },
          { startTime: '11:00', courts: 3 },
          { startTime: '12:00', courts: 2 }
        ])
      };
    }
  },

  /**
   * Update tournament configuration
   */
  updateConfig: async (tournamentId, config) => {
    try {
      const response = await api.put(`/tournaments/${tournamentId}/config`, config);
      return response.data;
    } catch (error) {
      console.error('Error updating tournament config:', error);
      throw error;
    }
  },

  /**
   * Parse court schedule from JSON string
   */
  parseCourtSchedule: (scheduleString) => {
    try {
      if (!scheduleString) return [];
      return JSON.parse(scheduleString);
    } catch (error) {
      console.error('Error parsing court schedule:', error);
      return [];
    }
  },

  /**
   * Format court schedule to JSON string
   */
  formatCourtSchedule: (scheduleArray) => {
    try {
      return JSON.stringify(scheduleArray);
    } catch (error) {
      console.error('Error formatting court schedule:', error);
      return '[]';
    }
  }
};
