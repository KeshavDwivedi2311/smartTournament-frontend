import React, { useState, useCallback, useRef } from 'react';
import { matchService } from '../services/matchService';
import { XCircle, Trophy, RefreshCw, Flag, Minus, Plus } from 'lucide-react';

const LiveScoreUpdate = ({ match, onClose, onComplete }) => {
  const [scores, setScores] = useState({
    team1Score: match.team1Score || 0,
    team2Score: match.team2Score || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animatingTeam, setAnimatingTeam] = useState(null);
  const scoresRef = useRef(scores);

  React.useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  const winner = scores.team1Score === scores.team2Score
    ? null
    : scores.team1Score > scores.team2Score ? 'team1' : 'team2';

  const totalPoints = scores.team1Score + scores.team2Score;
  const maxScore = match.targetPoints;

  const getWinProbability = () => {
    if (totalPoints === 0) return 50;
    return Math.round((scores.team1Score / Math.max(totalPoints, 1)) * 100);
  };
  const team1Prob = getWinProbability();

  const updateScore = useCallback(async (team, increment) => {
    if (loading) return;
    setError(null);
    setLoading(true);

    const currentScores = scoresRef.current;
    const newScores = {
      team1Score: team === 'team1' ? Math.max(0, currentScores.team1Score + increment) : currentScores.team1Score,
      team2Score: team === 'team2' ? Math.max(0, currentScores.team2Score + increment) : currentScores.team2Score
    };

    if (maxScore && (newScores.team1Score > maxScore || newScores.team2Score > maxScore)) {
      setError(`Score cannot exceed target points (${maxScore})`);
      setLoading(false);
      return;
    }

    if (increment > 0) {
      setAnimatingTeam(team);
      setTimeout(() => setAnimatingTeam(null), 400);
    }

    setScores(newScores);

    try {
      const response = await matchService.updateMatch(match.id, {
        team1Score: newScores.team1Score,
        team2Score: newScores.team2Score
      });
      if (response?.data) {
        setScores({
          team1Score: response.data.team1Score ?? newScores.team1Score,
          team2Score: response.data.team2Score ?? newScores.team2Score
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update score');
      setScores({ team1Score: match.team1Score || 0, team2Score: match.team2Score || 0 });
    } finally {
      setLoading(false);
    }
  }, [match.id, match.team1Score, match.team2Score, match.targetPoints, loading]);

  const completeMatch = async () => {
    if (scores.team1Score === scores.team2Score) {
      setError('Match cannot be completed with tied scores.');
      return;
    }
    if (maxScore && (scores.team1Score > maxScore || scores.team2Score > maxScore)) {
      setError(`Scores cannot exceed target points (${maxScore}).`);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await matchService.completeMatch(match.id, { team1Score: scores.team1Score, team2Score: scores.team2Score });
      if (onComplete) onComplete(); else onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to complete match');
    } finally {
      setLoading(false);
    }
  };

  const resetScores = () => { setScores({ team1Score: 0, team2Score: 0 }); setError(null); };

  /* ── Reusable score panel for one team ── */
  const ScorePanel = ({ team, teamName, score, isLeading }) => (
    <div className={`rounded-xl transition-all border ${
      isLeading ? 'bg-[var(--sport-green)]/10 border-[var(--sport-green)]/20' : 'bg-white/5 border-white/5'
    }`}>
      {/* Team name */}
      <div className={`px-4 pt-3 pb-1 text-sm font-semibold truncate text-center transition-colors ${
        isLeading ? 'text-[var(--sport-green)]' : 'text-slate-400'
      }`}>
        {isLeading && <Trophy className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
        {teamName}
      </div>

      {/* Score + buttons row */}
      <div className="flex items-center justify-center gap-3 px-3 pb-3 pt-1">
        <button
          onClick={() => updateScore(team, -1)}
          disabled={loading || score === 0}
          className="w-12 h-12 sm:w-11 sm:h-11 flex items-center justify-center bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed transition-all touch-manipulation"
        >
          <Minus className="w-5 h-5" strokeWidth={3} />
        </button>

        <div className={`
          text-4xl sm:text-5xl font-black tabular-nums text-white min-w-[3ch] text-center transition-all
          ${animatingTeam === team ? 'animate-score-punch' : ''}
        `}>
          {score}
        </div>

        <button
          onClick={() => updateScore(team, 1)}
          disabled={loading}
          className="w-12 h-12 sm:w-11 sm:h-11 flex items-center justify-center bg-[var(--sport-green)]/20 text-[var(--sport-green)] rounded-xl hover:bg-[var(--sport-green)]/30 active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed transition-all touch-manipulation"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[var(--sport-bg)] to-[var(--sport-bg-light)] border-t border-white/10 rounded-b-xl p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow */}
      {winner && (
        <div className={`absolute inset-0 opacity-5 pointer-events-none ${
          winner === 'team1' ? 'bg-gradient-to-r from-[var(--sport-green)] to-transparent' : 'bg-gradient-to-l from-[var(--sport-green)] to-transparent'
        }`} />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-live-dot" />
            <h4 className="font-bold text-white text-sm tracking-tight">Live Scoreboard</h4>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ═══ Scoreboard — stacked on mobile, side-by-side on desktop ═══ */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:items-center mb-5">
          {/* Team 1 */}
          <ScorePanel team="team1" teamName={match.team1Name} score={scores.team1Score} isLeading={winner === 'team1'} />

          {/* VS divider */}
          <div className="flex sm:flex-col items-center justify-center gap-2 py-1 sm:py-0">
            <div className="flex-1 h-px sm:h-auto sm:w-px sm:flex-1 bg-white/10 sm:hidden" />
            <span className="text-xs font-bold text-slate-500 tracking-widest">VS</span>
            <div className="flex-1 h-px sm:h-auto sm:w-px sm:flex-1 bg-white/10 sm:hidden" />
            {maxScore && (
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full hidden sm:block">
                Target {maxScore}
              </span>
            )}
          </div>

          {/* Team 2 */}
          <ScorePanel team="team2" teamName={match.team2Name} score={scores.team2Score} isLeading={winner === 'team2'} />
        </div>

        {/* Mobile target points */}
        {maxScore && (
          <div className="sm:hidden text-center mb-3">
            <span className="text-[11px] text-slate-500 bg-white/5 px-3 py-1 rounded-full">
              Target: {maxScore} pts
            </span>
          </div>
        )}

        {/* Win Probability Bar */}
        {totalPoints > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-medium">
              <span>{team1Prob}%</span>
              <span className="text-slate-600">Win Probability</span>
              <span>{100 - team1Prob}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-[var(--sport-blue)] to-[var(--sport-green)] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${team1Prob}%` }}
              />
            </div>
          </div>
        )}

        {/* Rally Counter */}
        <div className="flex items-center justify-center gap-4 mb-5 text-xs text-slate-500">
          <span>Rallies: <strong className="text-white">{totalPoints}</strong></span>
          {maxScore && (
            <span>Progress: <strong className="text-[var(--sport-blue)]">{Math.round((Math.max(scores.team1Score, scores.team2Score) / maxScore) * 100)}%</strong></span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:justify-center gap-2 sm:gap-3">
          <button
            onClick={resetScores}
            disabled={loading}
            className="px-4 py-3 sm:py-2 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 disabled:opacity-30 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 sm:py-2 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={completeMatch}
            disabled={loading || scores.team1Score === scores.team2Score}
            className="col-span-2 px-6 py-3 sm:py-2 bg-gradient-to-r from-[var(--sport-blue)] to-[var(--sport-green)] text-white rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold shadow-lg shadow-[var(--sport-blue)]/20 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Completing...
              </div>
            ) : (
              <><Flag className="w-3.5 h-3.5" /> Complete Match</>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[var(--sport-bg)]/60 rounded-b-xl flex items-center justify-center backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--sport-blue)] border-t-transparent" />
            <span className="text-sm font-medium text-white">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoreUpdate;
