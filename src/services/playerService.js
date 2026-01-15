import api from '../api/api';

export const playerService = {
    createPlayer: async (playerData, teamId) => {
        try {
            const response = await api.post(`/players/team/${teamId}`, playerData);
            return response.data;
        } catch (error) {
            console.error('Error creating player:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    getPlayersByTeam: async (teamId) => {
        try {
            const response = await api.get(`/players/team/${teamId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching players:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    getPlayerById: async (playerId) => {
        try {
            const response = await api.get(`/players/${playerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching player:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    updatePlayer: async (playerId, playerData) => {
        try {
            const response = await api.put(`/players/${playerId}`, playerData);
            return response.data;
        } catch (error) {
            console.error('Error updating player:', error);
            throw error.response ? error.response.data : error.message;
        }
    },

    deletePlayer: async (playerId) => {
        try {
            const response = await api.delete(`/players/${playerId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting player:', error);
            throw error.response ? error.response.data : error.message;
        }
    },
};