import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tournamentService } from '../services/tournamentService';
import { matchService } from '../services/matchService';
import MatchCard from './MatchCard';
import QualifierSetupModal from './QualifierSetupModal';
import CustomMatchModal from './CustomMatchModal';
import SemifinalAndFinal from './SemifinalAndFinal';

const KnockoutManager = ({ tournamentId }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const [knockoutData, setKnockoutData] = useState({
    qualifiers: [],
    semifinals: [],
    finals: [],
    customMatches: []
  });
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhase, setActivePhase] = useState('qualifiers');
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showQualifierSetup, setShowQualifierSetup] = useState(false);

  // Only allow management if user is logged in and admin
  const canManage = isLoggedIn && isAdmin;

  // Add debug logging
  console.log('KnockoutManager - Auth state:', { isLoggedIn, isAdmin, canManage });

  useEffect(() => {
    console.log('KnockoutManager mounted with tournamentId:', tournamentId);
    if (tournamentId) {
      loadKnockoutData();
    }
  }, [tournamentId]);

  const loadKnockoutData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading knockout data...');

      const [knockoutResponse, teamsResponse] = await Promise.all([
        tournamentService.getKnockoutMatches(tournamentId),
        tournamentService.getQualifiedTeams(tournamentId, 2)
      ]);

      console.log('Knockout data response:', knockoutResponse);
      console.log('Available teams response:', teamsResponse);

      const knockoutDataResult = knockoutResponse.data || knockoutResponse;
      setKnockoutData({
        qualifiers: knockoutDataResult.qualifiers || [],
        semifinals: knockoutDataResult.semifinals || [],
        finals: knockoutDataResult.finals || [],
        customMatches: knockoutDataResult.customMatches || []
      });

      const teamsResult = teamsResponse.data || teamsResponse || [];
      setAvailableTeams(teamsResult);

      console.log('Data loaded successfully');

    } catch (error) {
      console.error('Error loading knockout data:', error);
      setError('Failed to load knockout data: ' + (error.message || 'Unknown error'));

      setKnockoutData({
        qualifiers: [],
        semifinals: [],
        finals: [],
        customMatches: []
      });
      setAvailableTeams([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Centralized loading management
  const handleAsyncAction = async (action) => {
    if (!canManage) {
      alert('🔒 Please log in to perform this action');
      return;
    }

    try {
      setLoading(true);
      await action();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQualifiers = async (teamsPerPool, schedulingRules) => {
    await handleAsyncAction(async () => {
      console.log('Generating qualifiers for tournament:', tournamentId, 'with teamsPerPool:', teamsPerPool, 'rules:', schedulingRules);

      // Clear existing qualifiers in the UI first
      setKnockoutData(prev => ({
        ...prev,
        qualifiers: []
      }));

      // Generate new qualifiers
      await tournamentService.generateQualifierMatches(tournamentId, teamsPerPool, schedulingRules);

      // Reload data to get the fresh set of matches
      await loadKnockoutData();
      alert('Qualifier matches generated successfully!');
      setShowQualifierSetup(false);
    });
  };

  const resetQualifiers = async () => {
    if (!canManage) {
      alert('🔒 Please log in to reset qualifiers');
      return;
    }

    if (!window.confirm('This will reset all qualifier matches and generate new ones. Are you sure?')) {
      return;
    }

    await handleAsyncAction(async () => {
      console.log('Resetting qualifiers for tournament:', tournamentId);

      // Clear existing qualifiers in the UI first
      setKnockoutData(prev => ({
        ...prev,
        qualifiers: []
      }));

      // Reset qualifiers on backend
      await tournamentService.resetQualifierMatches(tournamentId);

      // Reload data to get the fresh set of matches
      await loadKnockoutData();
      alert('Qualifier matches reset successfully!');
    });
  };

  const phases = [
    { key: 'qualifiers', label: 'Qualifiers', shortLabel: 'Qual', data: knockoutData.qualifiers, icon: '🎯' },
    { key: 'semifinals', label: 'Semifinals', shortLabel: 'Semi', data: knockoutData.semifinals, icon: '⚡' },
    { key: 'finals', label: 'Finals', shortLabel: 'Final', data: knockoutData.finals, icon: '🏆' },
    { key: 'custom', label: 'Custom Matches', shortLabel: 'Custom', data: knockoutData.customMatches, icon: '⚙️' }
  ];

  const getProgressionInfo = () => {
    const totalTeams = availableTeams.length;
    const completedQualifiers = knockoutData.qualifiers.filter(m => m.status === 'COMPLETED').length;
    const completedSemifinals = knockoutData.semifinals.filter(m => m.status === 'COMPLETED').length;

    const allQualifiersCompleted = knockoutData.qualifiers.length > 0 &&
      knockoutData.qualifiers.every(m => m.status === 'COMPLETED');
    const allSemifinalsCompleted = knockoutData.semifinals.length > 0 &&
      knockoutData.semifinals.every(m => m.status === 'COMPLETED');

    const expectedSemifinalTeams = Math.min(8, completedQualifiers);

    return {
      totalTeams,
      qualifiersCompleted: completedQualifiers,
      qualifiersTotal: knockoutData.qualifiers.length,
      semifinalsCompleted: completedSemifinals,
      semifinalsTotal: knockoutData.semifinals.length,
      allQualifiersCompleted,
      allSemifinalsCompleted,
      canGenerateSemifinals: allQualifiersCompleted && knockoutData.semifinals.length === 0,
      canGenerateFinals: allSemifinalsCompleted && knockoutData.finals.length === 0,
      expectedSemifinalTeams
    };
  };

  const progressionInfo = getProgressionInfo();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-32 sm:h-64 p-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
        <p className="text-gray-600 text-sm sm:text-base text-center">Loading knockout phase...</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">Tournament ID: {tournamentId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 lg:p-6 mx-2 sm:mx-0">
        <div className="flex items-start mb-3 sm:mb-4">
          <div className="text-red-500 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0">⚠️</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Error Loading Knockout Phase</h3>
            <p className="text-red-700 text-sm sm:text-base mb-3 sm:mb-4 break-words">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadKnockoutData();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-0">
      {/* Read-only notice - Mobile Optimized */}
      {!isLoggedIn && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-medium text-yellow-800">
                🔒 View-Only Mode
              </h3>
              <p className="text-xs text-yellow-700 mt-1 sm:hidden">Login to manage knockout matches</p>
            </div>
          </div>
        </div>
      )}

      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-3 sm:p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl sm:text-2xl">🏆</span>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">Knockout Phase</h2>
        </div>
        <p className="text-purple-100 text-xs sm:text-sm lg:text-base">
          <span className="hidden sm:inline">Manage elimination rounds with qualified teams from pools</span>
          <span className="sm:hidden">Elimination rounds management</span>
        </p>

        {/* Progression Summary - Mobile Optimized */}
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 lg:gap-4">
          {/* Mobile: Stacked Cards */}
          <div className="sm:hidden space-y-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">🎯 Qualifiers</div>
                <div className="text-sm">{progressionInfo.qualifiersCompleted}/{progressionInfo.qualifiersTotal}</div>
              </div>
              {progressionInfo.allQualifiersCompleted && (
                <div className="text-green-200 text-xs mt-1">✅ Ready for semifinals</div>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">⚡ Semifinals</div>
                <div className="text-sm">{progressionInfo.semifinalsCompleted}/{progressionInfo.semifinalsTotal}</div>
              </div>
              {progressionInfo.allSemifinalsCompleted && (
                <div className="text-green-200 text-xs mt-1">✅ Ready for finals</div>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm">🏆 Finals</div>
                <div className="text-sm">{knockoutData.finals.length > 0 ? `${progressionInfo.semifinalsCompleted}/1` : 'Not generated'}</div>
              </div>
              {knockoutData.finals.length > 0 && knockoutData.finals.every(m => m.status === 'COMPLETED') && (
                <div className="text-green-200 text-xs mt-1">🏆 Tournament Complete!</div>
              )}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden sm:contents">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="font-semibold text-sm lg:text-base">Qualifiers</div>
              <div className="text-sm lg:text-base">{progressionInfo.qualifiersCompleted}/{progressionInfo.qualifiersTotal} completed</div>
              {progressionInfo.allQualifiersCompleted && (
                <div className="text-green-200 text-xs mt-1">✅ Ready for semifinals</div>
              )}
              {knockoutData.qualifiers.length > 0 && canManage && (
                <div className="text-blue-200 text-xs mt-1">🔄 Can be reset and regenerated</div>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="font-semibold text-sm lg:text-base">Semifinals</div>
              <div className="text-sm lg:text-base">{progressionInfo.semifinalsCompleted}/{progressionInfo.semifinalsTotal} completed</div>
              {progressionInfo.allSemifinalsCompleted && (
                <div className="text-green-200 text-xs mt-1">✅ Ready for finals</div>
              )}
              {knockoutData.semifinals.length > 0 && canManage && (
                <div className="text-blue-200 text-xs mt-1">🔄 Can be reset and regenerated</div>
              )}
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 lg:col-span-1">
              <div className="font-semibold text-sm lg:text-base">Finals</div>
              <div className="text-sm lg:text-base">{knockoutData.finals.length > 0 ? `${progressionInfo.semifinalsCompleted}/1 completed` : 'Not generated'}</div>
              {knockoutData.finals.length > 0 && knockoutData.finals.every(m => m.status === 'COMPLETED') && (
                <div className="text-green-200 text-xs mt-1">🏆 Tournament Complete!</div>
              )}
              {knockoutData.finals.length > 0 && canManage && (
                <div className="text-blue-200 text-xs mt-1">🔄 Can be reset and regenerated</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phase Navigation - Mobile Optimized */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 sm:gap-2 min-w-max sm:min-w-0 px-2 sm:px-0">
          {phases.map((phase) => (
            <button
              key={phase.key}
              onClick={() => setActivePhase(phase.key)}
              className={`flex-shrink-0 px-2 sm:px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm lg:text-base ${
                activePhase === phase.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{phase.icon}</span>
              <span className="sm:hidden">{phase.shortLabel}</span>
              <span className="hidden sm:inline">{phase.label}</span>
              <span className="ml-1">({phase.data.length})</span>
              {!isLoggedIn && <span className="ml-1">👁️</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons - Mobile Optimized */}
      {(activePhase === 'qualifiers' || activePhase === 'custom') && canManage && (
        <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 sm:flex-wrap px-2 sm:px-0">
          {activePhase === 'qualifiers' && (
            <>
              <button
                onClick={() => setShowQualifierSetup(true)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                disabled={loading}
              >
                <span>{knockoutData.qualifiers.length > 0 ? '🔄' : '🎯'}</span>
                <span className="hidden sm:inline">
                  {knockoutData.qualifiers.length > 0 ? 'Reconfigure Qualifiers' : 'Setup Qualifier Matches'}
                </span>
                <span className="sm:hidden">
                  {knockoutData.qualifiers.length > 0 ? 'Reconfigure' : 'Setup Qualifiers'}
                </span>
              </button>

              {knockoutData.qualifiers.length > 0 && (
                <button
                  onClick={resetQualifiers}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Reset Qualifiers</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
            </>
          )}

          {activePhase === 'custom' && (
            <button
              onClick={() => setShowCreateMatch(true)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              disabled={loading}
            >
              <span>➕</span>
              <span className="hidden sm:inline">Create Custom Match</span>
              <span className="sm:hidden">Create Match</span>
            </button>
          )}
        </div>
      )}

      {/* Login prompt - Mobile Optimized */}
      {(activePhase === 'qualifiers' || activePhase === 'custom') && !canManage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mx-2 sm:mx-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-blue-700 text-sm sm:text-base">
                <span className="hidden sm:inline">
                  {activePhase === 'qualifiers'
                    ? '🎯 Login to setup and manage qualifier matches'
                    : '➕ Login to create custom matches'
                  }
                </span>
                <span className="sm:hidden">
                  {activePhase === 'qualifiers'
                    ? '🎯 Login to manage qualifiers'
                    : '➕ Login to create matches'
                  }
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">
                  {activePhase === 'qualifiers' ? 'Setup Qualifiers' : 'Create Match'}
                </span>
                <span className="sm:hidden">
                  {activePhase === 'qualifiers' ? 'Setup' : 'Create'}
                </span>
              </span>
              <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm">
                🔒 Login Required
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Semifinals and Finals Component */}
      <SemifinalAndFinal
        tournamentId={tournamentId}
        knockoutData={knockoutData}
        loading={loading}
        setLoading={setLoading}
        onDataUpdate={loadKnockoutData}
        activePhase={activePhase}
      />

      {/* Qualifiers and Custom Matches Display */}
      {(activePhase === 'qualifiers' || activePhase === 'custom') && (
        <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
          {phases.find(p => p.key === activePhase)?.data.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onStartMatch={async (matchId, courtNumber) => {
                if (!isLoggedIn) {
                  alert('🔒 Please log in to start matches');
                  return;
                }
                try {
                  await matchService.startMatch(matchId, courtNumber);
                  loadKnockoutData();
                } catch (error) {
                  console.error('Error starting match:', error);
                }
              }}
              onMarkReady={async (matchId) => {
                if (!isLoggedIn) {
                  alert('🔒 Please log in to mark matches as ready');
                  return;
                }
                try {
                  await matchService.markMatchAsReady(matchId);
                  loadKnockoutData();
                } catch (error) {
                  console.error('Error marking match as ready:', error);
                }
              }}
              onRefresh={loadKnockoutData}
            />
          ))}

          {/* Empty State - Mobile Optimized */}
          {phases.find(p => p.key === activePhase)?.data.length === 0 && (
            <div className="text-center py-6 sm:py-8 lg:py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-500 text-base sm:text-lg mb-2">
                No {activePhase} matches yet
              </div>
              <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4 px-4">
                {activePhase === 'qualifiers' && (
                  <>
                    <span className="hidden sm:inline">Setup qualifier matches with teams from pool phase</span>
                    <span className="sm:hidden">Setup qualifiers with pool teams</span>
                  </>
                )}
                {activePhase === 'custom' && (
                  <>
                    <span className="hidden sm:inline">Create custom matches for special scenarios</span>
                    <span className="sm:hidden">Create custom matches</span>
                  </>
                )}
              </p>

              {/* Available Teams Display - Mobile Optimized */}
              {availableTeams.length > 0 && activePhase === 'qualifiers' && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg mx-2 sm:mx-0">
                  <p className="text-blue-700 font-medium text-sm sm:text-base">
                    Qualified Teams ({availableTeams.length}):
                  </p>
                  <p className="text-blue-600 text-xs sm:text-sm mb-2">
                    <span className="hidden sm:inline">Top performers from pool phase</span>
                    <span className="sm:hidden">Top pool performers</span>
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 justify-center">
                    {availableTeams.slice(0, 6).map((team) => (
                      <span key={team.id} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                        {team.name}
                      </span>
                    ))}
                    {availableTeams.length > 6 && (
                      <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm">
                        +{availableTeams.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals - only show if logged in */}
      {canManage && showQualifierSetup && (
        <QualifierSetupModal
          availableTeams={availableTeams}
          knockoutData={knockoutData}
          onClose={() => setShowQualifierSetup(false)}
          onGenerate={generateQualifiers}
          onTeamsPerPoolChange={async (teamsPerPool) => {
            try {
              const teamsResponse = await tournamentService.getQualifiedTeams(tournamentId, teamsPerPool);
              const teamsResult = teamsResponse.data || teamsResponse || [];
              setAvailableTeams(teamsResult);
            } catch (error) {
              console.error('Error fetching teams:', error);
            }
          }}
        />
      )}

      {canManage && showCreateMatch && (
        <CustomMatchModal
          tournamentId={tournamentId}
          onClose={() => setShowCreateMatch(false)}
          onMatchCreated={() => {
            loadKnockoutData();
            setShowCreateMatch(false);
          }}
        />
      )}
    </div>
  );
};

export default KnockoutManager;