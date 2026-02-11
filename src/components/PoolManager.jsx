import React, { useState, useEffect } from 'react';
import { poolService } from '../services/poolService';
import { useAuth } from '../contexts/AuthContext';
import PoolStandings from './PoolStandings';
import { Waves, RefreshCw } from 'lucide-react';

const PoolManager = ({ tournamentId, onPoolsUpdated, refreshTrigger }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPool, setSelectedPool] = useState(null);
    const [isPoolSelectorOpen, setIsPoolSelectorOpen] = useState(false);

    // Load pools on mount and when tournament changes
    useEffect(() => {
        if (tournamentId) {
            loadPools();
        }
    }, [tournamentId]);

    // Refresh pools when refreshTrigger changes (when matches are completed)
    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log('PoolManager: Refreshing due to match update, trigger:', refreshTrigger);
            loadPools();
        }
    }, [refreshTrigger]);

    const loadPools = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('PoolManager: Loading pools for tournament:', tournamentId);

            const response = await poolService.getPoolsByTournament(tournamentId);
            const poolsData = response.data || response || [];

            console.log('PoolManager: Pools loaded:', poolsData);
            setPools(poolsData);

            if (poolsData.length > 0 && !selectedPool) {
                setSelectedPool(poolsData[0].id);
            }
        } catch (err) {
            console.error('PoolManager: Error loading pools:', err);
            setError('Failed to load pools');
            setPools([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePoolUpdate = () => {
        loadPools();
        if (onPoolsUpdated) {
            onPoolsUpdated();
        }
    };

    const getSelectedPoolInfo = () => {
        return pools.find(pool => pool.id === selectedPool);
    };

    const handlePoolSelect = (poolId) => {
        setSelectedPool(poolId);
        setIsPoolSelectorOpen(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm sm:text-base">Loading pools...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
                <button
                    onClick={loadPools}
                    className="mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Pool Management Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2"><Waves className="w-6 h-6 sm:w-7 sm:h-7" /> Pool Management</h2>
                        <p className="text-blue-100 text-sm sm:text-base">Manage pool phases and view live standings</p>
                    </div>
                    {refreshTrigger > 0 && (
                        <div className="text-xs sm:text-sm bg-white bg-opacity-20 rounded px-2 py-1 self-start sm:self-auto">
                            <RefreshCw className="w-3 h-3 inline mr-1" /> Auto-refreshed {refreshTrigger} times
                        </div>
                    )}
                </div>
            </div>

            {/* Pool Selection */}
            {pools.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Mobile Pool Selector (Dropdown) */}
                    <div className="sm:hidden border-b border-gray-200">
                        <button
                            onClick={() => setIsPoolSelectorOpen(!isPoolSelectorOpen)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-700">Selected Pool:</span>
                                <span className="ml-2 font-bold text-blue-600">
                                    {getSelectedPoolInfo()?.name || 'Select Pool'}
                                </span>
                                {getSelectedPoolInfo() && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        ({getSelectedPoolInfo()?.teams?.length || 0} teams)
                                    </span>
                                )}
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
                        <div className="flex flex-wrap gap-2 mb-6">
                            {pools.map((pool) => (
                                <button
                                    key={pool.id}
                                    onClick={() => setSelectedPool(pool.id)}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 ${
                                        selectedPool === pool.id
                                            ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="font-bold text-sm sm:text-base">{pool.name}</div>
                                        <div className="text-xs opacity-75">
                                            {pool.teams?.length || 0} teams
                                        </div>
                                        {pool.matches?.length > 0 && (
                                            <div className="text-xs opacity-75 mt-1">
                                                {pool.matches.filter(m => m.status === 'COMPLETED').length}/{pool.matches.length} matches
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pool Statistics Summary - Mobile */}
                    {selectedPool && getSelectedPoolInfo() && (
                        <div className="sm:hidden bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {getSelectedPoolInfo()?.teams?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Teams</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-green-600">
                                        {getSelectedPoolInfo()?.matches?.filter(m => m.status === 'COMPLETED').length || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Completed</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-orange-600">
                                        {getSelectedPoolInfo()?.matches?.filter(m => m.status === 'PENDING').length || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Pending</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected Pool Standings */}
                    <div className="p-0 sm:p-4">
                        {selectedPool && (
                            <PoolStandings
                                poolId={selectedPool}
                                refreshTrigger={refreshTrigger}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {pools.length === 0 && (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div className="text-gray-500 text-base sm:text-lg">No pools created yet</div>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base px-4">
                        Create pools to organize teams for league matches
                    </p>
                    {isLoggedIn && (
                        <div className="mt-4">
                            <button
                                onClick={loadPools}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                                Refresh Pools
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Admin Actions - Mobile Optimized */}
            {isLoggedIn && pools.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={handlePoolUpdate}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Data
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => {/* Add pool management functionality */}}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Manage Pools
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoolManager;