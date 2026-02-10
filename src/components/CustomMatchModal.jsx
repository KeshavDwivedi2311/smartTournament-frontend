import React, { useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';

const CustomMatchModal = ({ tournamentId, onClose, onMatchCreated }) => {
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [matchType, setMatchType] = useState('CUSTOM');
  const [courtNumber, setCourtNumber] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAllTeams();
  }, [tournamentId]);

  const loadAllTeams = async () => {
    try {
      setLoading(true);

      // Use the pools method since it's more reliable
      const teams = await tournamentService.getAllTeamsFromPools(tournamentId);
      setAllTeams(teams);
    } catch (error) {
      console.error('Error loading all teams:', error);
      alert('Failed to load teams: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeam1 || !selectedTeam2) {
      alert('Please select both teams');
      return;
    }

    if (selectedTeam1 === selectedTeam2) {
      alert('Please select different teams');
      return;
    }

    try {
      setSubmitting(true);

      const matchData = {
        team1Id: parseInt(selectedTeam1),
        team2Id: parseInt(selectedTeam2),
        matchType: matchType,
        courtNumber: courtNumber || null,
        scheduledTime: scheduledTime || null,
        notes: notes || null,
        phase: 'CUSTOM'
      };

      // Use tournamentService.createCustomMatch instead of matchService
      await tournamentService.createCustomMatch(tournamentId, matchData);

      alert('Custom match created successfully!');
      onMatchCreated();
    } catch (error) {
      console.error('Error creating custom match:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to create custom match: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Group teams by pool for better organization
  const teamsByPool = allTeams.reduce((acc, team) => {
    const poolName = team.poolName || 'No Pool';
    if (!acc[poolName]) acc[poolName] = [];
    acc[poolName].push(team);
    return acc;
  }, {});

  const getSelectedTeamInfo = (teamId) => {
    const team = allTeams.find(t => t.id === parseInt(teamId));
    return team ? team : null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading teams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-purple-600">⚙️</span>
              Create Custom Match
            </h3>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            <span className="hidden sm:inline">
              Schedule a match between any two teams from any pools. Perfect for special scenarios,
              exhibition matches, or additional knockout rounds.
            </span>
            <span className="sm:hidden">
              Create matches between any teams for special scenarios.
            </span>
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {allTeams.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-500 text-base sm:text-lg mb-2">No teams found</div>
              <p className="text-gray-400 text-sm sm:text-base">Make sure teams are added to pools first.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Team Selection - Mobile Optimized */}
              <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                {/* Team 1 Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      Team 1
                    </span>
                  </label>
                  <select
                    value={selectedTeam1}
                    onChange={(e) => setSelectedTeam1(e.target.value)}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Team 1</option>
                    {Object.entries(teamsByPool).map(([poolName, teams]) => (
                      <optgroup key={poolName} label={poolName}>
                        {teams.map((team) => (
                          <option
                            key={team.id}
                            value={team.id}
                            disabled={selectedTeam2 === team.id.toString()}
                          >
                            {team.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {selectedTeam1 && (
                    <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm">
                      <div className="font-semibold text-blue-800 mb-1">{getSelectedTeamInfo(selectedTeam1)?.name}</div>
                      <div className="text-blue-600 space-y-1">
                        <div>📍 Pool: {getSelectedTeamInfo(selectedTeam1)?.poolName || 'No Pool'}</div>
                        <div>🏆 Ranking: #{getSelectedTeamInfo(selectedTeam1)?.poolRanking || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team 2 Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      Team 2
                    </span>
                  </label>
                  <select
                    value={selectedTeam2}
                    onChange={(e) => setSelectedTeam2(e.target.value)}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Team 2</option>
                    {Object.entries(teamsByPool).map(([poolName, teams]) => (
                      <optgroup key={poolName} label={poolName}>
                        {teams.map((team) => (
                          <option
                            key={team.id}
                            value={team.id}
                            disabled={selectedTeam1 === team.id.toString()}
                          >
                            {team.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {selectedTeam2 && (
                    <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm">
                      <div className="font-semibold text-green-800 mb-1">{getSelectedTeamInfo(selectedTeam2)?.name}</div>
                      <div className="text-green-600 space-y-1">
                        <div>📍 Pool: {getSelectedTeamInfo(selectedTeam2)?.poolName || 'No Pool'}</div>
                        <div>🏆 Ranking: #{getSelectedTeamInfo(selectedTeam2)?.poolRanking || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Preview - Mobile Optimized */}
              {selectedTeam1 && selectedTeam2 && (
                <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-3 text-sm sm:text-base flex items-center gap-2">
                    <span>🎯</span>
                    Match Preview
                  </h4>

                  {/* Mobile: Vertical Layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="font-bold text-blue-800 text-center">{getSelectedTeamInfo(selectedTeam1)?.name}</div>
                      <div className="text-xs text-blue-600 text-center mt-1">{getSelectedTeamInfo(selectedTeam1)?.poolName}</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full font-bold text-lg">VS</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="font-bold text-green-800 text-center">{getSelectedTeamInfo(selectedTeam2)?.name}</div>
                      <div className="text-xs text-green-600 text-center mt-1">{getSelectedTeamInfo(selectedTeam2)?.poolName}</div>
                    </div>
                  </div>

                  {/* Desktop: Horizontal Layout */}
                  <div className="hidden sm:flex items-center justify-center space-x-4 lg:space-x-6">
                    <div className="text-center flex-1">
                      <div className="font-bold text-blue-800">{getSelectedTeamInfo(selectedTeam1)?.name}</div>
                      <div className="text-sm text-blue-600">{getSelectedTeamInfo(selectedTeam1)?.poolName}</div>
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-purple-600 px-4">VS</div>
                    <div className="text-center flex-1">
                      <div className="font-bold text-green-800">{getSelectedTeamInfo(selectedTeam2)?.name}</div>
                      <div className="text-sm text-green-600">{getSelectedTeamInfo(selectedTeam2)?.poolName}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Details - Mobile Optimized */}
              <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>🏷️</span>
                      Match Type
                    </span>
                  </label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="CUSTOM">⚙️ Custom Match</option>
                    <option value="EXHIBITION">🎪 Exhibition Match</option>
                    <option value="PLAYOFF">🏆 Playoff Match</option>
                    <option value="FRIENDLY">🤝 Friendly Match</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span>🏟️</span>
                      Court Number
                      <span className="text-xs text-gray-500">(Optional)</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    value={courtNumber}
                    onChange={(e) => setCourtNumber(e.target.value)}
                    placeholder="e.g., 1, 2, 3..."
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span>⏰</span>
                    Scheduled Time
                    <span className="text-xs text-gray-500">(Optional)</span>
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span>📝</span>
                    Notes
                    <span className="text-xs text-gray-500">(Optional)</span>
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special notes about this match..."
                  rows="3"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base resize-none"
                />
              </div>

              {/* Teams Summary - Mobile Optimized */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
                  <span>📊</span>
                  Available Teams Summary
                </h4>

                {/* Mobile: Simplified View */}
                <div className="sm:hidden space-y-2">
                  {Object.entries(teamsByPool).slice(0, 3).map(([poolName, teams]) => (
                    <div key={poolName} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                      <span className="font-medium text-gray-600 truncate">{poolName}</span>
                      <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">{teams.length}</span>
                    </div>
                  ))}
                  {Object.keys(teamsByPool).length > 3 && (
                    <div className="text-center text-xs text-gray-500 py-2">
                      +{Object.keys(teamsByPool).length - 3} more pools
                    </div>
                  )}
                </div>

                {/* Desktop: Full Grid */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3 text-sm">
                  {Object.entries(teamsByPool).map(([poolName, teams]) => (
                    <div key={poolName} className="bg-white p-2 lg:p-3 rounded border">
                      <div className="font-medium text-gray-600 truncate">{poolName}</div>
                      <div className="text-gray-500">{teams.length} teams</div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 sm:mt-3 text-xs text-gray-500 text-center sm:text-left">
                  Total: {allTeams.length} teams available for custom matches
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer - Fixed */}
        {allTeams.length > 0 && (
          <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="order-2 sm:order-1 px-4 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedTeam1 || !selectedTeam2}
                className="order-1 sm:order-2 flex-1 px-4 py-2 sm:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Match...</span>
                  </>
                ) : (
                  <>
                    <span>⚙️</span>
                    <span className="hidden sm:inline">Create Custom Match</span>
                    <span className="sm:hidden">Create Match</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMatchModal;