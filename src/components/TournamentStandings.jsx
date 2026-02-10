import React, { useState, useEffect } from 'react';
import { poolService } from '../services/poolService';
import PoolStandings from './PoolStandings';

const TournamentStandings = ({ tournamentId, refreshTrigger }) => {
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPool, setSelectedPool] = useState(null);

    useEffect(() => {
        if (tournamentId) {
            loadPools();
        }
    }, [tournamentId]);

    useEffect(() => {
        if (refreshTrigger > 0 && tournamentId) {
            console.log('TournamentStandings: Refreshing due to match update');
            loadPools();
        }
    }, [refreshTrigger, tournamentId]);

    const loadPools = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading pools for tournament:', tournamentId);

            const response = await poolService.getPoolsByTournament(tournamentId);
            console.log('Pools data received:', response);

            // Handle both direct data and response.data formats
            let poolsData;
            if (response && response.data) {
                // If response has a data property, use it
                poolsData = response.data;
            } else if (Array.isArray(response)) {
                // If response is directly an array
                poolsData = response;
            } else {
                // Fallback
                poolsData = [];
            }

            console.log('Processed pools data:', poolsData);
            setPools(Array.isArray(poolsData) ? poolsData : []);

            // Auto-select first pool if none selected
            if (poolsData && poolsData.length > 0 && !selectedPool) {
                setSelectedPool(poolsData[0].id);
                console.log('Auto-selected pool:', poolsData[0].id);
            }
        } catch (err) {
            console.error('Error loading pools:', err);
            setError(`Failed to load pools: ${err.message}`);
            setPools([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm sm:text-base">Loading tournament standings...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-red-700 text-sm sm:text-base break-words">{error}</p>
                <button
                    onClick={loadPools}
                    className="mt-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base font-medium transition-colors w-full sm:w-auto"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (pools.length === 0) {
        return (
            <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg px-4">
                <div className="text-gray-500 text-base sm:text-lg">No pools found</div>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">Create pools to see standings</p>
                <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    <p className="break-all">Tournament ID: {tournamentId}</p>
                    <button
                        onClick={loadPools}
                        className="mt-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base font-medium transition-colors"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Pool Selector */}
            {pools.length > 1 && (
                <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Select Pool</h3>
                    
                    {/* Mobile: Dropdown Selector */}
                    <div className="sm:hidden">
                        <select
                            value={selectedPool || ''}
                            onChange={(e) => setSelectedPool(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            {pools.map((pool) => (
                                <option key={pool.id} value={pool.id}>
                                    {pool.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Desktop: Button Grid */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                        {pools.map((pool) => (
                            <button
                                key={pool.id}
                                onClick={() => setSelectedPool(pool.id)}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                                    selectedPool === pool.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {pool.name}
                            </button>
                        ))}
                    </div>

                    {/* Mobile: Horizontal Scroll for many pools */}
                    {pools.length > 4 && (
                        <div className="sm:hidden mt-3">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {pools.map((pool) => (
                                    <button
                                        key={pool.id}
                                        onClick={() => setSelectedPool(pool.id)}
                                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap flex-shrink-0 ${
                                            selectedPool === pool.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {pool.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Pool Standings */}
            {selectedPool && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <PoolStandings
                        poolId={selectedPool}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            )}

            {/* Single Pool Display */}
            {pools.length === 1 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gray-50 px-3 sm:px-4 py-2 border-b">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {pools[0].name}
                        </h3>
                    </div>
                    <PoolStandings
                        poolId={pools[0].id}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            )}

            {/* Pool Summary for Mobile */}
            {pools.length > 1 && (
                <div className="sm:hidden bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700 font-medium">
                            Pool {pools.findIndex(p => p.id === selectedPool) + 1} of {pools.length}
                        </span>
                        <span className="text-blue-600">
                            {pools.find(p => p.id === selectedPool)?.name}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentStandings;