import React, { useState, useEffect } from 'react';
import { matchService } from '../services/matchService';
import MatchCard from './MatchCard';
import { Target, AlertTriangle, XCircle, CheckCircle2, Radio, Calendar, Flag, BarChart3, Sparkles } from 'lucide-react';

const MatchDashboard = ({ poolId }) => {
  const [matches, setMatches] = useState({
    upcoming: [],
    ongoing: [],
    completed: [],
    next: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    fetchAllMatches();
  }, [poolId]);

  const showFeedback = (message, type = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const fetchAllMatches = async () => {
    try {
      setLoading(true);
      console.log('Fetching matches for pool:', poolId);

      const [upcoming, ongoing, completed, next] = await Promise.all([
        matchService.getUpcomingMatches(poolId),
        matchService.getOngoingMatches(poolId),
        matchService.getCompletedMatches(poolId),
        matchService.getNextMatches(poolId, 2) // Increased limit to see more next matches
      ]);

      console.log('API Responses:', {
        upcoming: upcoming,
        ongoing: ongoing,
        completed: completed,
        next: next
      });

      // Check the structure of the responses
      const matchesData = {
        upcoming: upcoming?.data || upcoming || [],
        ongoing: ongoing?.data || ongoing || [],
        completed: completed?.data || completed || [],
        next: next?.data || next || []
      };

      console.log('Processed matches data:', matchesData);

      setMatches(matchesData);
    } catch (error) {
      console.error('Error fetching matches:', error);
      showFeedback('Failed to fetch matches: ' + error.message, 'error');
      // Set empty arrays on error
      setMatches({
        upcoming: [],
        ongoing: [],
        completed: [],
        next: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async (matchId, courtNumber) => {
    try {
      console.log('Starting match:', matchId, 'on court:', courtNumber);
      await matchService.startMatch(matchId, courtNumber);
      showFeedback(`Match started on Court ${courtNumber}!`);
      fetchAllMatches(); // Refresh data
    } catch (error) {
      console.error('Error starting match:', error);
      showFeedback('Failed to start match: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const handleMarkReady = async (matchId) => {
    try {
      console.log('Marking match as ready:', matchId);
      await matchService.markMatchAsReady(matchId);
      showFeedback('Match marked as ready!');
      fetchAllMatches(); // Refresh data
    } catch (error) {
      console.error('Error marking match as ready:', error);
      showFeedback('Failed to mark match as ready: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  // Enhanced refresh function that can switch tabs and show feedback
  const handleRefreshWithFeedback = async (action, targetTab = null) => {
    await fetchAllMatches();

    if (targetTab && targetTab !== activeTab) {
      setActiveTab(targetTab);
      showFeedback(`Match moved to ${targetTab} tab!`);
    }
  };

  // Add this helper component to show current next matches when limit is reached
  const NextMatchesInfo = ({ nextMatches }) => {
    if (nextMatches.length === 0) return null;

    return (
      <div className="mb-3 sm:mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs sm:text-sm font-medium text-blue-800 mb-2">
          Current "Next" Matches ({nextMatches.length}/2):
        </div>
        <div className="space-y-1">
          {nextMatches.map((match) => (
            <div key={match.id} className="text-xs sm:text-sm text-blue-700 truncate flex items-center gap-1">
              <Target className="w-3 h-3 flex-shrink-0" /> {match.team1Name} vs {match.team2Name}
            </div>
          ))}
        </div>
        {nextMatches.length >= 2 && (
          <div className="text-xs text-blue-600 mt-2">
            <AlertTriangle className="w-3 h-3 inline mr-1" /> Maximum reached. Start some matches to mark more as "Next".
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 sm:h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
      {/* Mobile-Optimized Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Match Dashboard</h2>
        <button
          onClick={fetchAllMatches}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh matches"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Action Feedback - Mobile Optimized */}
      {actionFeedback && (
        <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg ${
          actionFeedback.type === 'error'
            ? 'bg-red-100 border border-red-200 text-red-700'
            : 'bg-green-100 border border-green-200 text-green-700'
        }`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            {actionFeedback.type === 'error' ? <XCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{actionFeedback.message}</span>
          </div>
        </div>
      )}

      {/* Show current next matches info */}
      <NextMatchesInfo nextMatches={matches.next} />

      {/* Mobile-First Quick Stats */}
      <div className="mb-4 sm:mb-6">
        {/* Mobile: 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          <div
            className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'ongoing'
                ? 'bg-green-200 border-2 border-green-400'
                : 'bg-green-100 hover:bg-green-150'
            }`}
            onClick={() => setActiveTab('ongoing')}
          >
            <div className="text-lg font-bold text-green-600">{matches.ongoing.length}</div>
            <div className="text-xs text-green-700">Live</div>
          </div>
          <div
            className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'next'
                ? 'bg-blue-200 border-2 border-blue-400'
                : 'bg-blue-100 hover:bg-blue-150'
            }`}
            onClick={() => setActiveTab('next')}
          >
            <div className="text-lg font-bold text-blue-600">{matches.next.length}</div>
            <div className="text-xs text-blue-700">Next</div>
          </div>
          <div
            className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'upcoming'
                ? 'bg-yellow-200 border-2 border-yellow-400'
                : 'bg-yellow-100 hover:bg-yellow-150'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            <div className="text-lg font-bold text-yellow-600">{matches.upcoming.length}</div>
            <div className="text-xs text-yellow-700">Scheduled</div>
          </div>
          <div
            className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'completed'
                ? 'bg-gray-200 border-2 border-gray-400'
                : 'bg-gray-100 hover:bg-gray-150'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            <div className="text-lg font-bold text-gray-600">{matches.completed.length}</div>
            <div className="text-xs text-gray-700">Done</div>
          </div>
        </div>

        {/* Tablet and Desktop: 4 Column Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div
            className={`p-3 lg:p-4 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'ongoing'
                ? 'bg-green-200 border-2 border-green-400'
                : 'bg-green-100 hover:bg-green-150'
            }`}
            onClick={() => setActiveTab('ongoing')}
          >
            <div className="text-xl lg:text-2xl font-bold text-green-600">{matches.ongoing.length}</div>
            <div className="text-sm text-green-700">Live</div>
          </div>
          <div
            className={`p-3 lg:p-4 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'next'
                ? 'bg-blue-200 border-2 border-blue-400'
                : 'bg-blue-100 hover:bg-blue-150'
            }`}
            onClick={() => setActiveTab('next')}
          >
            <div className="text-xl lg:text-2xl font-bold text-blue-600">{matches.next.length}</div>
            <div className="text-sm text-blue-700">Next Up</div>
          </div>
          <div
            className={`p-3 lg:p-4 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'upcoming'
                ? 'bg-yellow-200 border-2 border-yellow-400'
                : 'bg-yellow-100 hover:bg-yellow-150'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            <div className="text-xl lg:text-2xl font-bold text-yellow-600">{matches.upcoming.length}</div>
            <div className="text-sm text-yellow-700">Scheduled</div>
          </div>
          <div
            className={`p-3 lg:p-4 rounded-lg text-center cursor-pointer transition-all ${
              activeTab === 'completed'
                ? 'bg-gray-200 border-2 border-gray-400'
                : 'bg-gray-100 hover:bg-gray-150'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            <div className="text-xl lg:text-2xl font-bold text-gray-600">{matches.completed.length}</div>
            <div className="text-sm text-gray-700">Completed</div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Tab Navigation */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        {/* Mobile: Horizontal Scroll */}
        <div className="sm:hidden">
          <nav className="flex space-x-1 overflow-x-auto pb-2 -mb-px">
            {[
              { key: 'ongoing', label: 'Live', icon: <Radio className="w-3 h-3" /> },
              { key: 'next', label: 'Next', icon: <Target className="w-3 h-3" /> },
              { key: 'upcoming', label: 'Scheduled', icon: <Calendar className="w-3 h-3" /> },
              { key: 'completed', label: 'Done', icon: <Flag className="w-3 h-3" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 py-2 px-3 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-1 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label} ({matches[tab.key].length})
              </button>
            ))}
          </nav>
        </div>

        {/* Desktop: Standard Navigation */}
        <nav className="hidden sm:flex -mb-px space-x-4 lg:space-x-8">
          {[
            { key: 'ongoing', label: 'Live', icon: <Radio className="w-4 h-4" /> },
            { key: 'next', label: 'Next', icon: <Target className="w-4 h-4" /> },
            { key: 'upcoming', label: 'Scheduled', icon: <Calendar className="w-4 h-4" /> },
            { key: 'completed', label: 'Completed', icon: <Flag className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label} ({matches[tab.key].length})
            </button>
          ))}
        </nav>
      </div>

      {/* Context Information for Next Tab */}
      {activeTab === 'next' && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-blue-500 text-lg sm:text-xl flex-shrink-0"><Target className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-blue-800 mb-1 text-sm sm:text-base">Next Matches Queue</div>
              <div className="text-xs sm:text-sm text-blue-700 space-y-1">
                <div>• Start "Next" matches to move them to "Live"</div>
                <div className="sm:hidden">• Max 2 matches in queue</div>
              </div>
              {matches.next.length > 0 && (
                <div className="text-xs text-blue-600 mt-2 font-medium">
                  <BarChart3 className="w-3 h-3 inline mr-1" /> Current queue: {matches.next.length}/2 matches
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Match Lists - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        {matches[activeTab].map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onStartMatch={handleStartMatch}
            onMarkReady={handleMarkReady}
            onRefresh={fetchAllMatches}
            onRefreshWithFeedback={handleRefreshWithFeedback}
          />
        ))}

        {/* Empty State - Mobile Optimized */}
        {matches[activeTab].length === 0 && (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <div className="text-base sm:text-lg mb-2">
              No {activeTab === 'ongoing' ? 'live' : activeTab === 'upcoming' ? 'scheduled' : activeTab} matches
              <span className="hidden sm:inline"> found for pool {poolId}</span>
            </div>
            <div className="text-xs sm:text-sm space-y-1 sm:space-y-2">
              {activeTab === 'next' && (
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-1"><Target className="w-3 h-3 flex-shrink-0" /> Mark up to 2 scheduled matches as "Next"</div>
                  <div className="hidden sm:flex items-center gap-1"><Sparkles className="w-3 h-3 flex-shrink-0" /> This helps you prepare and prioritize which matches to play next!</div>
                  <div className="sm:hidden flex items-center gap-1"><Sparkles className="w-3 h-3 flex-shrink-0" /> Helps prioritize upcoming matches!</div>
                </div>
              )}
              {activeTab === 'ongoing' && matches.next.length > 0 && (
                <div>Start some "Next" matches to see them here!</div>
              )}
              {activeTab === 'completed' && matches.ongoing.length > 0 && (
                <div>Complete some live matches to see them here!</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Specific Quick Actions */}
      <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Pool {poolId}</span>
          <span>Total: {Object.values(matches).flat().length} matches</span>
        </div>
      </div>
    </div>
  );
};

export default MatchDashboard;