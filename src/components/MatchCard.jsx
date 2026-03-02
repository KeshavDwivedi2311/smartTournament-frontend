import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';
import Badge from './ui/Badge';
import Button from './ui/Button';
import LiveScoreUpdate from './LiveScoreUpdate';
import MatchTimer from './MatchTimer';
import { toast } from 'react-hot-toast';
import { Trophy } from 'lucide-react';

const MatchCard = ({
  match,
  onStartMatch,
  onMarkReady,
  onRefresh,
  onMatchUpdated,
  readOnly = false
}) => {
  const { isAdmin, isLoggedIn } = useAuth();
  const [showScoreUpdate, setShowScoreUpdate] = useState(false);
  const [courtNumber, setCourtNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [prevScores, setPrevScores] = useState({ t1: null, t2: null });
  const [scoreAnimating, setScoreAnimating] = useState({ t1: false, t2: false });

  // Use ref to persist the open state across re-renders
  const scoreUpdateOpenRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    scoreUpdateOpenRef.current = showScoreUpdate;
  }, [showScoreUpdate]);

  // Track score changes for animations
  useEffect(() => {
    if (match) {
      if (prevScores.t1 !== null && prevScores.t1 !== match.team1Score) {
        setScoreAnimating(s => ({ ...s, t1: true }));
        setTimeout(() => setScoreAnimating(s => ({ ...s, t1: false })), 400);
      }
      if (prevScores.t2 !== null && prevScores.t2 !== match.team2Score) {
        setScoreAnimating(s => ({ ...s, t2: true }));
        setTimeout(() => setScoreAnimating(s => ({ ...s, t2: false })), 400);
      }
      setPrevScores({ t1: match.team1Score, t2: match.team2Score });
    }
  }, [match?.team1Score, match?.team2Score]);

  if (!match) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-4">
        <p className="text-red-600 text-sm">Error: Match data is missing</p>
      </div>
    );
  }

  const canEdit = isLoggedIn && isAdmin && !readOnly;
  const matchStatus = match.status || 'SCHEDULED';
  const isLive = matchStatus === 'ONGOING';
  const isCompleted = matchStatus === 'COMPLETED';
  const shouldShowScoreUpdate = scoreUpdateOpenRef.current || showScoreUpdate;

  const team1Leading = (match.team1Score || 0) > (match.team2Score || 0);
  const team2Leading = (match.team2Score || 0) > (match.team1Score || 0);

  const isWinner = (teamId) => isCompleted && match.winnerId === teamId;

  // Primary action based on status
  const getPrimaryAction = () => {
    if (!isLoggedIn) return null;

    switch (matchStatus) {
      case 'SCHEDULED':
        return (
          <Button size="sm" onClick={() => onMarkReady(match.id)} loading={loading} disabled={loading} className="w-full sm:w-auto">
            Mark Ready
          </Button>
        );
      case 'READY':
      case 'NEXT':
        return (
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="number"
              placeholder="Court"
              value={courtNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) > 0 && parseInt(value) <= 99)) setCourtNumber(value);
              }}
              min="1" max="99"
              className="flex-1 sm:w-20 px-3 py-3 sm:py-1.5 border-2 border-gray-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sport-blue)] focus:border-[var(--sport-blue)]"
              disabled={loading}
              inputMode="numeric"
            />
            <Button size="sm" variant="success" onClick={handleStartMatch} disabled={!courtNumber.trim() || loading} loading={loading} className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0">
              Start
            </Button>
          </div>
        );
      case 'ONGOING':
        return (
          <Button
            size="sm"
            variant="warning"
            onClick={() => { scoreUpdateOpenRef.current = true; setShowScoreUpdate(true); }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Update Score
          </Button>
        );
      default:
        return null;
    }
  };

  const handleStartMatch = () => {
    if (courtNumber.trim()) { onStartMatch(match.id, courtNumber); setCourtNumber(''); }
  };

  const handleAction = async (actionFn, successMsg) => {
    if (!isLoggedIn) { toast.error('Please log in to perform this action'); return; }
    try {
      setLoading(true);
      await actionFn();
      toast.success(successMsg || 'Action completed');
      if (onRefresh) onRefresh();
      if (onMatchUpdated) onMatchUpdated();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Action failed');
    } finally {
      setLoading(false);
      setShowMoreActions(false);
    }
  };

  return (
    <div className={`
      relative rounded-xl overflow-hidden transition-all duration-300 sport-card-hover
      ${isLive
        ? 'bg-white border-2 border-[var(--sport-live)]/30 shadow-lg shadow-[var(--sport-live)]/5'
        : isCompleted
        ? 'bg-white border border-gray-200 opacity-90'
        : 'bg-white border border-gray-200 shadow-sm'
      }
    `}>
      {/* ═══ LIVE Glow Strip ═══ */}
      {isLive && (
        <div className="h-1 bg-gradient-to-r from-[var(--sport-live)] via-[var(--sport-blue)] to-[var(--sport-live)]" />
      )}

      <div className="p-4 sm:p-5">
        {/* ── Header: Status + Court + Actions ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--sport-live)]/10 text-[var(--sport-live)] animate-live-pulse">
                <span className="w-2 h-2 rounded-full bg-[var(--sport-live)] animate-live-dot" />
                LIVE
              </span>
            ) : (
              <Badge status={matchStatus} size="sm" />
            )}
            {match.courtNumber && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2"/></svg>
                Court {match.courtNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {(isLive || isCompleted) && (
              <MatchTimer match={match} targetPoints={match.targetPoints} />
            )}
            {canEdit && (
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="More actions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Broadcast Scoreboard ── */}
        <div className="mb-4">
          {/* Mobile Layout */}
          <div className="block sm:hidden space-y-1">
            {/* Team 1 Row */}
            <div className={`
              flex items-center justify-between p-3 rounded-lg transition-all
              ${team1Leading && isLive ? 'bg-[var(--sport-live)]/5 border-l-[3px] border-[var(--sport-live)]' :
                isWinner(match.team1Id) ? 'bg-green-50 border-l-[3px] border-green-500' :
                'bg-gray-50 border-l-[3px] border-transparent'}
            `}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isWinner(match.team1Id) && <Trophy className="w-4 h-4 text-green-600 shrink-0" />}
                <span className={`font-semibold text-sm truncate ${
                  isWinner(match.team1Id) ? 'text-green-700' :
                  team1Leading && isLive ? 'text-[var(--sport-live)]' : 'text-gray-800'
                }`}>
                  {match.team1Name || 'TBD'}
                </span>
              </div>
              {(isLive || isCompleted) && (
                <span className={`
                  text-xl font-bold tabular-nums min-w-[2ch] text-right
                  ${scoreAnimating.t1 ? 'animate-score-punch' : ''}
                  ${isWinner(match.team1Id) ? 'text-green-600' : team1Leading && isLive ? 'text-[var(--sport-live)]' : 'text-gray-700'}
                `}>
                  {match.team1Score || 0}
                </span>
              )}
            </div>

            {/* VS divider */}
            <div className="flex items-center justify-center py-0.5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="px-3 text-xs text-gray-400 font-medium">
                {isLive ? 'LIVE' : 'VS'}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Team 2 Row */}
            <div className={`
              flex items-center justify-between p-3 rounded-lg transition-all
              ${team2Leading && isLive ? 'bg-[var(--sport-live)]/5 border-l-[3px] border-[var(--sport-live)]' :
                isWinner(match.team2Id) ? 'bg-green-50 border-l-[3px] border-green-500' :
                'bg-gray-50 border-l-[3px] border-transparent'}
            `}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isWinner(match.team2Id) && <Trophy className="w-4 h-4 text-green-600 shrink-0" />}
                <span className={`font-semibold text-sm truncate ${
                  isWinner(match.team2Id) ? 'text-green-700' :
                  team2Leading && isLive ? 'text-[var(--sport-live)]' : 'text-gray-800'
                }`}>
                  {match.team2Name || 'TBD'}
                </span>
              </div>
              {(isLive || isCompleted) && (
                <span className={`
                  text-xl font-bold tabular-nums min-w-[2ch] text-right
                  ${scoreAnimating.t2 ? 'animate-score-punch' : ''}
                  ${isWinner(match.team2Id) ? 'text-green-600' : team2Leading && isLive ? 'text-[var(--sport-live)]' : 'text-gray-700'}
                `}>
                  {match.team2Score || 0}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Broadcast Layout */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            {/* Team 1 */}
            <div className={`text-right p-3 rounded-lg transition-all ${
              team1Leading && isLive ? 'bg-[var(--sport-live)]/5' :
              isWinner(match.team1Id) ? 'bg-green-50' : ''
            }`}>
              <div className={`font-semibold text-base lg:text-lg truncate flex items-center justify-end gap-2 ${
                isWinner(match.team1Id) ? 'text-green-700' :
                team1Leading && isLive ? 'text-gray-900' : 'text-gray-800'
              }`}>
                {isWinner(match.team1Id) && <Trophy className="w-4 h-4 text-green-600 shrink-0" />}
                {match.team1Name || 'TBD'}
              </div>
              {(isLive || isCompleted) && (
                <div className={`
                  text-3xl lg:text-4xl font-black mt-1 tabular-nums
                  ${scoreAnimating.t1 ? 'animate-score-punch' : ''}
                  ${isWinner(match.team1Id) ? 'text-green-600' :
                    team1Leading && isLive ? 'text-[var(--sport-live)]' : 'text-gray-600'}
                `}>
                  {match.team1Score || 0}
                </div>
              )}
            </div>

            {/* Center: Shuttle + VS */}
            <div className="text-center flex flex-col items-center justify-center">
              <div className="text-xs font-semibold text-gray-400 tracking-widest">VS</div>
              {isLive && match.targetPoints && (
                <div className="text-[10px] text-slate-400 mt-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
                  Race to {match.targetPoints}
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className={`text-left p-3 rounded-lg transition-all ${
              team2Leading && isLive ? 'bg-[var(--sport-live)]/5' :
              isWinner(match.team2Id) ? 'bg-green-50' : ''
            }`}>
              <div className={`font-semibold text-base lg:text-lg truncate flex items-center gap-2 ${
                isWinner(match.team2Id) ? 'text-green-700' :
                team2Leading && isLive ? 'text-gray-900' : 'text-gray-800'
              }`}>
                {match.team2Name || 'TBD'}
                {isWinner(match.team2Id) && <Trophy className="w-4 h-4 text-green-600 shrink-0" />}
              </div>
              {(isLive || isCompleted) && (
                <div className={`
                  text-3xl lg:text-4xl font-black mt-1 tabular-nums
                  ${scoreAnimating.t2 ? 'animate-score-punch' : ''}
                  ${isWinner(match.team2Id) ? 'text-green-600' :
                    team2Leading && isLive ? 'text-[var(--sport-live)]' : 'text-gray-600'}
                `}>
                  {match.team2Score || 0}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Primary Action ── */}
        <div className="flex justify-end">
          {getPrimaryAction() ? (
            <div className="w-full sm:w-auto">{getPrimaryAction()}</div>
          ) : (
            !isLoggedIn && (
              <p className="text-xs text-gray-400 text-right w-full">Login to manage</p>
            )
          )}
        </div>

        {/* ── More Actions Dropdown ── */}
        {showMoreActions && canEdit && (
          <div className="border-t border-gray-100 pt-3 mt-3 animate-fade-slide-up">
            <div className="text-xs font-medium text-gray-500 mb-2">Additional Actions:</div>
            <div className="flex flex-wrap gap-2">
              {matchStatus === 'SCHEDULED' && (
                <Button size="sm" variant="outline" onClick={() => handleAction(() => matchService.markAsNext(match.id), 'Marked as next')} loading={loading}>
                  Mark as Next
                </Button>
              )}
              {matchStatus === 'NEXT' && (
                <Button size="sm" variant="secondary" onClick={() => handleAction(() => matchService.unmarkAsNext(match.id), 'Unmarked')} loading={loading}>
                  Unmark
                </Button>
              )}
              {matchStatus === 'ONGOING' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleAction(() => matchService.moveToScheduled(match.id), 'Moved to scheduled')} loading={loading}>
                    → Scheduled
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(() => matchService.moveToNext(match.id), 'Moved to next')} loading={loading}>
                    → Next
                  </Button>
                </>
              )}
              {matchStatus === 'COMPLETED' && (
                <Button size="sm" variant="danger" onClick={() => handleAction(() => matchService.revertToOngoing(match.id), 'Reverted to ongoing')} loading={loading}>
                  Revert to Ongoing
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Score Update Panel */}
      {shouldShowScoreUpdate && (isLive || isCompleted) && (
        <LiveScoreUpdate
          key={`score-update-${match.id}`}
          match={match}
          onClose={() => { scoreUpdateOpenRef.current = false; setShowScoreUpdate(false); }}
          onComplete={() => { scoreUpdateOpenRef.current = false; setShowScoreUpdate(false); if (onRefresh) onRefresh(); }}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--sport-blue)] border-t-transparent" />
            <span className="text-xs text-gray-600 font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
