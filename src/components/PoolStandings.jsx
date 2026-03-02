import React, { useState, useEffect } from 'react';
import { poolService } from '../services/poolService';
import { Crown, Medal, CheckCircle2, BarChart3, Activity } from 'lucide-react';

const RANK_STYLES = [
  'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',   // 1st
  'bg-gradient-to-br from-slate-300 to-slate-400 text-white',    // 2nd
  'bg-gradient-to-br from-orange-300 to-orange-500 text-white',  // 3rd
];
const QUALIFY_LINE = 2; // Top 2 qualify

const PoolStandings = ({ poolId, refreshTrigger }) => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    useEffect(() => {
        if (poolId) loadStandings();
    }, [poolId]);

    useEffect(() => {
        if (refreshTrigger > 0 && poolId) loadStandings();
    }, [refreshTrigger, poolId]);

    const loadStandings = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!poolService.getPoolStandings) throw new Error('getPoolStandings method not found in poolService');
            const standingsData = await poolService.getPoolStandings(poolId);
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
        return form.split('').slice(-5);
    };

    const formatPercentage = (percentage) => {
        if (percentage === null || percentage === undefined) return '0%';
        return `${percentage.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-[var(--sport-blue)] border-t-transparent" />
                <span className="ml-3 text-sm sm:text-base text-gray-600">Loading standings...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
                <button onClick={loadStandings} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    if (standings.length === 0) {
        return (
            <div className="text-center py-10 px-4">
                <Activity className="w-8 h-8 text-[var(--sport-blue)] mx-auto mb-3" />
                <div className="text-gray-500 text-base font-medium">No standings data yet</div>
                <p className="text-gray-400 mt-1 text-sm">Complete some matches to see rankings</p>
                <button onClick={loadStandings} className="mt-4 px-4 py-2 bg-[var(--sport-blue)] text-white rounded-lg hover:opacity-90 text-sm font-medium transition-opacity">
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* ═══ Header ═══ */}
            <div className="bg-gradient-to-r from-[var(--sport-bg)] via-[var(--sport-bg-light)] to-[var(--sport-bg)] text-white px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[var(--sport-blue)]" />
                            {standings[0]?.poolName} — Standings
                        </h3>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1">
                            Live tournament standings • Top {QUALIFY_LINE} qualify
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle - mobile */}
                        <div className="sm:hidden flex bg-white/10 rounded-lg p-0.5">
                            <button onClick={() => setViewMode('table')} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-[var(--sport-bg)] font-semibold' : 'text-slate-300'}`}>
                                Table
                            </button>
                            <button onClick={() => setViewMode('cards')} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white text-[var(--sport-bg)] font-semibold' : 'text-slate-300'}`}>
                                Cards
                            </button>
                        </div>
                        {refreshTrigger > 0 && (
                            <div className="bg-white/10 rounded-lg px-3 py-1.5">
                                <div className="text-[10px] text-slate-400">Updated</div>
                                <div className="text-xs font-medium text-white">{new Date().toLocaleTimeString()}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Mobile Card View ═══ */}
            {viewMode === 'cards' && (
                <div className="sm:hidden p-3 space-y-2">
                    {standings.map((team, index) => {
                        const isQualified = index < QUALIFY_LINE;
                        const rankStyle = RANK_STYLES[index];
                        return (
                            <div
                                key={team.teamId}
                                className={`
                                    rounded-xl p-3 border transition-all
                                    ${index === 0 ? 'bg-gradient-to-r from-amber-50 to-green-50 border-amber-200 shadow-sm' :
                                      isQualified ? 'bg-green-50/50 border-green-200' :
                                      'bg-gray-50 border-gray-200'}
                                `}
                            >
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2.5">
                                        {/* Rank */}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${rankStyle || 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                            {team.position}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm leading-tight">
                                                {team.teamName}
                                            </div>
                                            {isQualified && (
                                                <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium mt-0.5">
                                                    <CheckCircle2 className="w-3 h-3" /> Qualified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-[var(--sport-blue)]">{team.tournamentPoints}</div>
                                        <div className="text-[10px] text-gray-400 font-medium">PTS</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-2.5">
                                    <div className="text-center bg-white rounded-lg py-1.5 border border-gray-100">
                                        <div className="text-xs text-gray-400">Record</div>
                                        <div className="font-bold text-sm">
                                            <span className="text-green-600">{team.wins}</span>
                                            <span className="text-gray-300">-</span>
                                            <span className="text-red-500">{team.losses}</span>
                                        </div>
                                    </div>
                                    <div className="text-center bg-white rounded-lg py-1.5 border border-gray-100">
                                        <div className="text-xs text-gray-400">Diff</div>
                                        <div className={`font-bold text-sm ${team.pointDifference >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {team.pointDifference >= 0 ? '+' : ''}{team.pointDifference}
                                        </div>
                                    </div>
                                    <div className="text-center bg-white rounded-lg py-1.5 border border-gray-100">
                                        <div className="text-xs text-gray-400">Win%</div>
                                        <div className={`font-bold text-sm ${
                                            team.winPercentage >= 75 ? 'text-green-600' :
                                            team.winPercentage >= 50 ? 'text-amber-600' : 'text-red-500'
                                        }`}>
                                            {formatPercentage(team.winPercentage)}
                                        </div>
                                    </div>
                                </div>
                                {/* Form */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400 font-medium">Form:</span>
                                    <div className="flex gap-1">
                                        {formatForm(team.form).map((result, idx) => (
                                            <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                result === 'W' ? 'bg-green-500 text-white' :
                                                result === 'L' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
                                            }`}>{result}</span>
                                        ))}
                                        {formatForm(team.form).length === 0 && <span className="text-gray-400 text-xs">—</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ Esports Table ═══ */}
            <div className={`${viewMode === 'cards' ? 'hidden sm:block' : ''} overflow-x-auto`}>
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                            <th className="px-3 sm:px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-14">#</th>
                            <th className="px-3 sm:px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Team</th>
                            <th className="px-2 sm:px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">MP</th>
                            <th className="px-2 sm:px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">W</th>
                            <th className="px-2 sm:px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">L</th>
                            <th className="hidden sm:table-cell px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PF</th>
                            <th className="hidden sm:table-cell px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PA</th>
                            <th className="px-2 sm:px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">+/−</th>
                            <th className="px-2 sm:px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PTS</th>
                            <th className="hidden md:table-cell px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Form</th>
                            <th className="hidden lg:table-cell px-3 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Win%</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {standings.map((team, index) => {
                            const isQualified = index < QUALIFY_LINE;
                            const rankStyle = RANK_STYLES[index];
                            const isLastQualified = index === QUALIFY_LINE - 1;

                            return (
                                <React.Fragment key={team.teamId}>
                                    <tr className={`
                                        transition-colors group
                                        ${index === 0 ? 'bg-gradient-to-r from-amber-50/80 to-green-50/60' :
                                          isQualified ? 'bg-green-50/40' : 'hover:bg-slate-50'}
                                    `}>
                                        {/* Position */}
                                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankStyle || 'bg-gray-100 text-gray-500'}`}>
                                                    {team.position}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Team Name + Label */}
                                        <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                {/* Team Avatar */}
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                                    ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                                                      isQualified ? 'bg-gradient-to-br from-[var(--sport-blue)] to-[var(--sport-green)] text-white' :
                                                      'bg-gray-200 text-gray-600'}
                                                `}>
                                                    {team.teamName?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 truncate max-w-24 sm:max-w-none group-hover:text-[var(--sport-blue)] transition-colors">
                                                        {team.teamName}
                                                    </div>
                                                    {index === 0 && (
                                                        <div className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                                                            <Crown className="w-3 h-3" /> Pool Leader
                                                        </div>
                                                    )}
                                                    {index === 1 && (
                                                        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                                            <Medal className="w-3 h-3" /> Runner-up
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* MP */}
                                        <td className="px-2 sm:px-3 py-3 text-center text-sm font-medium text-gray-700">
                                            {team.matchesPlayed}
                                        </td>

                                        {/* Wins */}
                                        <td className="px-2 sm:px-3 py-3 text-center text-sm font-bold text-green-600">
                                            {team.wins}
                                        </td>

                                        {/* Losses */}
                                        <td className="px-2 sm:px-3 py-3 text-center text-sm font-bold text-red-500">
                                            {team.losses}
                                        </td>

                                        {/* PF */}
                                        <td className="hidden sm:table-cell px-3 py-3 text-center text-sm font-medium text-blue-600">
                                            {team.pointsScored}
                                        </td>

                                        {/* PA */}
                                        <td className="hidden sm:table-cell px-3 py-3 text-center text-sm font-medium text-red-400">
                                            {team.pointsConceded}
                                        </td>

                                        {/* +/- */}
                                        <td className="px-2 sm:px-3 py-3 text-center text-sm font-bold">
                                            <span className={`
                                                px-1.5 py-0.5 rounded
                                                ${team.pointDifference > 0 ? 'text-green-700 bg-green-100' :
                                                  team.pointDifference < 0 ? 'text-red-600 bg-red-50' : 'text-gray-500'}
                                            `}>
                                                {team.pointDifference >= 0 ? '+' : ''}{team.pointDifference}
                                            </span>
                                        </td>

                                        {/* PTS */}
                                        <td className="px-2 sm:px-3 py-3 text-center">
                                            <span className="text-base sm:text-lg font-black text-[var(--sport-blue)]">
                                                {team.tournamentPoints}
                                            </span>
                                        </td>

                                        {/* Form */}
                                        <td className="hidden md:table-cell px-3 py-3">
                                            <div className="flex justify-center gap-1">
                                                {formatForm(team.form).map((result, idx) => (
                                                    <span key={idx} className={`
                                                        w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm
                                                        ${result === 'W' ? 'bg-green-500 text-white' :
                                                          result === 'L' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'}
                                                    `}>{result}</span>
                                                ))}
                                                {formatForm(team.form).length === 0 && <span className="text-gray-400 text-xs">—</span>}
                                            </div>
                                        </td>

                                        {/* Win% */}
                                        <td className="hidden lg:table-cell px-3 py-3 text-center text-sm font-semibold">
                                            <span className={`
                                                ${team.winPercentage >= 75 ? 'text-green-600' :
                                                  team.winPercentage >= 50 ? 'text-amber-600' : 'text-red-500'}
                                            `}>
                                                {formatPercentage(team.winPercentage)}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* ═══ Qualification Divider Line ═══ */}
                                    {isLastQualified && index < standings.length - 1 && (
                                        <tr>
                                            <td colSpan="11" className="px-0 py-0">
                                                <div className="flex items-center gap-2 px-4">
                                                    <div className="flex-1 border-t-2 border-dashed border-[var(--sport-blue)]/30" />
                                                    <span className="text-[10px] font-semibold text-[var(--sport-blue)]/60 uppercase tracking-wider whitespace-nowrap py-1">
                                                        Qualification Line
                                                    </span>
                                                    <div className="flex-1 border-t-2 border-dashed border-[var(--sport-blue)]/30" />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ═══ Footer Legend ═══ */}
            <div className="bg-gray-50 px-4 sm:px-6 py-2.5 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-gray-500">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span><strong>MP:</strong> Matches</span>
                        <span><strong>W:</strong> Wins</span>
                        <span><strong>L:</strong> Losses</span>
                        <span className="hidden sm:inline"><strong>PF:</strong> Points For</span>
                        <span className="hidden sm:inline"><strong>PA:</strong> Points Against</span>
                        <span><strong>+/−:</strong> Diff</span>
                        <span><strong>PTS:</strong> Points</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
                            Qualified
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
                            Leader
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoolStandings;
