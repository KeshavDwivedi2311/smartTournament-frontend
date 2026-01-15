import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { playerService } from '../services/playerService';
import CreatePlayerModal from '../components/CreatePlayerModal';
import PlayerCard from '../components/PlayerCard';

const TeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreatePlayerModalOpen, setIsCreatePlayerModalOpen] = useState(false);

    useEffect(() => {
        fetchTeamDetails();
        fetchPlayers();
    }, [teamId]);

    const fetchTeamDetails = async () => {
        try {
            const data = await teamService.getTeamById(teamId);
            setTeam(data);
        } catch (err) {
            console.error('Error fetching team:', err);
            setError('Failed to load team details');
        }
    };

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const data = await playerService.getPlayersByTeam(teamId);
            setPlayers(data || []);
        } catch (err) {
            console.error('Error fetching players:', err);
            setError('Failed to load players');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerCreated = () => {
        fetchPlayers();
    };

    const handlePlayerDeleted = () => {
        fetchPlayers();
    };

    const handleBackToTournament = () => {
        if (team?.tournament?.id) {
            navigate(`/tournament/${team.tournament.id}`);
        } else {
            navigate('/dashboard');
        }
    };

    if (loading && !team) {
        return (
            <div className="flex justify-center items-center min-h-screen px-4">
                <div className="text-base sm:text-lg text-center">Loading team details...</div>
            </div>
        );
    }

    if (error && !team) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                        <div className="flex-1">
                            <strong>Error:</strong> <span className="text-sm sm:text-base">{error}</span>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-red-500 text-white px-3 py-1.5 sm:py-1 rounded text-sm hover:bg-red-600 self-start sm:self-auto sm:ml-4"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-20 sm:pb-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <button
                    onClick={handleBackToTournament}
                    className="mb-3 sm:mb-4 flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base p-2 sm:p-0 -ml-2 sm:ml-0 rounded-lg sm:rounded-none hover:bg-blue-50 sm:hover:bg-transparent transition-colors"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Tournament
                </button>

                {team && (
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3 sm:gap-0">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">{team.name}</h1>
                                <p className="text-sm sm:text-base text-gray-600 truncate">
                                    Tournament: {team.tournament?.title || 'Unknown'}
                                </p>
                            </div>
                            <span className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium self-start sm:self-auto whitespace-nowrap ${
                                team.status === 'REGISTERED' ? 'bg-blue-100 text-blue-800' :
                                team.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {team.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Captain:</span>
                                <span className="block sm:inline truncate">{team.captainName || 'Not assigned'}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Email:</span>
                                <span className="block sm:inline truncate">{team.contactEmail || 'Not provided'}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Phone:</span>
                                <span className="block sm:inline truncate">{team.contactPhone || 'Not provided'}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Registered:</span>
                                <span className="block sm:inline truncate">
                                    {team.registrationDate ? new Date(team.registrationDate).toLocaleDateString() : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Players Section */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        Players ({players.length})
                    </h2>
                    <button
                        onClick={() => setIsCreatePlayerModalOpen(true)}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-green-700 flex items-center justify-center text-sm sm:text-base font-medium transition-colors w-full sm:w-auto"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Player
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                            <div className="flex-1">
                                <strong>Error:</strong> <span className="text-sm sm:text-base">{error}</span>
                            </div>
                            <button
                                onClick={fetchPlayers}
                                className="bg-red-500 text-white px-3 py-1.5 sm:py-1 rounded text-sm hover:bg-red-600 self-start sm:self-auto sm:ml-4"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-6 sm:py-8">
                        <div className="text-base sm:text-lg">Loading players...</div>
                    </div>
                ) : players.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg px-4">
                        <div className="text-gray-500 text-base sm:text-lg">No players added yet</div>
                        <p className="text-gray-400 mt-2 text-sm sm:text-base">Add the first player to get started</p>
                        <button
                            onClick={() => setIsCreatePlayerModalOpen(true)}
                            className="mt-4 bg-green-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-green-700 text-sm sm:text-base font-medium transition-colors"
                        >
                            Add First Player
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {players.map((player) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                onPlayerDeleted={handlePlayerDeleted}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Add Button for Mobile */}
            <div className="fixed bottom-4 right-4 sm:hidden z-50">
                <button
                    onClick={() => setIsCreatePlayerModalOpen(true)}
                    className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-label="Add new player"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Create Player Modal */}
            <CreatePlayerModal
                isOpen={isCreatePlayerModalOpen}
                onClose={() => setIsCreatePlayerModalOpen(false)}
                onPlayerCreated={handlePlayerCreated}
                teamId={teamId}
            />
        </div>
    );
};

export default TeamDetails;