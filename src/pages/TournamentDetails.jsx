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
import { Eye, Trophy, RefreshCw, Settings, ClipboardList, Activity, Swords, Users } from 'lucide-react';
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
                            onClick={() => navigate('/app')}
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
            {/* ═══ Tournament Hero Bar ═══ */}
            <div className="mb-4 sm:mb-6">
                {/* Top bar: Back + Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                    <button
                        onClick={() => navigate('/app')}
                        className="flex items-center text-slate-500 hover:text-[var(--sport-blue)] text-sm p-1.5 -ml-1.5 rounded-lg hover:bg-blue-50 transition-colors self-start gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Dashboard
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

                {/* ═══ HERO HEADER STRIP ═══ */}
                {tournament && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--sport-bg)] via-[var(--sport-bg-light)] to-[var(--sport-bg)] p-5 sm:p-8 mb-4 sm:mb-6 border border-white/[0.06] shadow-xl">
                        {/* Decorative background elements */}
                        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                            <svg viewBox="0 0 800 200" fill="none" className="w-full h-full">
                                <line x1="0" y1="100" x2="800" y2="100" stroke="white" strokeWidth="1" />
                                <line x1="400" y1="0" x2="400" y2="200" stroke="white" strokeWidth="1" />
                                <rect x="200" y="30" width="400" height="140" rx="8" stroke="white" strokeWidth="1" />
                            </svg>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--sport-blue)]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[var(--sport-green)]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Status + Type badges */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className={`
                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                    ${tournament.status === 'ONGOING'
                                        ? 'bg-[var(--sport-live)]/15 text-[var(--sport-live)] animate-status-glow'
                                        : tournament.status === 'CREATED'
                                        ? 'bg-[var(--sport-blue)]/15 text-[var(--sport-blue)]'
                                        : tournament.status === 'COMPLETED'
                                        ? 'bg-slate-500/15 text-slate-400'
                                        : 'bg-amber-500/15 text-amber-400'
                                    }
                                `}>
                                    {tournament.status === 'ONGOING' && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-live-dot" />
                                    )}
                                    {tournament.status || 'Unknown'}
                                </span>
                                {tournament.tournamentType && (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--sport-purple)]/15 text-[var(--sport-purple)]">
                                        {tournament.tournamentType}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 break-words leading-tight">
                                <Trophy className="w-7 h-7 text-[var(--sport-blue)] inline mr-2 -mt-1" />{tournament.title}
                            </h1>

                            {/* Subtitle info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mb-5">
                                {tournament.startDate && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                                {tournament.venue && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {tournament.venue}
                                    </span>
                                )}
                            </div>

                            {/* Stats strip */}
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-3.5 py-2 border border-white/[0.06]">
                                    <span className="text-lg font-bold text-[var(--sport-blue)]">{teams.length}</span>
                                    <span className="text-xs text-slate-400 font-medium">Teams</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-3.5 py-2 border border-white/[0.06]">
                                    <span className="text-lg font-bold text-[var(--sport-green)]">{pools.length}</span>
                                    <span className="text-xs text-slate-400 font-medium">Pools</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-3.5 py-2 border border-white/[0.06]">
                                    <span className="text-lg font-bold text-[var(--sport-purple)]">{tournament.maxTeams || '∞'}</span>
                                    <span className="text-xs text-slate-400 font-medium">Max Teams</span>
                                </div>
                            </div>

                            {tournament.description && (
                                <p className="text-slate-400 mt-4 text-sm sm:text-base max-w-2xl leading-relaxed">{tournament.description}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ Sport Tab Navigation ═══ */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <nav className="flex overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-2">
                        {[
                          { key: 'overview', label: 'Overview', Icon: ClipboardList },
                          { key: 'matches', label: 'Matches', Icon: Activity },
                          { key: 'knockout', label: 'Knockout', Icon: Swords },
                          { key: 'results', label: 'Results', Icon: Trophy },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    relative px-4 sm:px-6 py-3.5 sm:py-3 font-medium text-sm whitespace-nowrap flex-shrink-0
                                    min-h-[48px] sm:min-h-0 touch-manipulation transition-all duration-200
                                    flex items-center gap-1.5
                                    ${activeTab === tab.key
                                        ? 'text-[var(--sport-bg)] font-semibold'
                                        : 'text-gray-500 hover:text-gray-700 active:text-blue-600'
                                    }
                                `}
                            >
                                <tab.Icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.key && (
                                    <span
                                        className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-gradient-to-r from-[var(--sport-blue)] to-[var(--sport-green)]"
                                        style={{ animation: 'slideInTab 0.25s ease-out both' }}
                                    />
                                )}
                            </button>
                        ))}
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
                                <div className="text-center py-12 sm:py-16 px-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sport-blue)]/10 to-[var(--sport-green)]/10 flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-[var(--sport-blue)]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No teams registered yet</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Add the first team to get started</p>
                                    {isLoggedIn && (
                                        <Button onClick={() => setIsCreateTeamModalOpen(true)} size="md" className="mt-5">
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
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 gap-3 sm:gap-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-[var(--sport-blue)]" /> Tournament Standings
                            </h2>
                            <button
                                onClick={() => setRefreshTrigger(prev => prev + 1)}
                                className="px-4 py-2 bg-[var(--sport-blue)] text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" /> Refresh
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            <TournamentStandings
                                tournamentId={tournamentId}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
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