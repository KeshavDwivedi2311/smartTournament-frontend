import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';
import LiveScoreUpdate from './LiveScoreUpdate';

const MatchCard = ({ match, onStartMatch, onMarkReady, onRefresh, onRefreshWithFeedback, onMatchUpdated, readOnly = false }) => {
  const { isAdmin, isLoggedIn } = useAuth();
  const [showScoreUpdate, setShowScoreUpdate] = useState(false);
  const [courtNumber, setCourtNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [team1Score, setTeam1Score] = useState(match.team1Score || '');
  const [team2Score, setTeam2Score] = useState(match.team2Score || '');

  // Safety check
  if (!match) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-red-50">
        <div className="text-red-600 text-sm sm:text-base">Error: Match data is missing</div>
      </div>
    );
  }

  // Only allow editing if user is logged in, admin and not in readOnly mode
  const canEdit = isLoggedIn && isAdmin && !readOnly;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONGOING': return 'bg-green-100 text-green-800 border-green-200';
      case 'READY': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'NEXT': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONGOING': return '🔴';
      case 'READY': return '✅';
      case 'SCHEDULED': return '📅';
      case 'COMPLETED': return '🏁';
      case 'NEXT': return '🎯';
      default: return '❓';
    }
  };

  // State transition handlers with smart tab switching
  const handleMarkAsNext = async () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to mark matches as next');
      return;
    }

    try {
      setLoading(true);
      await matchService.markAsNext(match.id);

      // Switch to next tab to show where the match went
      if (onRefreshWithFeedback) {
        onRefreshWithFeedback('marked as next', 'next');
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error('Error marking match as next:', error);

      // Show the specific error message from backend
      const errorMessage = error.response?.data?.error || error.message;

      // Show user-friendly error message
      if (errorMessage.includes('Maximum of 2 matches')) {
        alert('❌ Cannot mark as next!\n\n' +
              'Only 2 matches can be marked as "Next" at once.\n' +
              'Please start some "Next" matches first, or unmark other "Next" matches.');
      } else {
        alert('❌ Failed to mark match as next:\n\n' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnmarkAsNext = async () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to unmark matches');
      return;
    }

    try {
      setLoading(true);
      await matchService.unmarkAsNext(match.id);
      // Switch to upcoming tab to show where the match went
      if (onRefreshWithFeedback) {
        onRefreshWithFeedback('moved back to scheduled', 'upcoming');
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error('Error unmarking match as next:', error);
      alert('Failed to unmark match as next: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToScheduled = () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to move matches');
      return;
    }

    if (window.confirm('Are you sure you want to move this match back to scheduled?')) {
      handleAction(matchService.moveToScheduled, match.id, 'upcoming');
    }
  };

  const handleMoveOngoingToNext = () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to move matches');
      return;
    }

    if (window.confirm('Are you sure you want to move this ongoing match to next?')) {
      handleAction(matchService.moveToNext, match.id, 'next');
    }
  };

  const handleRevertToOngoing = () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to revert matches');
      return;
    }

    if (window.confirm('Are you sure you want to revert this completed match to ongoing?')) {
      handleAction(matchService.revertToOngoing, match.id);
    }
  };

  const handleRevertToScheduled = () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to revert matches');
      return;
    }

    if (window.confirm('Are you sure you want to revert this completed match to scheduled? This will clear all scores.')) {
      handleAction(matchService.revertToScheduled, match.id);
    }
  };

  // Update the handleAction function to support tab switching
  const handleAction = async (actionFn, matchId, targetTab = null) => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to perform this action');
      return;
    }

    try {
      setLoading(true);
      await actionFn(matchId);
      if (onRefreshWithFeedback && targetTab) {
        onRefreshWithFeedback('action completed', targetTab);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to start matches');
      return;
    }

    if (courtNumber.trim()) {
      onStartMatch(match.id, courtNumber);
      setCourtNumber('');
    }
  };

  const handleMarkReady = async () => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to mark matches as ready');
      return;
    }

    try {
      setLoading(true);
      await matchService.markMatchAsReady(match.id);
      onRefresh();
    } catch (error) {
      console.error('Error marking match as ready:', error);
      alert('Failed to mark match as ready: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!canEdit) return;

    try {
      setLoading(true);
      await matchService.updateMatchStatus(match.id, newStatus);
      onMatchUpdated && onMatchUpdated();
    } catch (error) {
      console.error('Error updating match status:', error);
      alert('Failed to update match status');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = async () => {
    if (!canEdit) return;

    try {
      setLoading(true);
      await matchService.updateMatchScore(match.id, {
        team1Score: parseInt(team1Score) || 0,
        team2Score: parseInt(team2Score) || 0,
        status: 'COMPLETED'
      });
      setIsEditing(false);
      onMatchUpdated && onMatchUpdated();
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Failed to update score');
    } finally {
      setLoading(false);
    }
  };

  // Get status with fallback
  const matchStatus = match.status || 'SCHEDULED';

  return (
    <div className={`border-2 rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-200 ${getStatusColor(matchStatus)} relative`}>
      {/* Mobile-First Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        {/* Status and Court Info */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(matchStatus)} flex items-center gap-1`}>
            <span className="text-base sm:text-lg">{getStatusIcon(matchStatus)}</span>
            <span className="hidden sm:inline">
              {matchStatus === 'NEXT' ? 'NEXT UP' : matchStatus === 'ONGOING' ? 'LIVE' : matchStatus === 'SCHEDULED' ? 'SCHEDULED' : matchStatus}
            </span>
            <span className="sm:hidden">
              {matchStatus === 'NEXT' ? 'NEXT' : matchStatus === 'ONGOING' ? 'LIVE' : matchStatus === 'SCHEDULED' ? 'SCHED' : matchStatus}
            </span>
          </span>

          {match.courtNumber && (
            <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs sm:text-sm font-medium border border-indigo-200 flex items-center gap-1">
              <span className="text-sm">🏟️</span>
              <span className="hidden sm:inline">Court {match.courtNumber}</span>
              <span className="sm:hidden">C{match.courtNumber}</span>
            </span>
          )}

          {/* Actions Menu Button */}
          <button
            onClick={() => setShowActions(!showActions)}
            disabled={!isLoggedIn}
            className={`p-2 rounded-full transition-colors ${
              !isLoggedIn
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
            title={!isLoggedIn ? "Please log in to access actions" : "More Actions"}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Primary Action Buttons - Mobile Optimized */}
        <div className="flex flex-wrap gap-2 justify-end">
          {match.status === 'SCHEDULED' && (
            <button
              onClick={() => onMarkReady(match.id)}
              disabled={!isLoggedIn || loading}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors disabled:opacity-50 min-w-0 ${
                !isLoggedIn
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title={!isLoggedIn ? "Please log in to mark match ready" : ""}
            >
              <span className="hidden sm:inline">Mark Live</span>
              <span className="sm:hidden">Live</span>
            </button>
          )}

          {(match.status === 'READY' || match.status === 'NEXT') && (
            <div className="flex gap-1 sm:gap-2">
              <input
                type="text"
                placeholder="Court"
                value={courtNumber}
                onChange={(e) => setCourtNumber(e.target.value)}
                disabled={!isLoggedIn}
                className={`px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm w-12 sm:w-16 ${
                  !isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <button
                onClick={handleStartMatch}
                disabled={!isLoggedIn || !courtNumber.trim() || loading}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors disabled:opacity-50 ${
                  !isLoggedIn || !courtNumber.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                title={!isLoggedIn ? "Please log in to start match" : ""}
              >
                <span className="hidden sm:inline">Start</span>
                <span className="sm:hidden">▶️</span>
              </button>
            </div>
          )}

          {match.status === 'ONGOING' && (
            <button
              onClick={() => setShowScoreUpdate(!showScoreUpdate)}
              disabled={!isLoggedIn}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors disabled:opacity-50 ${
                !isLoggedIn
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              title={!isLoggedIn ? "Please log in to update score" : ""}
            >
              <span className="hidden sm:inline">Update Score</span>
              <span className="sm:hidden">Score</span>
            </button>
          )}
        </div>
      </div>

      {/* Teams and Score Display - Mobile Optimized */}
      <div className="mb-4">
        {/* Mobile Layout (Stacked) */}
        <div className="block sm:hidden space-y-3">
          {/* Team 1 */}
          <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
            <div className="flex-1">
              <div className="font-bold text-gray-800 text-sm truncate">{match.team1Name || 'TBD'}</div>
            </div>
            <div className="flex items-center gap-2">
              {(matchStatus === 'COMPLETED' || matchStatus === 'ONGOING') && (
                <div className={`text-xl font-bold ${
                  matchStatus === 'COMPLETED'
                    ? (match.team1Score > match.team2Score ? 'text-green-600' : 'text-red-500')
                    : 'text-blue-600'
                }`}>
                  {match.team1Score || 0}
                </div>
              )}
            </div>
          </div>

          {/* VS and Status */}
          <div className="text-center py-1">
            <div className="text-gray-600 font-bold text-sm">VS</div>
            {matchStatus === 'ONGOING' && (
              <div className="text-xs text-green-600 font-bold animate-pulse">🔴 LIVE</div>
            )}
            {matchStatus === 'NEXT' && (
              <div className="text-xs text-purple-600 font-bold">🎯 NEXT UP</div>
            )}
            {matchStatus === 'READY' && (
              <div className="text-xs text-blue-600 font-bold">✅ READY</div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
            <div className="flex-1">
              <div className="font-bold text-gray-800 text-sm truncate">{match.team2Name || 'TBD'}</div>
            </div>
            <div className="flex items-center gap-2">
              {(matchStatus === 'COMPLETED' || matchStatus === 'ONGOING') && (
                <div className={`text-xl font-bold ${
                  matchStatus === 'COMPLETED'
                    ? (match.team2Score > match.team1Score ? 'text-green-600' : 'text-red-500')
                    : 'text-blue-600'
                }`}>
                  {match.team2Score || 0}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout (Grid) */}
        <div className="hidden sm:grid grid-cols-3 gap-4 items-center">
          {/* Team 1 */}
          <div className="text-right">
            <div className="font-bold text-gray-800 text-base lg:text-lg truncate">{match.team1Name || 'TBD'}</div>
            {matchStatus === 'COMPLETED' && (
              <div className={`text-2xl lg:text-3xl font-bold ${match.team1Score > match.team2Score ? 'text-green-600' : 'text-red-500'}`}>
                {match.team1Score || 0}
              </div>
            )}
            {matchStatus === 'ONGOING' && (
              <div className="text-xl lg:text-2xl font-bold text-blue-600">{match.team1Score || 0}</div>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-gray-600 font-bold text-base lg:text-lg">VS</div>
            {matchStatus === 'ONGOING' && (
              <div className="text-sm text-green-600 font-bold animate-pulse">🔴 LIVE</div>
            )}
            {matchStatus === 'NEXT' && (
              <div className="text-sm text-purple-600 font-bold">🎯 NEXT UP</div>
            )}
            {matchStatus === 'READY' && (
              <div className="text-sm text-blue-600 font-bold">✅ READY</div>
            )}
          </div>

          {/* Team 2 */}
          <div className="text-left">
            <div className="font-bold text-gray-800 text-base lg:text-lg truncate">{match.team2Name || 'TBD'}</div>
            {matchStatus === 'COMPLETED' && (
              <div className={`text-2xl lg:text-3xl font-bold ${match.team2Score > match.team1Score ? 'text-green-600' : 'text-red-500'}`}>
                {match.team2Score || 0}
              </div>
            )}
            {matchStatus === 'ONGOING' && (
              <div className="text-xl lg:text-2xl font-bold text-blue-600">{match.team2Score || 0}</div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Actions Menu - Mobile Optimized */}
      {showActions && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 border-t border-gray-200">
          {!isLoggedIn ? (
            <div className="text-xs sm:text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
              🔒 Please log in to access match management actions.
            </div>
          ) : (
            <>
              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Additional Actions:</div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2">

                {/* Mark as Next / Unmark as Next */}
                {match.status === 'SCHEDULED' && (
                  <button
                    onClick={handleMarkAsNext}
                    disabled={loading}
                    className="px-2 sm:px-3 py-1 bg-purple-500 text-white rounded text-xs sm:text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <span className="text-xs">🎯</span>
                    <span className="hidden sm:inline">Mark as Next</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                )}

                {match.status === 'NEXT' && (
                  <button
                    onClick={handleUnmarkAsNext}
                    disabled={loading}
                    className="px-2 sm:px-3 py-1 bg-gray-500 text-white rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <span className="text-xs">❌</span>
                    <span className="hidden sm:inline">Unmark as Next</span>
                    <span className="sm:hidden">Unmark</span>
                  </button>
                )}

                {/* Move to Scheduled (from ONGOING) */}
                {match.status === 'ONGOING' && (
                  <button
                    onClick={handleMoveToScheduled}
                    disabled={loading}
                    className="px-2 sm:px-3 py-1 bg-orange-500 text-white rounded text-xs sm:text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <span className="text-xs">📅</span>
                    <span className="hidden sm:inline">Move to Scheduled</span>
                    <span className="sm:hidden">Schedule</span>
                  </button>
                )}

                {/* Move to Next (from ONGOING) */}
                {match.status === 'ONGOING' && (
                  <button
                    onClick={handleMoveOngoingToNext}
                    disabled={loading}
                    className="px-2 sm:px-3 py-1 bg-purple-500 text-white rounded text-xs sm:text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <span className="text-xs">🎯</span>
                    <span className="hidden sm:inline">Move to Next</span>
                    <span className="sm:hidden">To Next</span>
                  </button>
                )}

                {/* Revert from Completed */}
                {match.status === 'COMPLETED' && (
                  <button
                    onClick={handleRevertToOngoing}
                    disabled={loading}
                    className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs sm:text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <span className="text-xs">↩️</span>
                    <span className="hidden sm:inline">Revert to Live</span>
                    <span className="sm:hidden">Revert</span>
                  </button>
                )}

                {/* Mark as Live (alternative action) */}
                {match.status === 'SCHEDULED' && (
                  <button
                    onClick={() => onMarkReady(match.id)}
                    disabled={loading}
                    className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded text-xs sm:text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <span className="text-xs">✅</span>
                    <span className="hidden sm:inline">Mark Live</span>
                    <span className="sm:hidden">Live</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Live Score Update */}
      {showScoreUpdate && matchStatus === 'ONGOING' && isLoggedIn && (
        <LiveScoreUpdate
          match={match}
          onClose={() => setShowScoreUpdate(false)}
          onRefresh={onRefresh}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-3 bg-white/50 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-xs sm:text-sm text-gray-600 font-medium">Processing...</span>
        </div>
      )}

      {/* Match Details */}
      {match.scheduledTime && (
        <div className="text-xs sm:text-sm text-gray-600 mt-3 flex items-center gap-2">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Scheduled: {new Date(match.scheduledTime).toLocaleString()}</span>
          <span className="sm:hidden">{new Date(match.scheduledTime).toLocaleDateString()} {new Date(match.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      )}

      {/* Winner Display for Completed Matches */}
      {matchStatus === 'COMPLETED' && match.winnerId && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs sm:text-sm font-semibold text-green-800 flex items-center gap-2">
            <span className="text-sm">🏆</span>
            <span className="hidden sm:inline">Winner: {match.winnerId === match.team1Id ? match.team1Name : match.team2Name}</span>
            <span className="sm:hidden truncate">{match.winnerId === match.team1Id ? match.team1Name : match.team2Name} wins!</span>
          </div>
        </div>
      )}

      {/* Read-only indicator */}
      {!isLoggedIn && (
        <div className="text-xs text-yellow-600 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
          🔒 Please log in to manage this match
        </div>
      )}
    </div>
  );
};

export default MatchCard;