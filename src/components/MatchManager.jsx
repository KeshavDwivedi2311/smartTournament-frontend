import React, { useState, useEffect } from 'react';
import MatchDashboard from './MatchBoard';
import { poolService } from '../services/poolService';
import { useAuth } from '../contexts/AuthContext';
import CustomMatchModal from './CustomMatchModal';
import { Activity, Eye, Trophy } from 'lucide-react';

const MatchManager = ({ tournamentId, onMatchUpdated }) => {
    const { isAdmin, isLoggedIn } = useAuth();
    const [pools, setPools] = useState([]);
    const [selectedPool, setSelectedPool] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isPoolSelectorOpen, setIsPoolSelectorOpen] = useState(false);
    const [isCustomMatchModalOpen, setIsCustomMatchModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchPools();
    }, [tournamentId]);

    const fetchPools = async () => {
        try {
            const response = await poolService.getPoolsByTournament(tournamentId);
            const poolsData = response.data || [];
            setPools(poolsData);
        } catch (err) {
            console.error('Error fetching pools:', err);
            setPools([]);
        } finally {
            setLoading(false);
        }
    };

    const generateMatches = async () => {
        // Implementation for generating matches
    };

    const resetAllMatches = async () => {
        // Implementation for resetting matches
    };

    const refreshMatches = async () => {
        // Implementation for refreshing matches
        fetchPools();
    };

    const handleMatchCompleted = async (matchId, result) => {
        try {
            // Update the match result
            await matchService.updateMatchResult(matchId, result);

            // Refresh local data
            await loadMatches();

            // Notify parent component that match was updated
            if (onMatchUpdated) {
                console.log('MatchManager: Notifying parent of match update');
                onMatchUpdated();
            }
        } catch (error) {
            console.error('Error updating match:', error);
        }
    };

    const getSelectedPoolInfo = () => {
        if (selectedPool === 'all') return { name: 'All Pools', teams: pools.reduce((acc, pool) => acc + (pool.teams?.length || 0), 0) };
        return pools.find(p => p.id === selectedPool) || { name: 'Unknown Pool', teams: 0 };
    };

    const handlePoolSelect = (poolId) => {
        setSelectedPool(poolId);
        setIsPoolSelectorOpen(false);
    };

    const handleCustomMatchCreated = () => {
        setIsCustomMatchModalOpen(false);
        refreshMatches();
        if (onMatchUpdated) {
            onMatchUpdated();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32 sm:h-64">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm sm:text-base">Loading matches...</span>
            </div>
        );
    }

    if (pools.length === 0) {
        return (
            <div className="text-center py-12 sm:py-16 px-6">
                <div className="relative inline-block mb-5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--sport-blue)]/10 to-[var(--sport-purple)]/10 flex items-center justify-center mx-auto">
                        <Activity className="w-8 h-8 text-[var(--sport-blue)]" />
                    </div>
                    <svg className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-3 opacity-15" viewBox="0 0 96 12" fill="none">
                        <line x1="0" y1="6" x2="96" y2="6" stroke="var(--sport-blue)" strokeWidth="1.5" />
                        <line x1="48" y1="0" x2="48" y2="12" stroke="var(--sport-blue)" strokeWidth="1.5" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No pools available</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Create pools first, then matches will appear here when scheduled.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header with Match Dashboard Title */}
            <div className="bg-gradient-to-r from-[var(--sport-bg)] via-[var(--sport-bg-light)] to-[var(--sport-bg)] text-white rounded-xl p-4 sm:p-6 border border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2">
                            <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--sport-green)]" /> Match Dashboard
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base">Manage and track all tournament matches</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle - Desktop Only */}
                        <div className="hidden sm:flex bg-white/10 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'grid' ? 'bg-white text-[var(--sport-bg)]' : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'list' ? 'bg-white text-[var(--sport-bg)]' : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Read-only notice for non-admin users */}
            {!isAdmin && isLoggedIn && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-blue-700 text-sm sm:text-base">
                            <Eye className="w-4 h-4 inline mr-1" /> Read-only mode. Contact admin to manage matches.
                        </p>
                    </div>
                </div>
            )}

            {/* View-only notice for non-logged-in users */}
            {!isLoggedIn && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="text-gray-700 text-sm sm:text-base">
                            <Eye className="w-4 h-4 inline mr-1" /> Viewing matches in read-only mode. Login to interact with matches.
                        </p>
                    </div>
                </div>
            )}



            {/* Pool Selection */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Mobile Pool Selector (Dropdown) */}
                <div className="sm:hidden border-b border-gray-200">
                    <button
                        onClick={() => setIsPoolSelectorOpen(!isPoolSelectorOpen)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700">Pool:</span>
                            <span className="ml-2 font-bold text-blue-600">
                                {getSelectedPoolInfo().name}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                                ({getSelectedPoolInfo().teams} teams)
                            </span>
                        </div>
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                                isPoolSelectorOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isPoolSelectorOpen && (
                        <div className="bg-white border-t border-gray-200">
                            <button
                                onClick={() => handlePoolSelect('all')}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                                    selectedPool === 'all' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`font-medium ${
                                            selectedPool === 'all' ? 'text-blue-700' : 'text-gray-900'
                                        }`}>
                                            All Pools
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {pools.reduce((acc, pool) => acc + (pool.teams?.length || 0), 0)} total teams
                                        </div>
                                    </div>
                                    {selectedPool === 'all' && (
                                        <div className="text-blue-500">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>
                            {pools.map((pool) => (
                                <button
                                    key={pool.id}
                                    onClick={() => handlePoolSelect(pool.id)}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                        selectedPool === pool.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className={`font-medium ${
                                                selectedPool === pool.id ? 'text-blue-700' : 'text-gray-900'
                                            }`}>
                                                {pool.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {pool.teams?.length || 0} teams
                                                {pool.matches?.length > 0 && (
                                                    <span className="ml-2">
                                                        • {pool.matches.filter(m => m.status === 'COMPLETED').length}/{pool.matches.length} matches
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {selectedPool === pool.id && (
                                            <div className="text-blue-500">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Pool Selector (Tabs) */}
                <div className="hidden sm:block p-4">
                    <h3 className="font-semibold mb-3 text-gray-700">Select Pool to View Matches:</h3>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedPool('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                selectedPool === 'all'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                        >
                            All Pools
                            <span className="ml-2 text-xs opacity-75">
                                ({pools.reduce((acc, pool) => acc + (pool.teams?.length || 0), 0)} teams)
                            </span>
                        </button>
                        {pools.map((pool) => (
                            <button
                                key={pool.id}
                                onClick={() => setSelectedPool(pool.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    selectedPool === pool.id
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                            >
                                {pool.name}
                                <span className="ml-2 text-xs opacity-75">
                                    ({pool.teams?.length || 0} teams)
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Match Content */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {selectedPool === 'all' ? (
                    <div className="p-3 sm:p-6">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><Trophy className="w-5 h-5" /> All Pool Matches Overview</h3>
                            <p className="text-sm sm:text-base text-gray-600">Next upcoming matches from all pools</p>
                        </div>

                        {/* Show only next matches from all pools */}
                        <div className={`
                            ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6' : 'space-y-4 sm:space-y-6'}
                        `}>
                            {pools.map((pool) => (
                                <div key={pool.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-3 sm:px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm sm:text-lg font-bold text-gray-800">{pool.name}</h4>
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                <span>{pool.teams ? pool.teams.length : 0} teams</span>
                                                {pool.matches?.length > 0 && (
                                                    <span className="hidden sm:inline">
                                                        • {pool.matches.filter(m => m.status === 'COMPLETED').length}/{pool.matches.length} matches
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 sm:p-4">
                                        <MatchDashboard
                                            poolId={pool.id}
                                            showOnlyNext={true}
                                            maxNextMatches={1}
                                            onMatchUpdated={handleMatchCompleted}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-3 sm:p-6">
                        <div className="text-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                {pools.find(p => p.id === selectedPool)?.name} Matches
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">All matches for this pool</p>
                        </div>
                        <MatchDashboard
                            poolId={selectedPool}
                            showOnlyNext={false}
                            maxNextMatches={2}
                            onMatchUpdated={handleMatchCompleted}
                        />
                    </div>
                )}
            </div>

            {/* Custom Match Modal */}
            {isCustomMatchModalOpen && (
                <CustomMatchModal
                    tournamentId={tournamentId}
                    onClose={() => setIsCustomMatchModalOpen(false)}
                    onMatchCreated={handleCustomMatchCreated}
                />
            )}
        </div>
    );
};

export default MatchManager;