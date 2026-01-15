import api from '../api/api';

export const matchService = {
  // Get matches by status
  getUpcomingMatches: (poolId) => api.get(`/tournaments/matches/pools/${poolId}/upcoming`),
  getOngoingMatches: (poolId) => api.get(`/tournaments/matches/pools/${poolId}/ongoing`),
  getCompletedMatches: (poolId) => api.get(`/tournaments/matches/pools/${poolId}/completed`),
  getNextMatches: (poolId, limit = 2) => api.get(`/tournaments/matches/pools/${poolId}/next?limit=${limit}`),

  // Match actions
  markMatchAsReady: (matchId) => api.post(`/tournaments/matches/${matchId}/ready`),
  startMatch: (matchId, courtNumber) => api.post(`/tournaments/matches/${matchId}/start?courtNumber=${courtNumber}`),
  completeMatch: (matchId, data) => api.post(`/tournaments/matches/${matchId}/complete`, data),
  updateMatch: (matchId, data) => api.put(`/tournaments/matches/${matchId}`, data),
  updateMatchScore: (matchId, team1Score, team2Score) =>
    api.put(`/tournaments/matches/${matchId}`, { team1Score, team2Score }),

  // Optimized state transition methods using existing endpoints
  markAsNext: async (matchId) => {
    try {
      const response = await api.put(`/tournaments/matches/${matchId}/mark-next`);
      return response.data;
    } catch (error) {
      // Extract the error message from the backend response
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message;
      throw new Error(errorMessage);
    }
  },
  unmarkAsNext: (matchId) => api.put(`/tournaments/matches/${matchId}/unmark-next`),
  moveToScheduled: (matchId) => api.put(`/tournaments/matches/${matchId}/move-to-scheduled`),
  moveToNext: async (matchId) => {
    try {
      const response = await api.put(`/tournaments/matches/${matchId}/move-to-next`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message;
      throw new Error(errorMessage);
    }
  },
  revertToOngoing: (matchId) => api.put(`/tournaments/matches/${matchId}/revert-to-ongoing`),
  revertToScheduled: (matchId) => api.put(`/tournaments/matches/${matchId}/revert-to-scheduled`),
  revertFromCompleted: (matchId) => api.put(`/tournaments/matches/${matchId}/revert-completion`),

  // Utility methods
  getMatchById: (matchId) => api.get(`/tournaments/matches/${matchId}`),
  updateMatchStatus: (matchId, status) => api.patch(`/tournaments/matches/${matchId}/status?status=${status}`)
};
