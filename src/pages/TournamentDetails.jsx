import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournament } from '../hooks/useTournaments';
import { useTeams, useCreateTeam, useDeleteTeam } from '../hooks/useTeams';
import { poolService } from '../services/poolService';
import CreateTeamModal from '../components/CreateTeamModal';
import TeamCard from '../components/TeamCard';
import PoolManager from '../components/PoolManager';
import MatchManager from '../components/MatchManager';
import KnockoutManager from '../components/KnockoutManager';
import TournamentResults from '../components/TournamentResults';
import TournamentStandings from '../components/TournamentStandings';
import TournamentScheduleTracker from '../components/TournamentScheduleTracker';
import TournamentConfigModal from '../components/TournamentConfigModal';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import { LoadingSpinner, LoadingSkeleton } from '../components/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../components/Pagination';
import Button from '../components/ui/Button';
import { Eye, Trophy, RefreshCw, Settings } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';

const TournamentDetails = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isLoggedIn } = useAuth();
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [poolRefreshTrigger, setPoolRefreshTrigger] = useState(0);

    // Use React Query hooks
    const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useTournament(tournamentId, {
        refetchInterval: 60000, // Poll every minute
    });
    const { data: teams = [], isLoading: teamsLoading, refetch: refetchTeams } = useTeams(tournamentId, {
        refetchInterval: 30000, // Poll every 30 seconds
    });
    const { data: pools = [], isLoading: poolsLoading, refetch: refetchPools } = useQuery({
        queryKey: ['pools', tournamentId],
        queryFn: async () => {
            const response = await poolService.getPoolsByTournament(tournamentId);
            return response.data || [];
        },
        enabled: !!tournamentId,
        refetchInterval: 30000,
    });

    const createTeam = useCreateTeam(tournamentId);
    const deleteTeam = useDeleteTeam(tournamentId);

    // Pagination for teams
    const { paginatedItems: paginatedTeams, currentPage, totalPages, goToPage } = usePagination(teams, 12);

    const handlePoolsUpdated = () => {
        refetchPools();
        refetchTeams();
    };

    const handleMatchUpdated = () => {
        setPoolRefreshTrigger(prev => prev + 1);
        refetchTeams();
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTeamCreated = () => {
        // Optimistic update already handled by hook
        setIsCreateTeamModalOpen(false);
    };

    const handleTeamDeleted = () => {
        // Optimistic update already handled by hook
    };

    if (tournamentLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen px-4">
                <LoadingSpinner size="lg" text="Loading tournament details..." />
            </div>
        );
    }

    if (tournamentError && !tournament) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                        <div className="flex-1">
                            <strong>Error:</strong> <span className="text-sm sm:text-base">
                                {tournamentError?.message || 'Failed to load tournament details'}
                            </span>
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
        <div className="pb-20 sm:pb-6">
            {/* Tournament Schedule Tracker - Top Navigation Bar */}
            {tournamentId && <TournamentScheduleTracker tournamentId={tournamentId} />}
            
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
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

                    <div className="flex items-center gap-2">
                        {isLoggedIn && isAdmin && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsConfigModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Settings</span>
                            </Button>
                        )}
                        <div className="w-full sm:w-auto">
                            <LoginForm />
                        </div>
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
                    <nav className="flex overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 sm:px-6 py-3.5 sm:py-3 font-medium text-base sm:text-base whitespace-nowrap flex-shrink-0 min-h-[48px] sm:min-h-0 touch-manipulation ${
                                activeTab === 'overview'
                                    ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700 active:text-blue-600'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('matches')}
                            className={`px-4 sm:px-6 py-3.5 sm:py-3 font-medium text-base sm:text-base whitespace-nowrap flex-shrink-0 min-h-[48px] sm:min-h-0 touch-manipulation ${
                                activeTab === 'matches'
                                    ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700 active:text-blue-600'
                            }`}
                        >
                            Matches
                        </button>
                        <button
                            onClick={() => setActiveTab('knockout')}
                            className={`px-4 sm:px-6 py-3.5 sm:py-3 font-medium text-base sm:text-base whitespace-nowrap flex-shrink-0 min-h-[48px] sm:min-h-0 touch-manipulation ${
                                activeTab === 'knockout'
                                    ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700 active:text-blue-600'
                            }`}
                        >
                            Knockout
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`px-4 sm:px-6 py-3.5 sm:py-3 font-medium text-base sm:text-base whitespace-nowrap flex-shrink-0 min-h-[48px] sm:min-h-0 touch-manipulation ${
                                activeTab === 'results'
                                    ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700 active:text-blue-600'
                            }`}
                        >
                            Results
                        </button>
                    </nav>
                </div>

                <div className="p-4 sm:p-6">
                    {/* Overview Tab - Teams and Pools combined */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Teams Section */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                        Teams ({teams.length})
                                    </h2>
                                {isLoggedIn && (
                                    <Button
                                        onClick={() => setIsCreateTeamModalOpen(true)}
                                        size="md"
                                        className="w-full sm:w-auto"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Team
                                    </Button>
                                )}
                            </div>

                            {!isLoggedIn && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-blue-700 text-xs sm:text-sm">
                                        <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> You're in view-only mode. Login to add or edit teams.</span>
                                    </p>
                                </div>
                            )}


                            {teamsLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-lg shadow-md p-6">
                                            <LoadingSkeleton lines={4} />
                                        </div>
                                    ))}
                                </div>
                            ) : paginatedTeams.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg px-4">
                                    <div className="text-gray-500 text-base sm:text-lg">No teams registered yet</div>
                                    <p className="text-gray-400 mt-2 text-sm sm:text-base">Add the first team to get started</p>
                                    {isLoggedIn && (
                                        <Button
                                            onClick={() => setIsCreateTeamModalOpen(true)}
                                            size="md"
                                            className="mt-4"
                                        >
                                            Add First Team
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {paginatedTeams.map((team) => (
                                            <TeamCard
                                                key={team.id}
                                                team={team}
                                                tournamentId={tournamentId}
                                                onTeamDeleted={handleTeamDeleted}
                                            />
                                        ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="mt-6">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={goToPage}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            </div>

                            {/* Pools Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                                    Pools
                                </h2>
                                <PoolManager
                                    tournamentId={tournamentId}
                                    onPoolsUpdated={handlePoolsUpdated}
                                    refreshTrigger={poolRefreshTrigger}
                                />
                            </div>
                        </div>
                    )}

                    {/* Matches Tab */}
                    {activeTab === 'matches' && (
                        <MatchManager
                            tournamentId={tournamentId}
                            onMatchUpdated={handleMatchUpdated}
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

            {/* Tournament Standings Section - Only show on Overview and Results tabs */}
            {(activeTab === 'overview' || activeTab === 'results') && (
                <div className="mt-6 sm:mt-8">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                <span className="inline-flex items-center gap-2"><Trophy className="w-5 h-5" /> Tournament Standings</span>
                            </h2>
                            <button
                                onClick={() => setRefreshTrigger(prev => prev + 1)}
                                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium w-full sm:w-auto"
                            >
                                <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</span>
                            </button>
                        </div>

                        <TournamentStandings
                            tournamentId={tournamentId}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>
                </div>
            )}

            {/* Floating Add Team Button for Mobile */}
            {isLoggedIn && activeTab === 'overview' && (
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

            {/* Tournament Configuration Modal */}
            {isLoggedIn && isAdmin && (
                <TournamentConfigModal
                    isOpen={isConfigModalOpen}
                    onClose={() => setIsConfigModalOpen(false)}
                    tournamentId={tournamentId}
                    onConfigUpdated={() => {
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            )}
            </div>
        </div>
    );
};

export default TournamentDetails;