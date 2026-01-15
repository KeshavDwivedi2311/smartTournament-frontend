
import api from '../api/api';

export const tournamentService = {
    createTournament: async (tournamentData) => {
        try {
        const response = await api.post('/tournaments', tournamentData);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    getTournaments: async () => {
        try {
        const response = await api.get('/tournaments');
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    getTournamentById: async (id) => {
        try {
        const response = await api.get(`/tournaments/${id}`);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    updateTournament: async (id, tournamentData) => {
        try {
        const response = await api.put(`/tournaments/${id}`, tournamentData);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    deleteTournament: async (id) => {
        try {
        const response = await api.delete(`/tournaments/${id}`);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    // Pool Management
    createPool: async (tournamentId, poolData) => {
        try {
        const response = await api.post(`/tournaments/${tournamentId}/pools`, poolData);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },
    
    getPools: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/pools`);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    addTeamToPool: async (poolId, teamData) => {
        try {
        const response = await api.post(`/pools/${poolId}/teams`, teamData);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    // Match Management
    getOngoingMatches: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/matches/ongoing`);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    getCompletedMatches: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/matches/completed`);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    getNextMatches: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/matches/next`);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    updateMatchScore: async (matchId, scoreData) => {
        try {
        const response = await api.put(`/matches/${matchId}/score`, scoreData);
        return response.data;
        } catch (error) {
        throw error.response ? error.response.data : error.message;
        }
    },

    // Knockout phase methods
    getKnockoutMatches: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/knockout`);
        return response.data;
        } catch (error) {
        console.error('Error fetching knockout matches:', error);
        throw error;
        }
    },

    getQualifiedTeams: async (tournamentId, teamsPerPool = 2) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/qualified-teams?teamsPerPool=${teamsPerPool}`);
        return response.data;
        } catch (error) {
        console.error('Error fetching qualified teams:', error);
        throw error;
        }
    },

    generateQualifierMatches: async (tournamentId, teamsPerPool = 2, schedulingRules = {}) => {
        try {
        const params = new URLSearchParams({
            teamsPerPool: teamsPerPool.toString()
        });

        // Add scheduling rules as query parameters
        if (schedulingRules.avoidSamePool !== undefined) {
            params.append('avoidSamePool', schedulingRules.avoidSamePool.toString());
        }
        if (schedulingRules.matchingStrategy) {
            params.append('matchingStrategy', schedulingRules.matchingStrategy);
        }
        if (schedulingRules.qualifierFormat) {
            params.append('qualifierFormat', schedulingRules.qualifierFormat);
        }

        const response = await api.post(`/tournaments/${tournamentId}/generate-qualifiers?${params.toString()}`);
        return response.data;
        } catch (error) {
        console.error('Error generating qualifier matches:', error);
        throw error;
        }
    },

    generateSemifinalMatches: async (tournamentId) => {
        try {
            console.log('Calling generate semifinals for tournament:', tournamentId);
            const response = await api.post(`/tournaments/${tournamentId}/generate-semifinals`);
            console.log('Semifinals generation response:', response);
            return response.data;
        } catch (error) {
            console.error('Error generating semifinal matches:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    },

    generateFinalMatches: async (tournamentId) => {
        try {
        const response = await api.post(`/tournaments/${tournamentId}/generate-finals`);
        return response.data;
        } catch (error) {
        console.error('Error generating final matches:', error);
        throw error;
        }
    },

    createCustomMatch: async (tournamentId, matchData) => {
        try {
        const response = await api.post(`/tournaments/${tournamentId}/custom-match`, matchData);
        return response.data;
        } catch (error) {
        console.error('Error creating custom match:', error);
        throw error;
        }
    },

    // Reset/Delete methods
    resetQualifierMatches: async (tournamentId) => {
        try {
        const response = await api.delete(`/tournaments/${tournamentId}/knockout/qualifiers`);
        return response.data;
        } catch (error) {
        console.error('Error resetting qualifier matches:', error);
        throw error;
        }
    },

    resetSemifinalMatches: async (tournamentId) => {
        try {
        const response = await api.delete(`/tournaments/${tournamentId}/knockout/semifinals`);
        return response.data;
        } catch (error) {
        console.error('Error resetting semifinal matches:', error);
        throw error;
        }
    },

    resetFinalMatches: async (tournamentId) => {
        try {
        const response = await api.delete(`/tournaments/${tournamentId}/knockout/finals`);
        return response.data;
        } catch (error) {
        console.error('Error resetting final matches:', error);
        throw error;
        }
    },

    resetAllKnockoutMatches: async (tournamentId) => {
        try {
        const response = await api.delete(`/tournaments/${tournamentId}/knockout/all`);
        return response.data;
        } catch (error) {
        console.error('Error resetting all knockout matches:', error);
        throw error;
        }
    },

    // Add this new method to get all teams in a tournament
    getAllTeams: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/teams`);
        return response.data;
        } catch (error) {
        console.error('Error fetching all teams:', error);
        throw error;
        }
    },

    // Alternative: if the above endpoint doesn't exist, we can get teams from pools
    getAllTeamsFromPools: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/pools`);
        const pools = response.data || [];

        // Extract all teams from all pools
        const allTeams = [];
        pools.forEach(pool => {
            if (pool.teams && Array.isArray(pool.teams)) {
            pool.teams.forEach(team => {
                allTeams.push({
                ...team,
                poolName: pool.name,
                poolId: pool.id
                });
            });
            }
        });

        return allTeams;
        } catch (error) {
        console.error('Error fetching teams from pools:', error);
        throw error;
        }
    },

    // Get pool standings with team statistics
    getPoolStandings: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/pools/standings`);
        return response.data;
        } catch (error) {
        console.error('Error fetching pool standings:', error);
        // Fallback: get pools and calculate standings on frontend
        try {
            const poolsResponse = await api.get(`/tournaments/${tournamentId}/pools`);
            return poolsResponse.data;
        } catch (fallbackError) {
            throw error;
        }
        }
    },

    // Get knockout results
    getKnockoutResults: async (tournamentId) => {
        try {
        const response = await api.get(`/tournaments/${tournamentId}/knockout/results`);
        return response.data;
        } catch (error) {
        console.error('Error fetching knockout results:', error);
        // Fallback: get knockout matches
        try {
            const knockoutResponse = await api.get(`/tournaments/${tournamentId}/knockout`);
            const knockoutData = knockoutResponse.data || {};

            // Transform the data to match our expected format
            return {
            qualifiers: knockoutData.qualifiers || [],
            semifinals: knockoutData.semifinals || [],
            finals: knockoutData.finals || [],
            winner: knockoutData.winner || null
            };
        } catch (fallbackError) {
            // Return empty structure if both fail
            return {
            qualifiers: [],
            semifinals: [],
            finals: [],
            winner: null
            };
        }
        }
    },
}
