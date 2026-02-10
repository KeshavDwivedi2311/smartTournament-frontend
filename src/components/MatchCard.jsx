import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';
import Badge from './ui/Badge';
import Button from './ui/Button';
import LiveScoreUpdate from './LiveScoreUpdate';
import MatchTimer from './MatchTimer';
import { toast } from 'react-hot-toast';

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
  
  // Use ref to persist the open state across re-renders
  const scoreUpdateOpenRef = useRef(false);
  
  // Sync ref with state
  useEffect(() => {
    scoreUpdateOpenRef.current = showScoreUpdate;
  }, [showScoreUpdate]);

  if (!match) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-4">
        <p className="text-red-600 text-sm">Error: Match data is missing</p>
      </div>
    );
  }

  const canEdit = isLoggedIn && isAdmin && !readOnly;
  const matchStatus = match.status || 'SCHEDULED';
  
  // Keep score update open - use ref to persist across re-renders
  // Once opened, keep it open until explicitly closed
  const shouldShowScoreUpdate = scoreUpdateOpenRef.current || showScoreUpdate;

  // Primary action based on status
  const getPrimaryAction = () => {
    if (!isLoggedIn) return null;

    switch (matchStatus) {
      case 'SCHEDULED':
        return (
          <Button
            size="sm"
            onClick={() => onMarkReady(match.id)}
            loading={loading}
            disabled={loading}
            className="w-full sm:w-auto"
          >
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
                // Only allow positive integers
                if (value === '' || (parseInt(value) > 0 && parseInt(value) <= 99)) {
                  setCourtNumber(value);
                }
              }}
              min="1"
              max="99"
              className="flex-1 sm:w-20 px-3 py-3 sm:py-1.5 border-2 border-gray-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              inputMode="numeric"
            />
            <Button
              size="sm"
              variant="success"
              onClick={handleStartMatch}
              disabled={!courtNumber.trim() || loading}
              loading={loading}
              className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
            >
              Start
            </Button>
          </div>
        );
      
      case 'ONGOING':
        return (
          <Button
            size="sm"
            variant="warning"
            onClick={() => {
              scoreUpdateOpenRef.current = true;
              setShowScoreUpdate(true);
            }}
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
    if (courtNumber.trim()) {
      onStartMatch(match.id, courtNumber);
      setCourtNumber('');
    }
  };

  const handleAction = async (actionFn, successMsg) => {
    if (!isLoggedIn) {
      toast.error('Please log in to perform this action');
      return;
    }

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

  const isWinner = (teamId) => {
    return matchStatus === 'COMPLETED' && match.winnerId === teamId;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge status={matchStatus} size="sm" />
          {match.courtNumber && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              <span className="hidden sm:inline">Court </span>
              <span className="sm:hidden">C</span>
              {match.courtNumber}
            </span>
          )}
        </div>
        
        {canEdit && (
          <button
            onClick={() => setShowMoreActions(!showMoreActions)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors self-end sm:self-auto"
            title="More actions"
            aria-label="More actions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Teams and Score */}
      <div className="mb-4">
        {/* Mobile Layout */}
        <div className="block sm:hidden space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm truncate ${
                isWinner(match.team1Id) ? 'text-green-600' : 'text-gray-800'
              }`}>
                {match.team1Name || 'TBD'}
              </div>
            </div>
            {(matchStatus === 'COMPLETED' || matchStatus === 'ONGOING') && (
              <div className={`text-lg font-bold ml-2 ${
                matchStatus === 'COMPLETED'
                  ? (isWinner(match.team1Id) ? 'text-green-600' : 'text-gray-500')
                  : 'text-blue-600'
              }`}>
                {match.team1Score || 0}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-gray-500 font-medium text-xs">VS</div>
            {matchStatus === 'ONGOING' && (
              <div className="text-xs text-green-600 font-bold animate-pulse mt-1">LIVE</div>
            )}
            {(matchStatus === 'ONGOING' || matchStatus === 'COMPLETED') && (
              <div className="mt-2">
                <MatchTimer match={match} targetPoints={match.targetPoints} />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm truncate ${
                isWinner(match.team2Id) ? 'text-green-600' : 'text-gray-800'
              }`}>
                {match.team2Name || 'TBD'}
              </div>
            </div>
            {(matchStatus === 'COMPLETED' || matchStatus === 'ONGOING') && (
              <div className={`text-lg font-bold ml-2 ${
                matchStatus === 'COMPLETED'
                  ? (isWinner(match.team2Id) ? 'text-green-600' : 'text-gray-500')
                  : 'text-blue-600'
              }`}>
                {match.team2Score || 0}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:grid grid-cols-3 gap-4 items-center">
          {/* Team 1 */}
          <div className="text-right">
            <div className={`font-semibold text-base sm:text-lg truncate ${
              isWinner(match.team1Id) ? 'text-green-600' : 'text-gray-800'
            }`}>
              {match.team1Name || 'TBD'}
            </div>
            {(matchStatus === 'COMPLETED' || matchStatus === 'ONGOING') && (
              <div className={`text-xl sm:text-2xl font-bold mt-1 ${
                matchStatus === 'COMPLETED'
                  ? (isWinner(match.team1Id) ? 'text-green-600' : 'text-gray-500')
                  : 'text-blue-600'
              }`}>
                {match.team1Score || 0}
              </div>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-gray-500 font-medium text-sm">VS</div>
            {matchStatus === 'ONGOING' && (
              <div className="text-xs text-green-600 font-bold animate-pulse mt-1">LIVE</div>
            )}
            {(matchStatus === 'ONGOING' || matchStatus === 'COMPLETED') && (
              <div className="mt-2">
                <MatchTimer match={match} targetPoints={match.targetPoints} />
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="text-left">
            <div className={`font-semibold text-base sm:text-lg truncate ${
              isWinner(match.team2Id) ? 'text-green-600' : 'text-gray-800'
            }`}>
              {match.team2Name || 'TBD'}
            </div>
            {(matchStatus === 'COMPLETED' || matchStatus === 'ONGOING') && (
              <div className={`text-xl sm:text-2xl font-bold mt-1 ${
                matchStatus === 'COMPLETED'
                  ? (isWinner(match.team2Id) ? 'text-green-600' : 'text-gray-500')
                  : 'text-blue-600'
              }`}>
                {match.team2Score || 0}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="flex justify-end mb-3">
        {getPrimaryAction() ? (
          <div className="w-full sm:w-auto">
            {getPrimaryAction()}
          </div>
        ) : (
          !isLoggedIn && (
            <p className="text-xs text-gray-500 text-right w-full sm:w-auto">Login to manage</p>
          )
        )}
      </div>

      {/* More Actions Dropdown */}
      {showMoreActions && canEdit && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-xs font-medium text-gray-600 mb-2">Additional Actions:</div>
          <div className="flex flex-wrap gap-2">
            {matchStatus === 'SCHEDULED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(() => matchService.markAsNext(match.id), 'Marked as next')}
                loading={loading}
              >
                Mark as Next
              </Button>
            )}
            {matchStatus === 'NEXT' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAction(() => matchService.unmarkAsNext(match.id), 'Unmarked')}
                loading={loading}
              >
                Unmark
              </Button>
            )}
            {matchStatus === 'ONGOING' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(() => matchService.moveToScheduled(match.id), 'Moved to scheduled')}
                  loading={loading}
                >
                  Move to Scheduled
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(() => matchService.moveToNext(match.id), 'Moved to next')}
                  loading={loading}
                >
                  Move to Next
                </Button>
              </>
            )}
            {matchStatus === 'COMPLETED' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleAction(() => matchService.revertToOngoing(match.id), 'Reverted to ongoing')}
                loading={loading}
              >
                Revert to Ongoing
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Live Score Update Modal - Keep open until explicitly closed */}
      {shouldShowScoreUpdate && (matchStatus === 'ONGOING' || matchStatus === 'COMPLETED') && (
        <LiveScoreUpdate
          key={`score-update-${match.id}`}
          match={match}
          onClose={() => {
            scoreUpdateOpenRef.current = false;
            setShowScoreUpdate(false);
          }}
          onComplete={() => {
            // Called when match is completed - refresh parent and close
            scoreUpdateOpenRef.current = false;
            setShowScoreUpdate(false);
            if (onRefresh) onRefresh();
          }}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/75 rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-xs text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
