import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tournamentService } from '../services/tournamentService';
import { matchService } from '../services/matchService';
import MatchCard from './MatchCard';
import { CheckCircle2, XCircle, Trophy, Shield, Zap, Trash2, RotateCcw, Sparkles } from 'lucide-react';

const SemifinalAndFinal = ({
  tournamentId,
  knockoutData,
  loading,
  onDataUpdate,
  activePhase
}) => {
  const { isLoggedIn, isAdmin } = useAuth();

  // =====================================================================
  // QUARTERFINAL ACTIONS
  // =====================================================================

  const generateQuarterfinals = async () => {
    if (!isLoggedIn) {
      alert('Please log in to generate quarterfinal matches');
      return;
    }

    try {
      const incompleteQualifiers = knockoutData.qualifiers.filter(m => m.status !== 'COMPLETED');
      if (incompleteQualifiers.length > 0) {
        alert(`Please complete all qualifier matches first. ${incompleteQualifiers.length} matches are still pending.`);
        return;
      }

      await tournamentService.generateQuarterfinalMatches(tournamentId);
      await onDataUpdate();
      alert('Quarterfinal matches generated successfully!');
    } catch (error) {
      console.error('Error generating quarterfinals:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to generate quarterfinal matches: ' + errorMessage);
    }
  };

  const resetQuarterfinals = async () => {
    if (!isLoggedIn) {
      alert('Please log in to reset quarterfinal matches');
      return;
    }

    if (!window.confirm('Are you sure you want to reset all quarterfinal matches?')) {
      return;
    }

    try {
      await tournamentService.resetQuarterfinalMatches(tournamentId);
      await onDataUpdate();
      alert('Quarterfinal matches reset successfully!');
    } catch (error) {
      console.error('Error resetting quarterfinals:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to reset quarterfinal matches: ' + errorMessage);
      await onDataUpdate();
    }
  };

  // =====================================================================
  // SEMIFINAL ACTIONS
  // =====================================================================

  const generateSemifinals = async () => {
    if (!isLoggedIn) {
      alert('Please log in to generate semifinal matches');
      return;
    }

    try {
      // Check if there are quarterfinals that need to be completed first
      if (knockoutData.quarterfinals.length > 0) {
        const incompleteQF = knockoutData.quarterfinals.filter(m => m.status !== 'COMPLETED');
        if (incompleteQF.length > 0) {
          alert(`Please complete all quarterfinal matches first. ${incompleteQF.length} matches are still pending.`);
          return;
        }
      } else {
        const incompleteQualifiers = knockoutData.qualifiers.filter(m => m.status !== 'COMPLETED');
        const completedQualifiers = knockoutData.qualifiers.filter(m => m.status === 'COMPLETED');

        if (incompleteQualifiers.length > 0) {
          alert(`Please complete all qualifier matches first. ${incompleteQualifiers.length} matches are still pending.`);
          return;
        }

        if (completedQualifiers.length < 2) {
          alert(`Need at least 2 completed matches from the previous round. You have ${completedQualifiers.length}.`);
          return;
        }
      }

      await tournamentService.generateSemifinalMatches(tournamentId);
      await onDataUpdate();
      alert('Semifinal matches generated successfully!');
    } catch (error) {
      console.error('Error generating semifinals:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to generate semifinal matches: ' + errorMessage);
    }
  };

  const resetSemifinals = async () => {
    if (!isLoggedIn) {
      alert('Please log in to reset semifinal matches');
      return;
    }

    if (!window.confirm('Are you sure you want to reset all semifinal matches?')) {
      return;
    }

    try {
      await tournamentService.resetSemifinalMatches(tournamentId);
      await onDataUpdate();
      alert('Semifinal matches reset successfully!');
    } catch (error) {
      console.error('Error resetting semifinals:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to reset semifinal matches: ' + errorMessage);
      await onDataUpdate();
    }
  };

  // =====================================================================
  // FINAL ACTIONS
  // =====================================================================

  const generateFinals = async () => {
    if (!isLoggedIn) {
      alert('Please log in to generate final matches');
      return;
    }

    try {
      const incompleteSemifinals = knockoutData.semifinals.filter(m => m.status !== 'COMPLETED');
      if (incompleteSemifinals.length > 0) {
        alert(`Please complete all semifinal matches first. ${incompleteSemifinals.length} matches are still pending.`);
        return;
      }

      await tournamentService.generateFinalMatches(tournamentId);
      await onDataUpdate();
      alert('Final matches generated successfully!');
    } catch (error) {
      console.error('Error generating finals:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to generate final matches: ' + errorMessage);
    }
  };

  const resetFinals = async () => {
    if (!isLoggedIn) {
      alert('Please log in to reset final matches');
      return;
    }

    if (!window.confirm('Are you sure you want to reset all final matches?')) {
      return;
    }

    try {
      await tournamentService.resetFinalMatches(tournamentId);
      await onDataUpdate();
      alert('Final matches reset successfully!');
    } catch (error) {
      console.error('Error resetting finals:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to reset final matches: ' + errorMessage);
      await onDataUpdate();
    }
  };

  // =====================================================================
  // RESET ALL
  // =====================================================================

  const resetAllKnockout = async () => {
    if (!isLoggedIn) {
      alert('Please log in to reset knockout matches');
      return;
    }

    const totalMatches = knockoutData.qualifiers.length + knockoutData.quarterfinals.length +
                        knockoutData.semifinals.length + knockoutData.finals.length;

    const confirmMessage = `Are you sure you want to reset ALL knockout matches?\n\n` +
      `This will delete:\n` +
      `• ${knockoutData.qualifiers.length} qualifier matches\n` +
      `• ${knockoutData.quarterfinals.length} quarterfinal matches\n` +
      `• ${knockoutData.semifinals.length} semifinal matches\n` +
      `• ${knockoutData.finals.length} final matches\n\n` +
      `Total: ${totalMatches} matches\n\n` +
      `This action cannot be undone!`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await tournamentService.resetAllKnockoutMatches(tournamentId);
      await onDataUpdate();
      alert('All knockout matches reset successfully!');
    } catch (error) {
      console.error('Error resetting all knockout matches:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to reset all knockout matches: ' + errorMessage);
      await onDataUpdate();
    }
  };

  // =====================================================================
  // PROGRESSION INFO
  // =====================================================================

  const getProgressionInfo = () => {
    const completedQualifiers = knockoutData.qualifiers.filter(m => m.status === 'COMPLETED').length;
    const completedQuarterfinals = knockoutData.quarterfinals.filter(m => m.status === 'COMPLETED').length;
    const completedSemifinals = knockoutData.semifinals.filter(m => m.status === 'COMPLETED').length;

    const allQualifiersCompleted = knockoutData.qualifiers.length > 0 &&
      knockoutData.qualifiers.every(m => m.status === 'COMPLETED');
    const allQuarterfinalsCompleted = knockoutData.quarterfinals.length > 0 &&
      knockoutData.quarterfinals.every(m => m.status === 'COMPLETED');
    const allSemifinalsCompleted = knockoutData.semifinals.length > 0 &&
      knockoutData.semifinals.every(m => m.status === 'COMPLETED');

    const qualifierWinners = completedQualifiers;
    // Only need quarterfinals if more than 4 winners AND no quarterfinals/semifinals generated yet
    const needsQuarterfinals = qualifierWinners > 4 && knockoutData.quarterfinals.length === 0 && knockoutData.semifinals.length === 0;

    // Can generate semifinals if:
    // 1. Quarterfinals exist and all completed, OR
    // 2. All qualifiers completed and no quarterfinals exist (user goes directly to SF)
    const canGenerateSemifinals = knockoutData.semifinals.length === 0 && (
      allQuarterfinalsCompleted ||
      (allQualifiersCompleted && knockoutData.quarterfinals.length === 0)
    );

    return {
      qualifiersCompleted: completedQualifiers,
      qualifiersTotal: knockoutData.qualifiers.length,
      quarterfinalsCompleted: completedQuarterfinals,
      quarterfinalsTotal: knockoutData.quarterfinals.length,
      semifinalsCompleted: completedSemifinals,
      semifinalsTotal: knockoutData.semifinals.length,
      allQualifiersCompleted,
      allQuarterfinalsCompleted,
      allSemifinalsCompleted,
      needsQuarterfinals,
      canGenerateQuarterfinals: allQualifiersCompleted && qualifierWinners > 4 && knockoutData.quarterfinals.length === 0,
      canGenerateSemifinals,
      canGenerateFinals: allSemifinalsCompleted && knockoutData.finals.length === 0
    };
  };

  const progressionInfo = getProgressionInfo();

  const handleAsyncAction = async (action) => {
    try {
      await action();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  // =====================================================================
  // RENDER ACTION BUTTONS
  // =====================================================================

  const renderActionButtons = () => {
    if (!isLoggedIn) {
      return (
        <div className="mb-4 sm:mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Login Required for {activePhase === 'quarterfinals' ? 'Quarterfinal' : activePhase === 'semifinals' ? 'Semifinal' : 'Final'} Management
                </h3>
                <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                  Please log in to generate, reset, and manage {activePhase} matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 sm:mb-6">
        {/* Progress Info Bar */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Tournament Progress</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex justify-between sm:flex-col sm:justify-start">
              <span className="text-blue-700">Qualifiers:</span>
              <span className="font-medium text-blue-900">
                {progressionInfo.qualifiersCompleted}/{progressionInfo.qualifiersTotal}
                {progressionInfo.allQualifiersCompleted && <CheckCircle2 className="w-3 h-3 inline ml-1" />}
              </span>
            </div>
            {knockoutData.quarterfinals.length > 0 && (
              <div className="flex justify-between sm:flex-col sm:justify-start">
                <span className="text-blue-700">Quarterfinals:</span>
                <span className="font-medium text-blue-900">
                  {progressionInfo.quarterfinalsCompleted}/{progressionInfo.quarterfinalsTotal}
                  {progressionInfo.allQuarterfinalsCompleted && <CheckCircle2 className="w-3 h-3 inline ml-1" />}
                </span>
              </div>
            )}
            <div className="flex justify-between sm:flex-col sm:justify-start">
              <span className="text-blue-700">Semifinals:</span>
              <span className="font-medium text-blue-900">
                {progressionInfo.semifinalsCompleted}/{progressionInfo.semifinalsTotal}
                {progressionInfo.allSemifinalsCompleted && <CheckCircle2 className="w-3 h-3 inline ml-1" />}
              </span>
            </div>
            <div className="flex justify-between sm:flex-col sm:justify-start">
              <span className="text-blue-700">Finals:</span>
              <span className="font-medium text-blue-900">
                {knockoutData.finals.filter(m => m.status === 'COMPLETED').length}/{knockoutData.finals.length}
                {knockoutData.finals.length > 0 && knockoutData.finals.every(m => m.status === 'COMPLETED') && <Trophy className="w-3 h-3 inline ml-1" />}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Quarterfinal buttons */}
            {activePhase === 'quarterfinals' && (
              <>
                {progressionInfo.canGenerateQuarterfinals && (
                  <button
                    onClick={() => handleAsyncAction(generateQuarterfinals)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                    disabled={loading}
                  >
                    <span className="flex items-center justify-center">
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Generate Quarterfinal Matches</span>
                      <span className="sm:hidden">Generate Quarterfinals</span>
                    </span>
                  </button>
                )}
                {!progressionInfo.canGenerateQuarterfinals && knockoutData.quarterfinals.length === 0 && (
                  <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm text-center">
                    Complete all qualifiers (with more than 4 winners) to generate quarterfinals
                  </div>
                )}
              </>
            )}

            {/* Semifinal buttons */}
            {activePhase === 'semifinals' && (
              <>
                {progressionInfo.canGenerateSemifinals && (
                  <button
                    onClick={() => handleAsyncAction(generateSemifinals)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                    disabled={loading}
                  >
                    <span className="flex items-center justify-center">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Generate Semifinal Matches</span>
                      <span className="sm:hidden">Generate Semifinals</span>
                    </span>
                  </button>
                )}
                {!progressionInfo.canGenerateSemifinals && knockoutData.semifinals.length === 0 && (
                  <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm text-center">
                    {progressionInfo.needsQuarterfinals
                      ? 'Generate and complete quarterfinals first'
                      : 'Complete all matches from the previous round to generate semifinals'}
                  </div>
                )}
              </>
            )}

            {/* Final buttons */}
            {activePhase === 'finals' && (
              <>
                {progressionInfo.canGenerateFinals && (
                  <button
                    onClick={() => handleAsyncAction(generateFinals)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                    disabled={loading}
                  >
                    <span className="flex items-center justify-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Generate Final Matches</span>
                      <span className="sm:hidden">Generate Finals</span>
                    </span>
                  </button>
                )}
                {!progressionInfo.canGenerateFinals && knockoutData.finals.length === 0 && (
                  <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm text-center">
                    Complete all semifinals to generate finals
                  </div>
                )}
              </>
            )}
          </div>

          {/* Reset Buttons */}
          {(knockoutData.quarterfinals.length > 0 || knockoutData.semifinals.length > 0 || 
            knockoutData.finals.length > 0 || knockoutData.qualifiers.length > 0) && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3 border-t sm:border-t-0 border-gray-200">
              {activePhase === 'quarterfinals' && knockoutData.quarterfinals.length > 0 && (
                <button
                  onClick={() => handleAsyncAction(resetQuarterfinals)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-1">
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Reset Quarterfinals</span><span className="sm:hidden">Reset</span>
                  </span>
                </button>
              )}

              {activePhase === 'semifinals' && knockoutData.semifinals.length > 0 && (
                <button
                  onClick={() => handleAsyncAction(resetSemifinals)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-1">
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Reset Semifinals</span><span className="sm:hidden">Reset</span>
                  </span>
                </button>
              )}

              {activePhase === 'finals' && knockoutData.finals.length > 0 && (
                <button
                  onClick={() => handleAsyncAction(resetFinals)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-1">
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Reset Finals</span><span className="sm:hidden">Reset</span>
                  </span>
                </button>
              )}

              {/* Global Reset Button */}
              <button
                onClick={() => handleAsyncAction(resetAllKnockout)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors border-2 border-gray-600 disabled:opacity-50 text-sm font-medium"
                disabled={loading}
              >
                  <span className="flex items-center justify-center gap-1">
                  <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Reset All Knockout</span><span className="sm:hidden">Reset All</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-3 flex items-center justify-center text-sm text-gray-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        )}
      </div>
    );
  };

  // =====================================================================
  // RENDER MATCHES
  // =====================================================================

  const renderMatches = () => {
    let currentMatches;
    let phaseLabel;

    switch (activePhase) {
      case 'quarterfinals':
        currentMatches = knockoutData.quarterfinals;
        phaseLabel = 'Quarterfinal';
        break;
      case 'semifinals':
        currentMatches = knockoutData.semifinals;
        phaseLabel = 'Semifinal';
        break;
      case 'finals':
        // Include both final and third place matches
        currentMatches = [...(knockoutData.finals || []), ...(knockoutData.thirdPlace || [])];
        phaseLabel = 'Final';
        break;
      default:
        return null;
    }

    if (currentMatches.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <div className="px-4">
            <div className="text-gray-500 text-base sm:text-lg mb-2">
              No {activePhase} matches yet
            </div>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              {activePhase === 'quarterfinals' && 'Complete qualifiers to generate quarterfinals'}
              {activePhase === 'semifinals' && (
                knockoutData.quarterfinals.length > 0
                  ? 'Complete quarterfinals to generate semifinals'
                  : 'Complete qualifiers to generate semifinals'
              )}
              {activePhase === 'finals' && 'Complete semifinals to generate finals'}
            </p>

            <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 text-left max-w-sm mx-auto">
              <h4 className="font-medium text-gray-700 mb-2 text-sm">Requirements:</h4>
              <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                {activePhase === 'quarterfinals' && (
                  <div className="flex justify-between">
                    <span>Qualifiers completed:</span>
                    <span className={progressionInfo.allQualifiersCompleted ? 'text-green-600' : 'text-red-600'}>
                      {progressionInfo.qualifiersCompleted}/{progressionInfo.qualifiersTotal}
                      {progressionInfo.allQualifiersCompleted ? <CheckCircle2 className="w-3 h-3 inline ml-1" /> : <XCircle className="w-3 h-3 inline ml-1" />}
                    </span>
                  </div>
                )}
                {activePhase === 'semifinals' && (
                  <>
                    {knockoutData.quarterfinals.length > 0 ? (
                      <div className="flex justify-between">
                        <span>Quarterfinals completed:</span>
                        <span className={progressionInfo.allQuarterfinalsCompleted ? 'text-green-600' : 'text-red-600'}>
                          {progressionInfo.quarterfinalsCompleted}/{progressionInfo.quarterfinalsTotal}
                          {progressionInfo.allQuarterfinalsCompleted ? <CheckCircle2 className="w-3 h-3 inline ml-1" /> : <XCircle className="w-3 h-3 inline ml-1" />}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>Qualifiers completed:</span>
                        <span className={progressionInfo.allQualifiersCompleted ? 'text-green-600' : 'text-red-600'}>
                          {progressionInfo.qualifiersCompleted}/{progressionInfo.qualifiersTotal}
                          {progressionInfo.allQualifiersCompleted ? <CheckCircle2 className="w-3 h-3 inline ml-1" /> : <XCircle className="w-3 h-3 inline ml-1" />}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {activePhase === 'finals' && (
                  <div className="flex justify-between">
                    <span>Semifinals completed:</span>
                    <span className={progressionInfo.allSemifinalsCompleted ? 'text-green-600' : 'text-red-600'}>
                      {progressionInfo.semifinalsCompleted}/{progressionInfo.semifinalsTotal}
                      {progressionInfo.allSemifinalsCompleted ? <CheckCircle2 className="w-3 h-3 inline ml-1" /> : <XCircle className="w-3 h-3 inline ml-1" />}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isLoggedIn && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block max-w-sm">
                <p className="text-blue-700 text-xs sm:text-sm">
                  Login to generate and manage {activePhase} matches
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Matches Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
            {activePhase} Matches ({currentMatches.length})
          </h3>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <span className="mr-2">Status:</span>
            <div className="flex gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {currentMatches.filter(m => m.status === 'COMPLETED').length} Done
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {currentMatches.filter(m => m.status === 'ONGOING').length} Live
              </span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                {currentMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'READY').length} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Matches List */}
        {currentMatches.map((match, index) => (
          <div key={match.id} className="relative">
            <div className="sm:hidden mb-2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {match.matchName || `${phaseLabel} ${index + 1}`}
              </span>
            </div>

            <MatchCard
              match={match}
              onStartMatch={async (matchId, courtNumber) => {
                if (!isLoggedIn) {
                  alert('Please log in to start matches');
                  return;
                }
                await handleAsyncAction(async () => {
                  await matchService.startMatch(matchId, courtNumber);
                  await onDataUpdate();
                });
              }}
              onMarkReady={async (matchId) => {
                if (!isLoggedIn) {
                  alert('Please log in to mark matches as ready');
                  return;
                }
                await handleAsyncAction(async () => {
                  await matchService.markMatchAsReady(matchId);
                  await onDataUpdate();
                });
              }}
              onRefresh={onDataUpdate}
            />
          </div>
        ))}

        {/* Progress Summary */}
        <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">
              {phaseLabel} Progress
            </h4>
            <div className="text-xs sm:text-sm text-blue-700">
              {currentMatches.filter(m => m.status === 'COMPLETED').length} of {currentMatches.length} matches completed
              {currentMatches.every(m => m.status === 'COMPLETED') && (
                <span className="mt-1 font-medium text-green-700 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" /> All {activePhase} completed!
                  {activePhase === 'quarterfinals' && ' Ready for semifinals.'}
                  {activePhase === 'semifinals' && ' Ready for finals.'}
                  {activePhase === 'finals' && <> Tournament complete! <Trophy className="w-4 h-4" /></>}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Only render for quarterfinals, semifinals, or finals
  if (activePhase !== 'quarterfinals' && activePhase !== 'semifinals' && activePhase !== 'finals') {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {renderActionButtons()}
      {renderMatches()}
    </div>
  );
};

export default SemifinalAndFinal;
