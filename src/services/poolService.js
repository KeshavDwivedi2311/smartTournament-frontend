
import api from '../api/api';

export const poolService = {
      getPoolsByTournament: (tournamentId) => api.get(`/pools/tournament/${tournamentId}`),
      createPool: (tournamentId, poolData) => api.post(`/pools/tournament/${tournamentId}`, poolData),
      updatePool: (poolId, poolData) => api.put(`/pools/${poolId}`, poolData),
      deletePool: (poolId) => api.delete(`/pools/${poolId}`),
      assignTeamToPool: (poolId, teamId) => api.put(`/pools/${poolId}/teams/${teamId}`),
      removeTeamFromPool: (poolId, teamId) => api.delete(`/pools/${poolId}/teams/${teamId}`),
    
    // Get detailed standings for a specific pool
    getPoolStandings: async (poolId) => {
        try {
            console.log('Fetching standings for pool:', poolId);
            const response = await api.get(`/pools/${poolId}/standings`);
            console.log('Pool standings response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching pool standings:', error);
            throw error;
        }
    },

    // Get pool rankings (top teams)
    getPoolRankings: async (poolId) => {
        try {
            console.log('Fetching rankings for pool:', poolId);
            const response = await api.get(`/pools/${poolId}/rankings`);
            console.log('Pool rankings response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching pool rankings:', error);
            throw error;
        }
    },
}
