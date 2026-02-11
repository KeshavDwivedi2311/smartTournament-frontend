import React, { useState, useCallback, useRef } from 'react';
import { matchService } from '../services/matchService';
import { Radio, XCircle, Trophy, RefreshCw, Flag } from 'lucide-react';

const LiveScoreUpdate = ({ match, onClose, onComplete }) => {
  const [scores, setScores] = useState({
    team1Score: match.team1Score || 0,
    team2Score: match.team2Score || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scoresRef = useRef(scores);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  // Simple score update without version tracking
  const updateScore = useCallback(async (team, increment) => {
    if (loading) return; // Prevent concurrent updates
    
    setError(null);
    setLoading(true);

    // Get current scores from ref to avoid stale closure
    const currentScores = scoresRef.current;
    const newScores = {
      team1Score: team === 'team1' ? Math.max(0, currentScores.team1Score + increment) : currentScores.team1Score,
      team2Score: team === 'team2' ? Math.max(0, currentScores.team2Score + increment) : currentScores.team2Score
    };
    
    // Validate max score if target points are set
    const maxScore = match.targetPoints;
    if (maxScore) {
      if (newScores.team1Score > maxScore || newScores.team2Score > maxScore) {
        setError(`Score cannot exceed target points (${maxScore})`);
        setLoading(false);
        return;
      }
    }
    
    // Optimistically update UI
    setScores(newScores);
    
    try {
      const updateData = {
        team1Score: newScores.team1Score,
        team2Score: newScores.team2Score
      };
      
      const response = await matchService.updateMatch(match.id, updateData);
      
      // Sync scores from response if available
      if (response?.data) {
        setScores({
          team1Score: response.data.team1Score ?? newScores.team1Score,
          team2Score: response.data.team2Score ?? newScores.team2Score
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to update score';
      setError(errorMessage);
      // Revert scores on error
      setScores({
        team1Score: match.team1Score || 0,
        team2Score: match.team2Score || 0
      });
    } finally {
      setLoading(false);
    }
  }, [match.id, match.team1Score, match.team2Score, match.targetPoints, loading]);

  const completeMatch = async () => {
    // Validate that match has a winner (not tied)
    if (scores.team1Score === scores.team2Score) {
      setError('Match cannot be completed with tied scores. Please update scores to determine a winner.');
      return;
    }
    
    // Validate scores don't exceed target
    const maxScore = match.targetPoints;
    if (maxScore && (scores.team1Score > maxScore || scores.team2Score > maxScore)) {
      setError(`Scores cannot exceed target points (${maxScore}). Please correct the scores.`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await matchService.completeMatch(match.id, {
        team1Score: scores.team1Score,
        team2Score: scores.team2Score
      });
      
      // Call onComplete to refresh parent and close
      if (onComplete) {
        onComplete();
      } else {
        // Fallback: just close
        onClose();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to complete match';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetScores = () => {
    setScores({ team1Score: 0, team2Score: 0 });
    setError(null);
  };

  const winner = scores.team1Score === scores.team2Score 
    ? null 
    : scores.team1Score > scores.team2Score ? 'team1' : 'team2';

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-200 rounded-b-lg p-3 sm:p-4 lg:p-6 mt-3 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl text-red-500"><Radio className="w-5 h-5 sm:w-6 sm:h-6" /></span>
          <h4 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">Live Score Update</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 text-xs sm:text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Score Display */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:gap-8">
        {/* Team 1 */}
        <div className="text-center">
          <div className={`font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base truncate px-2 py-1 rounded-lg transition-colors ${
            winner === 'team1' ? 'bg-green-100 text-green-800 font-bold' : ''
          }`}>
            {winner === 'team1' && <Trophy className="w-4 h-4 inline mr-1" />}
            {match.team1Name}
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden space-y-3">
            <div className={`text-4xl font-bold min-w-[80px] mx-auto p-3 rounded-xl transition-colors ${
              winner === 'team1' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
            }`}>
              {scores.team1Score}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => updateScore('team1', -1)}
                disabled={loading || scores.team1Score === 0}
                className="w-14 h-14 sm:w-12 sm:h-12 bg-red-500 text-white rounded-full hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xl sm:text-lg font-bold shadow-lg touch-manipulation"
              >
                −
              </button>
              <button
                onClick={() => updateScore('team1', 1)}
                disabled={loading}
                className="w-14 h-14 sm:w-12 sm:h-12 bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xl sm:text-lg font-bold shadow-lg touch-manipulation"
              >
                +
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-center gap-3 lg:gap-4">
            <button
              onClick={() => updateScore('team1', -1)}
              disabled={loading || scores.team1Score === 0}
              className="w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-bold shadow-lg touch-manipulation"
            >
              −
            </button>
            <div className={`text-3xl lg:text-4xl font-bold min-w-[80px] lg:min-w-[100px] p-2 lg:p-3 rounded-xl transition-colors ${
              winner === 'team1' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
            }`}>
              {scores.team1Score}
            </div>
            <button
              onClick={() => updateScore('team1', 1)}
              disabled={loading}
              className="w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-bold shadow-lg touch-manipulation"
            >
              +
            </button>
          </div>
        </div>

        {/* VS Separator - Mobile Only */}
        <div className="sm:hidden text-center py-2">
          <div className="text-gray-600 font-bold text-lg">VS</div>
          {winner && (
            <div className="text-xs text-gray-500 mt-1">
              {scores.team1Score > scores.team2Score ? 'Team 1 Leading' : 'Team 2 Leading'}
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className="text-center">
          <div className={`font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base truncate px-2 py-1 rounded-lg transition-colors ${
            winner === 'team2' ? 'bg-green-100 text-green-800 font-bold' : ''
          }`}>
            {winner === 'team2' && <Trophy className="w-4 h-4 inline mr-1" />}
            {match.team2Name}
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden space-y-3">
            <div className={`text-4xl font-bold min-w-[80px] mx-auto p-3 rounded-xl transition-colors ${
              winner === 'team2' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
            }`}>
              {scores.team2Score}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => updateScore('team2', -1)}
                disabled={loading || scores.team2Score === 0}
                className="w-14 h-14 sm:w-12 sm:h-12 bg-red-500 text-white rounded-full hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xl sm:text-lg font-bold shadow-lg touch-manipulation"
              >
                −
              </button>
              <button
                onClick={() => updateScore('team2', 1)}
                disabled={loading}
                className="w-14 h-14 sm:w-12 sm:h-12 bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xl sm:text-lg font-bold shadow-lg touch-manipulation"
              >
                +
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-center gap-3 lg:gap-4">
            <button
              onClick={() => updateScore('team2', -1)}
              disabled={loading || scores.team2Score === 0}
              className="w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-bold shadow-lg touch-manipulation"
            >
              −
            </button>
            <div className={`text-3xl lg:text-4xl font-bold min-w-[80px] lg:min-w-[100px] p-2 lg:p-3 rounded-xl transition-colors ${
              winner === 'team2' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
            }`}>
              {scores.team2Score}
            </div>
            <button
              onClick={() => updateScore('team2', 1)}
              disabled={loading}
              className="w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-bold shadow-lg touch-manipulation"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Score Summary - Desktop Only */}
      <div className="hidden sm:block text-center mt-4 lg:mt-6">
        {winner ? (
          <div className="text-sm lg:text-base text-gray-600">
            <span className="font-semibold text-green-600">
              {winner === 'team1' ? match.team1Name : match.team2Name}
            </span>
            {' '}is currently leading
          </div>
        ) : (
          <div className="text-sm lg:text-base text-gray-600">Match is currently tied</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-0 sm:flex sm:justify-center sm:gap-3 lg:gap-4">
        {/* Mobile: Stacked */}
        <div className="sm:hidden space-y-2">
          <button
            onClick={resetScores}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4 inline mr-1" /> Reset Scores
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={completeMatch}
              disabled={loading}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>...</span>
                </div>
              ) : (
                <><Flag className="w-4 h-4 inline mr-1" /> Complete</>
              )}
            </button>
          </div>
        </div>

        {/* Desktop: Horizontal */}
        <div className="hidden sm:flex gap-3 lg:gap-4">
          <button
            onClick={resetScores}
            disabled={loading}
            className="px-4 py-2 lg:px-6 lg:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm lg:text-base font-medium"
          >
            <RefreshCw className="w-4 h-4 inline mr-1" /> Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 lg:px-6 lg:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base font-medium"
          >
            Cancel
          </button>
          <button
            onClick={completeMatch}
            disabled={loading}
            className="px-6 py-2 lg:px-8 lg:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm lg:text-base font-medium shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Completing...</span>
              </div>
            ) : (
              <><Flag className="w-4 h-4 inline mr-1" /> Complete Match</>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 rounded-b-lg flex items-center justify-center">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-gray-700">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoreUpdate;
