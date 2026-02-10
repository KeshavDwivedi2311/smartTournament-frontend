import React, { useState, useEffect } from 'react';
import { poolService } from '../services/poolService';
import { tournamentService } from '../services/tournamentService';

const TournamentResults = ({ tournamentId }) => {
  const [pools, setPools] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [poolStandingsMap, setPoolStandingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pools');

  useEffect(() => {
    if (tournamentId) {
      loadAllData();
    }
  }, [tournamentId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading data for tournament:', tournamentId);

      // Load pools data
      const poolsResponse = await poolService.getPoolsByTournament(tournamentId);
      const poolsData = poolsResponse.data || poolsResponse || [];

      console.log('Loaded pools:', poolsData);
      setPools(poolsData);

      // Try to load matches from different sources
      let matchesData = [];
      let knockoutMatchesList = [];

      try {
        // Try to get ongoing matches
        const ongoingMatches = await tournamentService.getOngoingMatches(tournamentId);
        console.log('Ongoing matches:', ongoingMatches);
        matchesData = [...matchesData, ...(ongoingMatches || [])];
      } catch (error) {
        console.log('No ongoing matches or endpoint not available');
      }

      try {
        // Try to get completed matches
        const completedMatches = await tournamentService.getCompletedMatches(tournamentId);
        console.log('Completed matches:', completedMatches);
        matchesData = [...matchesData, ...(completedMatches || [])];
      } catch (error) {
        console.log('No completed matches or endpoint not available');
      }

      try {
        // Try to get knockout matches - this is the key fix
        const knockoutResponse = await tournamentService.getKnockoutMatches(tournamentId);
        console.log('Raw knockout response:', knockoutResponse);

        if (knockoutResponse) {
          // Handle different possible response structures
          if (Array.isArray(knockoutResponse)) {
            // If it's directly an array of matches
            knockoutMatchesList = knockoutResponse;
          } else if (knockoutResponse.data && Array.isArray(knockoutResponse.data)) {
            // If it's wrapped in a data property
            knockoutMatchesList = knockoutResponse.data;
          } else if (typeof knockoutResponse === 'object') {
            // If it's an object with different match types
            const allKnockoutMatches = [
              ...(knockoutResponse.qualifiers || []),
              ...(knockoutResponse.quarterfinals || []),
              ...(knockoutResponse.semifinals || []),
              ...(knockoutResponse.finals || [])
            ];
            knockoutMatchesList = allKnockoutMatches;
          }
        }

        console.log('Processed knockout matches:', knockoutMatchesList);
        setKnockoutMatches(knockoutMatchesList);
        matchesData = [...matchesData, ...knockoutMatchesList];
      } catch (error) {
        console.log('No knockout matches or endpoint not available:', error);
      }

      console.log('All matches loaded:', matchesData);
      setAllMatches(matchesData);

      // Load standings from backend API for each pool
      const standingsMap = {};
      for (const pool of poolsData) {
        try {
          const standings = await poolService.getPoolStandings(pool.id);
          standingsMap[pool.id] = Array.isArray(standings) ? standings : [];
        } catch (error) {
          console.error(`Error loading standings for pool ${pool.id}:`, error);
          standingsMap[pool.id] = [];
        }
      }
      setPoolStandingsMap(standingsMap);

    } catch (error) {
      console.error('Error loading tournament data:', error);
      setError('Failed to load tournament data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = (team, poolMatches) => {
    // Filter matches for this specific team
    const teamMatches = poolMatches.filter(match =>
      (match.team1Id === team.id || match.team2Id === team.id) &&
      (match.type === 'POOL' || !match.type) // Only pool matches
    );

    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalPointsFor = 0;
    let totalPointsAgainst = 0;
    let completedMatches = 0;

    teamMatches.forEach(match => {
      if (match.status === 'COMPLETED' &&
          match.team1Score !== null &&
          match.team2Score !== null) {

        completedMatches++;
        const isTeam1 = match.team1Id === team.id;
        const teamScore = isTeam1 ? match.team1Score : match.team2Score;
        const opponentScore = isTeam1 ? match.team2Score : match.team1Score;

        totalPointsFor += teamScore;
        totalPointsAgainst += opponentScore;

        if (teamScore > opponentScore) {
          wins++;
        } else if (teamScore < opponentScore) {
          losses++;
        } else {
          draws++;
        }
      }
    });

    const winPercentage = completedMatches > 0 ? (wins / completedMatches * 100) : 0;
    const pointsDifference = totalPointsFor - totalPointsAgainst;
    const pointsRatio = totalPointsAgainst > 0 ? (totalPointsFor / totalPointsAgainst) : totalPointsFor;

    // Points system: 3 for win, 1 for draw, 0 for loss
    const points = wins * 3 + draws * 1;

    return {
      wins,
      losses,
      draws,
      completedMatches,
      totalMatches: teamMatches.length,
      winPercentage,
      totalPointsFor,
      totalPointsAgainst,
      pointsDifference,
      pointsRatio,
      points
    };
  };

  const getPoolStandings = (pool) => {
    // Use backend standings if available (preferred - accurate and up-to-date)
    if (poolStandingsMap[pool.id] && poolStandingsMap[pool.id].length > 0) {
      // Convert TeamStandingDTO format to match component expectations
      return poolStandingsMap[pool.id].map(standing => ({
        id: standing.teamId,
        name: standing.teamName,
        stats: {
          points: standing.tournamentPoints || 0,
          wins: standing.wins || 0,
          losses: standing.losses || 0,
          draws: 0, // Badminton doesn't have draws
          totalPointsFor: standing.pointsScored || 0,
          totalPointsAgainst: standing.pointsConceded || 0,
          pointsDifference: standing.pointDifference || 0,
          pointsRatio: standing.netRatio || 0,
          winPercentage: standing.matchesPlayed > 0 ? (standing.wins / standing.matchesPlayed * 100) : 0,
          completedMatches: standing.matchesPlayed || 0
        },
        position: standing.position || 0
      }));
    }

    // Fallback: manual calculation (for backward compatibility if API fails)
    if (!pool.teams || pool.teams.length === 0) {
      return [];
    }

    const teamsWithStats = pool.teams.map(team => ({
      ...team,
      stats: calculateTeamStats(team, allMatches)
    }));

    // Sort by: points, then win percentage, then points difference, then points ratio
    return teamsWithStats.sort((a, b) => {
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
      if (b.stats.winPercentage !== a.stats.winPercentage) return b.stats.winPercentage - a.stats.winPercentage;
      if (b.stats.pointsDifference !== a.stats.pointsDifference) return b.stats.pointsDifference - a.stats.pointsDifference;
      return b.stats.pointsRatio - a.stats.pointsRatio;
    });
  };

  const getQualifiedTeams = () => {
    const qualifiedTeams = [];

    pools.forEach(pool => {
      const standings = getPoolStandings(pool);
      // Top 2 teams from each pool qualify (assuming 4 teams per pool)
      const qualified = standings.slice(0, 2);
      qualifiedTeams.push(...qualified.map(team => ({
        ...team,
        poolName: pool.name,
        poolRank: standings.indexOf(team) + 1
      })));
    });

    return qualifiedTeams;
  };

  const PoolStandingsTable = ({ pool }) => {
    const standings = getPoolStandings(pool);

    if (standings.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">{pool.name}</h3>
          <p className="text-gray-500 text-sm sm:text-base">No teams in this pool</p>
        </div>
      );
    }

    // Check if pool has exactly 4 teams
    const hasCorrectTeamCount = standings.length === 4;

    return (
      <div className="bg-white rounded-lg shadow-md mb-4 sm:mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 sm:p-4">
          <h3 className="text-lg sm:text-xl font-bold">{pool.name}</h3>
          <p className="text-blue-100 text-xs sm:text-sm">{standings.length} teams</p>
        </div>

        {/* Mobile View - Cards */}
        <div className="sm:hidden">
          {standings.map((team, index) => (
            <div key={team.id} className={`p-4 border-b border-gray-200 ${
              index === 0 ? 'bg-yellow-50' : 
              index === 1 ? 'bg-green-50' : 
              'bg-white'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-green-500 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.stats.points} pts</div>
                  </div>
                </div>
                {(index === 0 || index === 1) && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Qualified
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">W-L-D</div>
                  <div className="font-medium">{team.stats.wins}-{team.stats.losses}-{team.stats.draws}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Points</div>
                  <div className="font-medium">{team.stats.totalPointsFor}-{team.stats.totalPointsAgainst}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Diff</div>
                  <div className={`font-medium ${team.stats.pointsDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {team.stats.pointsDifference >= 0 ? '+' : ''}{team.stats.pointsDifference}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PF</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PA</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Diff</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Win%</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((team, index) => (
                <tr key={team.id} className={`${
                  index === 0 ? 'bg-yellow-50' : 
                  index === 1 ? 'bg-green-50' : 
                  'hover:bg-gray-50'
                }`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-green-500 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{team.name}</div>
                        {(index === 0 || index === 1) && (
                          <div className="text-xs text-green-600">✓ Qualified</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                    {team.stats.points}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                    {team.stats.wins}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                    {team.stats.losses}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-yellow-600 font-medium">
                    {team.stats.draws}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {team.stats.totalPointsFor}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {team.stats.totalPointsAgainst}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <span className={team.stats.pointsDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {team.stats.pointsDifference >= 0 ? '+' : ''}{team.stats.pointsDifference}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {team.stats.winPercentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const KnockoutBracket = () => {
    const qualifiedTeams = getQualifiedTeams();

    // Filter matches by type - be more flexible with the type checking
    const semifinals = knockoutMatches.filter(match =>
      match.type === 'SEMIFINAL' ||
      match.type === 'SEMI_FINAL' ||
      match.matchType === 'SEMIFINAL' ||
      match.round === 'SEMIFINAL' ||
      (match.name && match.name.toLowerCase().includes('semifinal'))
    );

    const finals = knockoutMatches.filter(match =>
      match.type === 'FINAL' ||
      match.matchType === 'FINAL' ||
      match.round === 'FINAL' ||
      (match.name && match.name.toLowerCase().includes('final'))
    );

    const quarterfinals = knockoutMatches.filter(match =>
      match.type === 'QUARTERFINAL' ||
      match.type === 'QUARTER_FINAL' ||
      match.matchType === 'QUARTERFINAL' ||
      match.round === 'QUARTERFINAL' ||
      (match.name && match.name.toLowerCase().includes('quarter'))
    );

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Qualified Teams */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Qualified Teams ({qualifiedTeams.length})</h3>
          {qualifiedTeams.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">No teams qualified yet. Complete pool matches first.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {qualifiedTeams.map((team, index) => (
                <div key={team.id} className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="font-medium text-green-800 text-sm sm:text-base truncate">{team.name}</div>
                  <div className="text-xs sm:text-sm text-green-600 truncate">From {team.poolName}</div>
                  <div className="text-xs text-green-500">Rank #{team.poolRank}</div>
                  <div className="text-xs text-green-500">{team.stats.points} pts</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Knockout Matches (for debugging) */}
        {knockoutMatches.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">All Knockout Matches ({knockoutMatches.length})</h3>
            <div className="space-y-3">
              {knockoutMatches.map((match, index) => (
                <div key={match.id || index} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2 sm:gap-0">
                    <div className="text-sm font-medium">
                      {match.name || match.type || match.matchType || match.round || `Match ${index + 1}`}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs self-start sm:self-auto ${
                      match.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      match.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status || 'SCHEDULED'}
                    </div>
                  </div>
                  <div className="text-sm sm:text-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-0">
                      <span className={`truncate ${match.team1Score > match.team2Score ? 'font-bold text-green-600' : ''}`}>
                        {match.team1?.name || match.team1Name || 'TBD'}
                      </span>
                      {match.status === 'COMPLETED' && match.team1Score !== null && match.team2Score !== null ? (
                        <span className="mx-0 sm:mx-2 text-gray-500 text-center">
                          {match.team1Score} - {match.team2Score}
                        </span>
                      ) : (
                        <span className="mx-0 sm:mx-2 text-gray-500 text-center"> vs </span>
                      )}
                      <span className={`truncate ${match.team2Score > match.team1Score ? 'font-bold text-green-600' : ''}`}>
                        {match.team2?.name || match.team2Name || 'TBD'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 break-all">
                    Type: {match.type || match.matchType || match.round || 'Unknown'} |
                    ID: {match.id} |
                    Status: {match.status || 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quarterfinals */}
        {quarterfinals.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Quarterfinals</h3>
            <div className="space-y-3 sm:space-y-4">
              {quarterfinals.map((match, index) => (
                <div key={match.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div className="text-sm font-medium">Quarterfinal {index + 1}</div>
                    <div className={`px-2 py-1 rounded text-xs self-start sm:self-auto ${
                      match.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      match.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm sm:text-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-0">
                        <span className={`truncate ${match.team1Score > match.team2Score ? 'font-bold text-green-600' : ''}`}>
                          {match.team1?.name || match.team1Name || 'TBD'}
                        </span>
                        {match.status === 'COMPLETED' && (
                          <span className="mx-0 sm:mx-2 text-gray-500 text-center">
                            {match.team1Score} - {match.team2Score}
                          </span>
                        )}
                        <span className={`truncate ${match.team2Score > match.team1Score ? 'font-bold text-green-600' : ''}`}>
                          {match.team2?.name || match.team2Name || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Semifinals */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Semifinals</h3>
          {semifinals.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">Semifinals not yet scheduled</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {semifinals.map((match, index) => (
                <div key={match.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div className="text-sm font-medium">Semifinal {index + 1}</div>
                    <div className={`px-2 py-1 rounded text-xs self-start sm:self-auto ${
                      match.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      match.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm sm:text-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-0">
                        <span className={`truncate ${match.team1Score > match.team2Score ? 'font-bold text-green-600' : ''}`}>
                          {match.team1?.name || match.team1Name || 'TBD'}
                        </span>
                        {match.status === 'COMPLETED' && (
                          <span className="mx-0 sm:mx-2 text-gray-500 text-center">
                            {match.team1Score} - {match.team2Score}
                          </span>
                        )}
                        <span className={`truncate ${match.team2Score > match.team1Score ? 'font-bold text-green-600' : ''}`}>
                          {match.team2?.name || match.team2Name || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finals */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Final</h3>
          {finals.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">Final not yet scheduled</p>
          ) : (
            finals.map((match) => (
              <div key={match.id} className="border-2 border-yellow-300 rounded-lg p-4 sm:p-6 bg-yellow-50">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold mb-4">🏆 FINAL 🏆</div>
                  <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div className={`text-lg sm:text-xl truncate ${match.team1Score > match.team2Score ? 'font-bold text-green-600' : ''}`}>
                      {match.team1?.name || match.team1Name || 'TBD'}
                    </div>
                    {match.status === 'COMPLETED' ? (
                      <div className="text-xl sm:text-2xl font-bold text-gray-700">
                        {match.team1Score} - {match.team2Score}
                      </div>
                    ) : (
                      <div className="text-lg sm:text-xl text-gray-500">vs</div>
                    )}
                    <div className={`text-lg sm:text-xl truncate ${match.team2Score > match.team1Score ? 'font-bold text-green-600' : ''}`}>
                      {match.team2?.name || match.team2Name || 'TBD'}
                    </div>
                  </div>
                  {match.status === 'COMPLETED' && (
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl">🏆</div>
                      <div className="text-lg sm:text-xl font-bold text-yellow-600 truncate">
                        Champion: {match.team1Score > match.team2Score ?
                          (match.team1?.name || match.team1Name) :
                          (match.team2?.name || match.team2Name)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-sm sm:text-base">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
        <div className="text-red-600 text-base sm:text-lg font-medium mb-2">Error Loading Results</div>
        <p className="text-red-500 mb-4 text-sm sm:text-base break-words">{error}</p>
        <button
          onClick={loadAllData}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">📊 Tournament Results & Standings</h2>
        <p className="text-blue-100 text-sm sm:text-base">Live standings based on match results</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('pools')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            activeTab === 'pools'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">Pool Standings</span>
          <span className="sm:hidden">Pools</span>
        </button>
        <button
          onClick={() => setActiveTab('knockout')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            activeTab === 'knockout'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="hidden sm:inline">Knockout Stage</span>
          <span className="sm:hidden">Knockout</span>
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'pools' && (
          <div>
            {pools.map((pool) => (
              <PoolStandingsTable key={pool.id} pool={pool} />
            ))}
            {pools.length === 0 && (
              <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg px-4">
                <div className="text-gray-500 text-base sm:text-lg mb-2">No pools found</div>
                <p className="text-gray-400 text-sm sm:text-base">Create pools and add teams to see standings</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'knockout' && <KnockoutBracket />}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={loadAllData}
          className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium"
        >
          🔄 Refresh Results
        </button>
      </div>
    </div>
  );
};

export default TournamentResults;