import React, { useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';
import { poolService } from '../services/poolService';
import { Target, AlertTriangle, BarChart3, Inbox, CheckCircle2, Circle, FileText, Users, Activity, Wrench, SlidersHorizontal, Trophy, Lightbulb, RefreshCw, Shuffle, Dices, Ban, Eye, XCircle, Settings } from 'lucide-react';

const QualifierSetupModal = ({
  availableTeams,
  knockoutData,
  onClose,
  onGenerate,
  onTeamsPerPoolChange
}) => {
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState([]);
  const [selectedPools, setSelectedPools] = useState([]);
  // Per-pool qualifier counts: { poolId: count }
  const [perPoolCounts, setPerPoolCounts] = useState({});
  const [qualifierSettings, setQualifierSettings] = useState({
    teamsPerPool: 4,
    usePerPoolCounts: false, // Toggle between uniform and per-pool
    matchType: 'QUALIFIER',
    autoSchedule: true,
    courtAssignment: 'AUTO',
    pairingStrategy: 'CROSS_POOL',
    avoidSamePool: true
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [poolStats, setPoolStats] = useState({});

  const tournamentId = availableTeams?.[0]?.tournamentId ||
                      knockoutData?.tournamentId ||
                      window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchPools();
    setStep(1);
    setError('');
    setSelectedPools([]);
    setPerPoolCounts({});
  }, [tournamentId]);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await poolService.getPoolsByTournament(tournamentId);
      const poolsData = response.data || response || [];
      setPools(poolsData);

      const stats = {};
      const defaultCounts = {};
      poolsData.forEach(pool => {
        const completedMatches = pool.matches?.filter(m => m.status === 'COMPLETED').length || 0;
        const totalMatches = pool.matches?.length || 0;
        const teams = pool.teams?.length || 0;

        stats[pool.id] = {
          teams,
          completedMatches,
          totalMatches,
          isComplete: totalMatches > 0 && completedMatches === totalMatches,
          hasMatches: totalMatches > 0
        };

        // Default per-pool count: half the teams or 4, whichever is smaller
        defaultCounts[pool.id] = Math.min(4, Math.max(1, Math.floor(teams / 2)));
      });
      setPoolStats(stats);
      setPerPoolCounts(defaultCounts);

      const poolsWithTeams = poolsData.filter(pool => (pool.teams?.length || 0) > 0);
      setSelectedPools(poolsWithTeams.map(pool => pool.id));

    } catch (err) {
      console.error('Error fetching pools:', err);
      setError('Failed to load pools');
    } finally {
      setLoading(false);
    }
  };

  const handlePoolToggle = (poolId) => {
    setSelectedPools(prev =>
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  const handlePerPoolCountChange = (poolId, count) => {
    const maxTeams = poolStats[poolId]?.teams || 1;
    const clampedCount = Math.max(1, Math.min(count, maxTeams));
    setPerPoolCounts(prev => ({
      ...prev,
      [poolId]: clampedCount
    }));
  };

  const handleSettingChange = (key, value) => {
    setQualifierSettings(prev => ({
      ...prev,
      [key]: value
    }));

    if (key === 'teamsPerPool' && onTeamsPerPoolChange) {
      onTeamsPerPoolChange(value);
    }
  };

  const getTotalQualifyingTeams = () => {
    if (qualifierSettings.usePerPoolCounts) {
      return selectedPools.reduce((sum, poolId) => sum + (perPoolCounts[poolId] || 0), 0);
    }
    return selectedPools.length * qualifierSettings.teamsPerPool;
  };

  const validateStep1 = () => {
    if (selectedPools.length === 0) {
      setError('Please select at least one pool');
      return false;
    }

    const poolsWithoutTeams = selectedPools.filter(poolId => {
      const stats = poolStats[poolId];
      return (stats?.teams || 0) === 0;
    });

    if (poolsWithoutTeams.length > 0) {
      setError('Selected pools must have teams assigned');
      return false;
    }

    setError('');
    return true;
  };

  const validateStep2 = () => {
    const totalQualifyingTeams = getTotalQualifyingTeams();

    if (totalQualifyingTeams < 2) {
      setError('Need at least 2 qualifying teams for knockout phase');
      return false;
    }

    if (qualifierSettings.pairingStrategy === 'CROSS_POOL' && selectedPools.length < 2) {
      setError('Cross-pool pairing requires at least 2 pools');
      return false;
    }

    if (!qualifierSettings.usePerPoolCounts) {
      if (qualifierSettings.teamsPerPool < 1 || qualifierSettings.teamsPerPool > 10) {
        setError('Teams per pool must be between 1 and 10');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleGenerate = async () => {
    if (!validateStep2()) return;

    try {
      setLoading(true);
      setError('');

      // Build the request matching the new backend format
      const request = {
        selectedPoolIds: selectedPools,
        pairingStrategy: qualifierSettings.pairingStrategy,
        avoidSamePool: qualifierSettings.avoidSamePool
      };

      if (qualifierSettings.usePerPoolCounts) {
        // Per-pool counts: { poolId: count }
        const teamsPerPoolMap = {};
        selectedPools.forEach(poolId => {
          teamsPerPoolMap[poolId] = perPoolCounts[poolId] || 2;
        });
        request.teamsPerPoolMap = teamsPerPoolMap;
      } else {
        request.teamsPerPool = qualifierSettings.teamsPerPool;
      }

      await onGenerate(request);

      handleClose();

    } catch (err) {
      console.error('Error generating qualifiers:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate qualifier matches';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedPools([]);
    setPerPoolCounts({});
    setError('');
    setQualifierSettings({
      teamsPerPool: 4,
      usePerPoolCounts: false,
      matchType: 'QUALIFIER',
      autoSchedule: true,
      courtAssignment: 'AUTO',
      pairingStrategy: 'CROSS_POOL',
      avoidSamePool: true
    });
    onClose();
  };

  const getSelectedPoolsInfo = () => {
    const selectedPoolsData = pools.filter(pool => selectedPools.includes(pool.id));
    const totalTeams = selectedPoolsData.reduce((sum, pool) => sum + (pool.teams?.length || 0), 0);
    const qualifyingTeams = getTotalQualifyingTeams();

    return {
      selectedCount: selectedPools.length,
      totalTeams,
      qualifyingTeams,
      eliminatedTeams: totalTeams - qualifyingTeams,
      expectedMatches: Math.floor(qualifyingTeams / 2)
    };
  };

  const selectedInfo = getSelectedPoolsInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Setup Qualifier Matches
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Generate knockout qualifiers from pool results
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 sm:p-2 rounded-full transition-colors"
            title="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-8 sm:w-16 h-1 transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Select Pools</span>
            <span>Configure Settings</span>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            </div>
          )}

          {/* Step 1: Pool Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Select Pools for Qualifier Generation
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Choose pools with teams. Qualifiers will be generated based on current pool standings.
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm sm:text-base">Loading pools...</p>
                </div>
              ) : pools.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-lg mb-2"><Inbox className="w-5 h-5 mx-auto" /></div>
                  <p className="text-gray-500 text-sm sm:text-base">No pools found. Create pools first.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pools.map((pool) => {
                    const stats = poolStats[pool.id] || {};
                    const isSelected = selectedPools.includes(pool.id);
                    const canSelect = (stats.teams || 0) > 0;

                    return (
                      <div
                        key={pool.id}
                        className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : canSelect
                              ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => canSelect && handlePoolToggle(pool.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => canSelect && handlePoolToggle(pool.id)}
                                disabled={!canSelect}
                                className="mr-2 sm:mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                {pool.name}
                              </h4>
                              {stats.isComplete && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                  <CheckCircle2 className="w-3 h-3 inline mr-1" /> Complete
                                </span>
                              )}
                              {!stats.isComplete && stats.hasMatches && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                  <Circle className="w-3 h-3 inline mr-1" /> In Progress
                                </span>
                              )}
                              {!stats.hasMatches && stats.teams > 0 && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                  <FileText className="w-3 h-3 inline mr-1" /> Ready
                                </span>
                              )}
                              {stats.teams === 0 && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                  <Inbox className="w-3 h-3 inline mr-1" /> No Teams
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span className="font-medium">Teams:</span> {stats.teams || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                <span className="font-medium">Matches:</span> {stats.completedMatches || 0}/{stats.totalMatches || 0}
                              </div>
                              <div className="col-span-2 sm:col-span-1 flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                <span className="font-medium">Status:</span>{' '}
                                <span className={canSelect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                  {canSelect ? 'Available' : 'No Teams'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selection Summary */}
              {selectedPools.length > 0 && (
                <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Selection Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span className="text-blue-700">Selected Pools:</span>
                      <span className="font-medium text-blue-900">{selectedInfo.selectedCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="text-blue-700">Total Teams:</span>
                      <span className="font-medium text-blue-900">{selectedInfo.totalTeams}</span>
                    </div>
                  </div>
                  {selectedPools.some(poolId => {
                    const stats = poolStats[poolId];
                    return stats && !stats.isComplete && stats.hasMatches;
                  }) && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <div className="flex items-center gap-1 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">Note:</span>
                        Some selected pools have incomplete matches. Qualifiers will be based on current standings.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Settings Configuration */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure Qualifier Settings
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Set how many teams from each pool will advance to the knockout phase.
                </p>
              </div>

              {/* Qualification Mode Toggle */}
              <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Qualification Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSettingChange('usePerPoolCounts', false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      !qualifierSettings.usePerPoolCounts
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-1" /> Uniform (same from each pool)
                  </button>
                  <button
                    onClick={() => handleSettingChange('usePerPoolCounts', true)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      qualifierSettings.usePerPoolCounts
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 inline mr-1" /> Per-Pool (customise each pool)
                  </button>
                </div>
              </div>

              {/* Uniform Teams Per Pool Setting */}
              {!qualifierSettings.usePerPoolCounts && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Teams Advancing Per Pool
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleSettingChange('teamsPerPool', num)}
                        className={`px-2 py-2 text-sm font-medium rounded-lg border transition-all ${
                          qualifierSettings.teamsPerPool === num
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-sm'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 flex-shrink-0" />
                    Top {qualifierSettings.teamsPerPool} ranked teams from each pool will advance
                  </p>
                </div>
              )}

              {/* Per-Pool Team Count Setting */}
              {qualifierSettings.usePerPoolCounts && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Teams Advancing Per Pool (Customised)
                  </label>
                  <div className="space-y-3">
                    {selectedPools.map(poolId => {
                      const pool = pools.find(p => p.id === poolId);
                      const stats = poolStats[poolId] || {};
                      const count = perPoolCounts[poolId] || 1;
                      const maxTeams = stats.teams || 1;

                      return (
                        <div key={poolId} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {pool?.name || `Pool ${poolId}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {maxTeams} teams available
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePerPoolCountChange(poolId, count - 1)}
                              disabled={count <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-blue-600 text-lg">{count}</span>
                            <button
                              onClick={() => handlePerPoolCountChange(poolId, count + 1)}
                              disabled={count >= maxTeams}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 flex-shrink-0" />
                    Total qualifying teams: <span className="font-bold text-blue-600">{getTotalQualifyingTeams()}</span>
                  </p>
                </div>
              )}

              {/* Match Pairing Strategy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Match Pairing Strategy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="pairingStrategy"
                      value="CROSS_POOL"
                      checked={qualifierSettings.pairingStrategy === 'CROSS_POOL'}
                      onChange={(e) => handleSettingChange('pairingStrategy', e.target.value)}
                      className="mr-2 sm:mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Shuffle className="w-4 h-4" />
                      <span className="font-medium">Cross-Pool Pairing</span>
                      <span className="text-xs text-gray-500">(Recommended)</span>
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6 sm:ml-9">
                    Teams from different pools face each other. For 3+ pools, uses global ranking with cross-pool swaps.
                  </p>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="pairingStrategy"
                      value="RANKING_BASED"
                      checked={qualifierSettings.pairingStrategy === 'RANKING_BASED'}
                      onChange={(e) => handleSettingChange('pairingStrategy', e.target.value)}
                      className="mr-2 sm:mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="font-medium">Ranking-Based Pairing</span>
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6 sm:ml-9">
                    Best vs worst by global ranking (#1 vs #8, #2 vs #7, etc.)
                  </p>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="pairingStrategy"
                      value="RANDOM"
                      checked={qualifierSettings.pairingStrategy === 'RANDOM'}
                      onChange={(e) => handleSettingChange('pairingStrategy', e.target.value)}
                      className="mr-2 sm:mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Dices className="w-4 h-4" />
                      <span className="font-medium">Random Pairing</span>
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6 sm:ml-9">
                    Completely random matchups among qualifying teams
                  </p>
                </div>
              </div>

              {/* Avoid Same Pool Option */}
              {qualifierSettings.pairingStrategy !== 'CROSS_POOL' && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={qualifierSettings.avoidSamePool}
                      onChange={(e) => handleSettingChange('avoidSamePool', e.target.checked)}
                      className="mr-2 sm:mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Ban className="w-4 h-4" />
                      Avoid same-pool matchups
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6 sm:ml-9 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 flex-shrink-0" />
                    Prevent teams from the same pool playing each other in qualifiers
                  </p>
                </div>
              )}

              {/* Preview Summary */}
              <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 text-sm sm:text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Qualifier Preview
                </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-green-700">Qualifying Teams:</span>
                      <span className="font-medium text-green-900">{selectedInfo.qualifyingTeams}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span className="text-green-700">Eliminated Teams:</span>
                      <span className="font-medium text-green-900">{Math.max(0, selectedInfo.eliminatedTeams)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span className="text-green-700">Expected Matches:</span>
                    <span className="font-medium text-green-900">
                      {selectedInfo.expectedMatches} qualifier matches
                    </span>
                  </div>
                    <div className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      <span className="text-green-700">Pairing:</span>
                    <span className="font-medium text-green-900">
                      {qualifierSettings.pairingStrategy === 'CROSS_POOL' ? 'Cross-Pool' :
                       qualifierSettings.pairingStrategy === 'RANKING_BASED' ? 'Ranking-Based' : 'Random'}
                    </span>
                  </div>
                </div>

                {/* Tournament Flow Preview */}
                <div className="mt-3 p-2 bg-white border border-green-200 rounded text-xs">
                  <div className="font-medium text-green-800 mb-1">Expected Tournament Flow:</div>
                  <div className="text-green-700">
                    {selectedInfo.qualifyingTeams <= 4 ? (
                      <>
                        • {selectedInfo.qualifyingTeams} teams → {selectedInfo.expectedMatches} Qualifiers → {Math.floor(selectedInfo.expectedMatches)} winners
                        <br />• {Math.floor(selectedInfo.expectedMatches)} winners → {Math.floor(selectedInfo.expectedMatches / 2)} Semifinals → Final
                      </>
                    ) : selectedInfo.qualifyingTeams <= 8 ? (
                      <>
                        • {selectedInfo.qualifyingTeams} teams → {selectedInfo.expectedMatches} Qualifiers → {selectedInfo.expectedMatches} winners
                        <br />• {selectedInfo.expectedMatches} winners → {Math.floor(selectedInfo.expectedMatches / 2)} Semifinals → Final + 3rd Place
                      </>
                    ) : (
                      <>
                        • {selectedInfo.qualifyingTeams} teams → {selectedInfo.expectedMatches} Qualifiers → {selectedInfo.expectedMatches} winners
                        <br />• {selectedInfo.expectedMatches} winners → Quarterfinals → Semifinals → Final + 3rd Place
                      </>
                    )}
                  </div>
                </div>

                {/* Per-pool breakdown when using custom counts */}
                {qualifierSettings.usePerPoolCounts && (
                  <div className="mt-3 p-2 bg-white border border-green-200 rounded text-xs">
                    <div className="font-medium text-green-800 mb-1">Per-Pool Breakdown:</div>
                    <div className="text-green-700 space-y-1">
                      {selectedPools.map(poolId => {
                        const pool = pools.find(p => p.id === poolId);
                        const count = perPoolCounts[poolId] || 0;
                        return (
                          <div key={poolId} className="flex justify-between">
                            <span>{pool?.name || `Pool ${poolId}`}:</span>
                            <span className="font-medium">Top {count} teams qualify</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 p-3 sm:p-4 lg:p-6 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="order-2 sm:order-1 px-4 py-2 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                ← Back
              </button>
            )}

            <div className="flex-1"></div>

            <button
              onClick={handleClose}
              className="order-3 sm:order-2 px-4 py-2 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>

            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={selectedPools.length === 0}
                className="order-1 sm:order-3 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="order-1 sm:order-3 px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Generate {selectedInfo.expectedMatches} Qualifiers</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifierSetupModal;
