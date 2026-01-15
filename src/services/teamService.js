import api from '../api/api';

export const teamService = {
    createTeam: async (teamData, tournamentId) => {
        try {
            const response = await api.post(`/teams/tournament/${tournamentId}`, teamData);
            return response.data;
        } catch (error) {
            console.error('Error creating team:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    getTeamsByTournament: async (tournamentId) => {
        try {
            const response = await api.get(`/teams/tournament/${tournamentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    getTeamById: async (teamId) => {
        try {
            const response = await api.get(`/teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching team:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    updateTeam: async (teamId, teamData) => {
        try {
            const response = await api.put(`/teams/${teamId}`, teamData);
            return response.data;
        } catch (error) {
            console.error('Error updating team:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    deleteTeam: async (teamId) => {
        try {
            const response = await api.delete(`/teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting team:', error);
            throw error.response ? error.response.data : error.message;
        }
    },
};