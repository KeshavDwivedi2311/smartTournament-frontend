import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService } from '../services/tournamentService';
import { teamService } from '../services/teamService';
import CreateTeamModal from '../components/CreateTeamModal';
import TeamCard from '../components/TeamCard';
import MatchDashboard from '../components/MatchBoard';
import PoolManager from '../components/PoolManager';
import { poolService } from '../services/poolService';
import MatchManager from '../components/MatchManager';
import KnockoutManager from '../components/KnockoutManager';
import TournamentResults from '../components/TournamentResults';
import TournamentStandings from '../components/TournamentStandings';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';

const TournamentDetails = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isLoggedIn } = useAuth();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pools, setPools] = useState([]);
    const [selectedPool, setSelectedPool] = useState(null);
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('teams');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Add a refresh trigger for pool standings
    const [poolRefreshTrigger, setPoolRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchTournamentDetails();
        fetchTeams();
        fetchPools();
    }, [tournamentId]);

    // Add effect to refresh pools when trigger changes
    useEffect(() => {
        if (poolRefreshTrigger > 0) {
            fetchPools();
        }
    }, [poolRefreshTrigger]);

    const fetchTournamentDetails = async () => {
        try {
            const data = await tournamentService.getTournamentById(tournamentId);
            setTournament(data);
        } catch (err) {
            console.error('Error fetching tournament:', err);
            setError('Failed to load tournament details');
        }
    };

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const data = await teamService.getTeamsByTournament(tournamentId);
            setTeams(data || []);
        } catch (err) {
            console.error('Error fetching teams:', err);
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const fetchPools = async () => {
        try {
            console.log('Fetching pools for tournament:', tournamentId);
            const response = await poolService.getPoolsByTournament(tournamentId);
            const poolsData = response.data || [];
            console.log('Pools data received:', poolsData);
            setPools(poolsData);
            if (poolsData.length > 0) {
                setSelectedPool(poolsData[0].id);
            }
        } catch (err) {
            console.error('Error fetching pools:', err);
            setPools([]);
        }
    };

    const handlePoolsUpdated = () => {
        console.log('Pools updated, refreshing data...');
        fetchPools();
        fetchTeams();
    };

    // Add a function to handle match updates that should refresh pool standings
    const handleMatchUpdated = () => {
        console.log('Match updated, refreshing pool standings...');
        setPoolRefreshTrigger(prev => prev + 1);
        // Also refresh other data if needed
        fetchTeams();
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTeamCreated = () => {
        fetchTeams();
    };

    const handleTeamDeleted = () => {
        fetchTeams();
    };

    if (loading && !tournament) {
        return (
            <div className="flex justify-center items-center min-h-screen px-4">
                <div className="text-base sm:text-lg text-center">Loading tournament details...</div>
            </div>
        );
    }

    if (error && !tournament) {
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
            {/* Header with Login */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base p-2 sm:p-0 -ml-2 sm:ml-0 rounded-lg sm:rounded-none hover:bg-blue-50 sm:hover:bg-transparent transition-colors self-start"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>

                    <div className="w-full sm:w-auto">
                        <LoginForm />
                    </div>
                </div>

                {tournament && (
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-2 break-words">{tournament.title}</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Start Date:</span>
                                <span className="block sm:inline truncate">
                                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Venue:</span>
                                <span className="block sm:inline truncate">{tournament.venue || 'TBD'}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Max Teams:</span>
                                <span className="block sm:inline">{tournament.maxTeams || 'Unlimited'}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-medium block sm:inline">Status:</span>
                                <span className={`inline-block mt-1 sm:mt-0 sm:ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                                    tournament.status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                                    tournament.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                                    tournament.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {tournament.status}
                                </span>
                            </div>
                        </div>
                        {tournament.description && (
                            <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base">{tournament.description}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('teams')}
                            className={`px-3 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                                activeTab === 'teams'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="hidden sm:inline">Teams ({teams.length}) {!isLoggedIn && '👁️'}</span>
                            <span className="sm:hidden">Teams ({teams.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('matches')}
                            className={`px-3 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                                activeTab === 'matches'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="hidden sm:inline">Match Dashboard {!isLoggedIn && '👁️'}</span>
                            <span className="sm:hidden">Matches</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('pools')}
                            className={`px-3 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                                activeTab === 'pools'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="hidden sm:inline">Pool Management {!isLoggedIn && '👁️'}</span>
                            <span className="sm:hidden">Pools</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('knockout')}
                            className={`px-3 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                                activeTab === 'knockout'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="hidden sm:inline">Knockout Phase {!isLoggedIn && '👁️'}</span>
                            <span className="sm:hidden">Knockout</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`px-3 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                                activeTab === 'results'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="hidden sm:inline">📊 Results & Standings</span>
                            <span className="sm:hidden">📊 Results</span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 sm:p-6">
                    {/* Teams Tab */}
                    {activeTab === 'teams' && (
                        <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                    Teams ({teams.length})
                                </h2>
                                {isLoggedIn && (
                                    <button
                                        onClick={() => setIsCreateTeamModalOpen(true)}
                                        className="bg-blue-600 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-blue-700 flex items-center justify-center text-sm sm:text-base font-medium transition-colors w-full sm:w-auto"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Team
                                    </button>
                                )}
                            </div>

                            {!isLoggedIn && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-blue-700 text-xs sm:text-sm">
                                        👁️ You're in view-only mode. Login to add or edit teams.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                        <div className="flex-1">
                                            <strong>Error:</strong> <span className="text-sm sm:text-base">{error}</span>
                                        </div>
                                        <button
                                            onClick={fetchTeams}
                                            className="bg-red-500 text-white px-3 py-1.5 sm:py-1 rounded text-sm hover:bg-red-600 self-start sm:self-auto sm:ml-4"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="text-base sm:text-lg">Loading teams...</div>
                                </div>
                            ) : teams.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg px-4">
                                    <div className="text-gray-500 text-base sm:text-lg">No teams registered yet</div>
                                    <p className="text-gray-400 mt-2 text-sm sm:text-base">Add the first team to get started</p>
                                    {isLoggedIn && (
                                        <button
                                            onClick={() => setIsCreateTeamModalOpen(true)}
                                            className="mt-4 bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base font-medium transition-colors"
                                        >
                                            Add First Team
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {teams.map((team) => (
                                        <TeamCard
                                            key={team.id}
                                            team={team}
                                            onTeamDeleted={handleTeamDeleted}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Matches Tab */}
                    {activeTab === 'matches' && (
                        <MatchManager
                            tournamentId={tournamentId}
                            onMatchUpdated={handleMatchUpdated}
                        />
                    )}

                    {/* Pools Tab */}
                    {activeTab === 'pools' && (
                        <PoolManager
                            tournamentId={tournamentId}
                            onPoolsUpdated={handlePoolsUpdated}
                            refreshTrigger={poolRefreshTrigger}
                        />
                    )}

                    {/* Knockout Tab */}
                    {activeTab === 'knockout' && (
                        <KnockoutManager tournamentId={tournamentId} />
                    )}

                    {/* Results Tab */}
                    {activeTab === 'results' && (
                        <TournamentResults tournamentId={tournamentId} />
                    )}
                </div>
            </div>

            {/* Tournament Standings Section */}
            <div className="mt-6 sm:mt-8">
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            🏆 Tournament Standings
                        </h2>
                        <button
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium w-full sm:w-auto"
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    <TournamentStandings
                        tournamentId={tournamentId}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>

            {/* Floating Add Team Button for Mobile */}
            {isLoggedIn && activeTab === 'teams' && (
                <div className="fixed bottom-4 right-4 sm:hidden z-50">
                    <button
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Add new team"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Create Team Modal - only if logged in */}
            {isLoggedIn && (
                <CreateTeamModal
                    isOpen={isCreateTeamModalOpen}
                    onClose={() => setIsCreateTeamModalOpen(false)}
                    onTeamCreated={handleTeamCreated}
                    tournamentId={tournamentId}
                />
            )}
        </div>
    );
};

export default TournamentDetails;