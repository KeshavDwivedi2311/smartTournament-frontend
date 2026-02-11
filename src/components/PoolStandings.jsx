import React, { useState, useEffect } from 'react';
import { poolService } from '../services/poolService';
import { Crown, Medal, CheckCircle2, BarChart3 } from 'lucide-react';

const PoolStandings = ({ poolId, refreshTrigger }) => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

    useEffect(() => {
        if (poolId) {
            loadStandings();
        }
    }, [poolId]);

    useEffect(() => {
        if (refreshTrigger > 0 && poolId) {
            console.log('PoolStandings: Refreshing due to match update');
            loadStandings();
        }
    }, [refreshTrigger, poolId]);

    const loadStandings = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading standings for pool:', poolId);

            // Check if the method exists
            if (!poolService.getPoolStandings) {
                throw new Error('getPoolStandings method not found in poolService');
            }

            const standingsData = await poolService.getPoolStandings(poolId);
            console.log('Standings data received:', standingsData);

            setStandings(Array.isArray(standingsData) ? standingsData : []);
        } catch (err) {
            console.error('Error loading standings:', err);
            setError(`Failed to load standings: ${err.message}`);
            setStandings([]);
        } finally {
            setLoading(false);
        }
    };

    const formatForm = (form) => {
        if (!form) return [];
        return form.split('').slice(-5); // Show last 5 results
    };

    const formatPercentage = (percentage) => {
        if (percentage === null || percentage === undefined) return '0%';
        return `${percentage.toFixed(1)}%`;
    };

    const getPositionBadge = (index, position) => {
        if (index === 0) {
            return {
                bg: 'bg-yellow-400',
                text: 'text-yellow-900',
                icon: <Crown className="w-3 h-3" />,
                label: 'Pool Leader'
            };
        } else if (index === 1) {
            return {
                bg: 'bg-gray-300',
                text: 'text-gray-700',
                icon: <Medal className="w-3 h-3" />,
                label: 'Runner-up'
            };
        } else if (index < 2) {
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: <CheckCircle2 className="w-3 h-3" />,
                label: 'Qualified'
            };
        } else {
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-600',
                icon: null,
                label: ''
            };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm sm:text-base">Loading standings...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
                <button
                    onClick={loadStandings}
                    className="mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                    Retry
                </button>
                <div className="mt-2 text-xs sm:text-sm text-gray-600">
                    <p>Debug info:</p>
                    <p>Pool ID: {poolId}</p>
                    <p>Refresh Trigger: {refreshTrigger}</p>
                </div>
            </div>
        );
    }

    if (standings.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-base sm:text-lg">No standings data available</div>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">Complete some matches to see standings</p>
                <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    <p>Pool ID: {poolId}</p>
                    <button
                        onClick={loadStandings}
                        className="mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5" /> {standings[0]?.poolName} - Standings</h3>
                        <p className="text-blue-100 text-xs sm:text-sm mt-1">
                            Live tournament standings • Updated in real-time
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* View Mode Toggle - Mobile Only */}
                        <div className="sm:hidden flex bg-white bg-opacity-20 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-2 py-1 text-xs rounded ${
                                    viewMode === 'table' 
                                        ? 'bg-white text-blue-600' 
                                        : 'text-blue-100'
                                }`}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-2 py-1 text-xs rounded ${
                                    viewMode === 'cards' 
                                        ? 'bg-white text-blue-600' 
                                        : 'text-blue-100'
                                }`}
                            >
                                Cards
                            </button>
                        </div>
                        
                        {refreshTrigger > 0 && (
                            <div className="text-right">
                                <div className="bg-white bg-opacity-20 rounded-lg px-2 sm:px-3 py-1">
                                    <div className="text-xs text-blue-100">Last Updated</div>
                                    <div className="text-xs sm:text-sm font-medium">
                                        {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            {viewMode === 'cards' && (
                <div className="sm:hidden p-3 space-y-3">
                    {standings.map((team, index) => {
                        const badge = getPositionBadge(index, team.position);
                        return (
                            <div
                                key={team.teamId}
                                className={`
                                    border rounded-lg p-3 
                                    ${index < 2 ? 'border-green-300 bg-green-50' : 'border-gray-200'}
                                    ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-green-50 border-yellow-300' : ''}
                                `}
                            >
                                {/* Team Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                            ${badge.bg} ${badge.text}
                                        `}>
                                            {team.position}
                                        </span>
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {team.teamName}
                                            </div>
                                            {badge.label && (
                                                <div className="text-xs text-gray-600">
                                                    {badge.icon} {badge.label}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-blue-600">
                                            {team.tournamentPoints}
                                        </div>
                                        <div className="text-xs text-gray-500">pts</div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Record</div>
                                        <div className="font-medium text-sm">
                                            <span className="text-green-600">{team.wins}</span>-
                                            <span className="text-red-600">{team.losses}</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Points</div>
                                        <div className="font-medium text-sm">
                                            {team.pointsScored}-{team.pointsConceded}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Win%</div>
                                        <div className={`font-medium text-sm ${
                                            team.winPercentage >= 75 ? 'text-green-600' :
                                            team.winPercentage >= 50 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {formatPercentage(team.winPercentage)}
                                        </div>
                                    </div>
                                </div>

                                {/* Form and Difference */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Recent Form</div>
                                        <div className="flex space-x-1">
                                            {formatForm(team.form).map((result, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`
                                                        w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                                        ${result === 'W' ? 'bg-green-500 text-white' :
                                                          result === 'L' ? 'bg-red-500 text-white' :
                                                          'bg-gray-300 text-gray-600'}
                                                    `}
                                                >
                                                    {result}
                                                </span>
                                            ))}
                                            {formatForm(team.form).length === 0 && (
                                                <span className="text-gray-400 text-xs">No matches</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Diff</div>
                                        <div className={`font-bold text-sm ${
                                            team.pointDifference >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {team.pointDifference >= 0 ? '+' : ''}{team.pointDifference}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Desktop Table View */}
            <div className={`${viewMode === 'cards' ? 'hidden sm:block' : ''} overflow-x-auto`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pos
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Team
                            </th>
                            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                MP
                            </th>
                            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                W
                            </th>
                            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                L
                            </th>
                            <th className="hidden sm:table-cell px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PF
                            </th>
                            <th className="hidden sm:table-cell px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PA
                            </th>
                            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                +/-
                            </th>
                            <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pts
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Form
                            </th>
                            <th className="hidden lg:table-cell px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Win%
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {standings.map((team, index) => {
                            const badge = getPositionBadge(index, team.position);
                            return (
                                <tr
                                    key={team.teamId}
                                    className={`
                                        ${index < 2 ? 'bg-green-50 border-l-4 border-green-500' : ''}
                                        ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-green-50' : ''}
                                        hover:bg-gray-50 transition-colors
                                    `}
                                >
                                    {/* Position */}
                                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`
                                                w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold
                                                ${badge.bg} ${badge.text}
                                            `}>
                                                {team.position}
                                            </span>
                                            {index < 2 && (
                                                <div className="ml-1 sm:ml-2">
                                                    <span className="text-xs text-green-600 font-medium">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Team Name */}
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24 sm:max-w-none">
                                                    {team.teamName}
                                                </div>
                                                {index === 0 && (
                                                    <div className="text-xs text-yellow-600 font-medium hidden sm:flex items-center gap-1">
                                                        <Crown className="w-3 h-3" /> Pool Leader
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Matches Played */}
                                    <td className="px-1 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm text-gray-900 font-medium">
                                        {team.matchesPlayed}
                                    </td>

                                    {/* Wins */}
                                    <td className="px-1 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm text-green-600 font-bold">
                                        {team.wins}
                                    </td>

                                    {/* Losses */}
                                    <td className="px-1 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm text-red-600 font-bold">
                                        {team.losses}
                                    </td>

                                    {/* Points For - Hidden on mobile */}
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-center text-sm text-blue-600 font-medium">
                                        {team.pointsScored}
                                    </td>

                                    {/* Points Against - Hidden on mobile */}
                                    <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-center text-sm text-red-500 font-medium">
                                        {team.pointsConceded}
                                    </td>

                                    {/* Point Difference */}
                                    <td className="px-1 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-bold">
                                        <span className={team.pointDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {team.pointDifference >= 0 ? '+' : ''}{team.pointDifference}
                                        </span>
                                    </td>

                                    {/* Tournament Points */}
                                    <td className="px-1 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-center">
                                        <span className="text-sm sm:text-lg font-bold text-blue-600 bg-blue-50 px-1 sm:px-2 py-1 rounded">
                                            {team.tournamentPoints}
                                        </span>
                                    </td>

                                    {/* Form - Hidden on mobile and small tablets */}
                                    <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center space-x-1">
                                            {formatForm(team.form).map((result, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`
                                                        w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold
                                                        ${result === 'W' ? 'bg-green-500 text-white' :
                                                          result === 'L' ? 'bg-red-500 text-white' :
                                                          'bg-gray-300 text-gray-600'}
                                                    `}
                                                    title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                                                >
                                                    {result}
                                                </span>
                                            ))}
                                            {formatForm(team.form).length === 0 && (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Win Percentage - Hidden on mobile and tablets */}
                                    <td className="hidden lg:table-cell px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <span className={`
                                            ${team.winPercentage >= 75 ? 'text-green-600' :
                                              team.winPercentage >= 50 ? 'text-yellow-600' :
                                              'text-red-600'}
                                        `}>
                                            {formatPercentage(team.winPercentage)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer with Legend */}
            <div className="bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span><strong>MP:</strong> Matches</span>
                        <span><strong>W:</strong> Wins</span>
                        <span><strong>L:</strong> Losses</span>
                        <span className="hidden sm:inline"><strong>PF:</strong> Points For</span>
                        <span className="hidden sm:inline"><strong>PA:</strong> Points Against</span>
                        <span><strong>+/-:</strong> Difference</span>
                        <span><strong>Pts:</strong> Points</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="flex items-center">
                            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded mr-1"></span>
                            <span>Qualified</span>
                        </span>
                        <span className="flex items-center">
                            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded mr-1"></span>
                            <span>Leader</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoolStandings;