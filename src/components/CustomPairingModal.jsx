import React, { useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';
import { X, Plus, Trash2, Target, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CustomPairingModal = ({ 
  tournamentId, 
  isOpen, 
  onClose, 
  onSuccess,
  matchType, // 'QUALIFIER' or 'SEMIFINAL'
  availableTeams = [] // Teams that can be paired
}) => {
  const [pairings, setPairings] = useState([{ team1Id: '', team2Id: '', matchName: '', matchOrder: 1 }]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (isOpen && availableTeams.length > 0) {
      setTeams(availableTeams);
    } else if (isOpen) {
      loadTeams();
    }
  }, [isOpen, availableTeams]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      // Load qualified teams for qualifiers, or qualifier winners for semifinals
      if (matchType === 'QUALIFIER') {
        const response = await tournamentService.getQualifiedTeams(tournamentId, 4);
        setTeams(response || []);
      } else if (matchType === 'SEMIFINAL') {
        // Get qualifier winners
        const knockoutData = await tournamentService.getKnockoutMatches(tournamentId);
        const qualifierWinners = knockoutData.qualifiers
          .filter(m => m.status === 'COMPLETED' && m.winnerId)
          .map(m => ({
            id: m.winnerId,
            name: m.winnerName,
            poolName: m.poolName
          }));
        setTeams(qualifierWinners);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const addPairing = () => {
    setPairings([...pairings, { 
      team1Id: '', 
      team2Id: '', 
      matchName: '', 
      matchOrder: pairings.length + 1 
    }]);
  };

  const removePairing = (index) => {
    const newPairings = pairings.filter((_, i) => i !== index);
    // Update match orders
    newPairings.forEach((p, i) => {
      p.matchOrder = i + 1;
    });
    setPairings(newPairings);
  };

  const updatePairing = (index, field, value) => {
    const newPairings = [...pairings];
    newPairings[index][field] = value;
    
    // Auto-generate match name if empty
    if (field === 'team1Id' || field === 'team2Id') {
      const team1 = teams.find(t => t.id === parseInt(newPairings[index].team1Id));
      const team2 = teams.find(t => t.id === parseInt(newPairings[index].team2Id));
      if (team1 && team2 && !newPairings[index].matchName) {
        newPairings[index].matchName = `${matchType === 'QUALIFIER' ? 'Qualifier' : 'Semifinal'} ${newPairings[index].matchOrder}`;
      }
    }
    
    setPairings(newPairings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    for (let i = 0; i < pairings.length; i++) {
      const p = pairings[i];
      if (!p.team1Id || !p.team2Id) {
        toast.error(`Pairing ${i + 1}: Please select both teams`);
        return;
      }
      if (p.team1Id === p.team2Id) {
        toast.error(`Pairing ${i + 1}: Teams must be different`);
        return;
      }
    }

    // Check for duplicate teams
    const allTeamIds = pairings.flatMap(p => [parseInt(p.team1Id), parseInt(p.team2Id)]);
    const uniqueTeamIds = new Set(allTeamIds);
    if (allTeamIds.length !== uniqueTeamIds.size) {
      toast.error('Each team can only be paired once');
      return;
    }

    try {
      setLoading(true);
      const request = {
        pairings: pairings.map(p => ({
          team1Id: parseInt(p.team1Id),
          team2Id: parseInt(p.team2Id),
          matchName: p.matchName || `${matchType === 'QUALIFIER' ? 'Qualifier' : 'Semifinal'} ${p.matchOrder}`,
          matchOrder: p.matchOrder
        })),
        matchType: matchType
      };

      if (matchType === 'QUALIFIER') {
        await tournamentService.createCustomQualifierPairings(tournamentId, request);
      } else {
        await tournamentService.createCustomSemifinalPairings(tournamentId, request);
      }

      toast.success(`Custom ${matchType.toLowerCase()} pairings created successfully!`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating custom pairings:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create pairings';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPairings([{ team1Id: '', team2Id: '', matchName: '', matchOrder: 1 }]);
    onClose();
  };

  if (!isOpen) return null;

  const getTeamInfo = (teamId) => {
    return teams.find(t => t.id === parseInt(teamId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              {matchType === 'QUALIFIER' ? <Target className="w-5 h-5 sm:w-6 sm:h-6" /> : <Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
              Custom {matchType === 'QUALIFIER' ? 'Qualifier' : 'Semifinal'} Pairings
            </h3>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            Manually pair teams for {matchType === 'QUALIFIER' ? 'qualifier' : 'semifinal'} matches. 
            Each team can only be paired once.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading teams...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No teams available for pairing</p>
              <p className="text-sm text-gray-500">
                {matchType === 'QUALIFIER' 
                  ? 'Make sure teams have completed pool matches and qualified.'
                  : 'Make sure qualifier matches are completed.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {pairings.map((pairing, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">
                      Pairing {index + 1}
                    </h4>
                    {pairings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePairing(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Team 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team 1
                      </label>
                      <select
                        value={pairing.team1Id}
                        onChange={(e) => updatePairing(index, 'team1Id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Team 1</option>
                        {teams
                          .filter(t => t.id !== parseInt(pairing.team2Id))
                          .map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name} {team.poolName ? `(${team.poolName})` : ''}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Team 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team 2
                      </label>
                      <select
                        value={pairing.team2Id}
                        onChange={(e) => updatePairing(index, 'team2Id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Team 2</option>
                        {teams
                          .filter(t => t.id !== parseInt(pairing.team1Id))
                          .map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name} {team.poolName ? `(${team.poolName})` : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Match Preview */}
                  {pairing.team1Id && pairing.team2Id && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center flex-1">
                          <div className="font-semibold text-blue-800">
                            {getTeamInfo(pairing.team1Id)?.name}
                          </div>
                          {getTeamInfo(pairing.team1Id)?.poolName && (
                            <div className="text-xs text-blue-600">{getTeamInfo(pairing.team1Id).poolName}</div>
                          )}
                        </div>
                        <div className="text-xl font-bold text-blue-600">VS</div>
                        <div className="text-center flex-1">
                          <div className="font-semibold text-blue-800">
                            {getTeamInfo(pairing.team2Id)?.name}
                          </div>
                          {getTeamInfo(pairing.team2Id)?.poolName && (
                            <div className="text-xs text-blue-600">{getTeamInfo(pairing.team2Id).poolName}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Match Name */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Match Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={pairing.matchName}
                      onChange={(e) => updatePairing(index, 'matchName', e.target.value)}
                      placeholder={`${matchType === 'QUALIFIER' ? 'Qualifier' : 'Semifinal'} ${pairing.matchOrder}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}

              {/* Add Pairing Button */}
              <button
                type="button"
                onClick={addPairing}
                className="w-full sm:w-auto px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Pairing
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        {teams.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || pairings.some(p => !p.team1Id || !p.team2Id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    {matchType === 'QUALIFIER' ? <Target className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    Create Pairings
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

export default CustomPairingModal;
