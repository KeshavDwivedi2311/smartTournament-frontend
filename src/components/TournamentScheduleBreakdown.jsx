import React, { useMemo } from 'react';
import { Clock, Calendar, Target, TrendingUp } from 'lucide-react';

/**
 * Beautiful breakdown of tournament schedule based on configuration
 */
const TournamentScheduleBreakdown = ({ config, courtSchedule, tournamentId }) => {
  // Calculate schedule breakdown
  const scheduleBreakdown = useMemo(() => {
    if (!config || !courtSchedule || courtSchedule.length === 0) {
      return null;
    }

    // Parse court schedule
    const schedule = courtSchedule;
    const matchDuration = config.estimatedMatchDurationMinutes || 15;
    const breakTime = config.breakTimeMinutes || 2;
    const totalMatchTime = matchDuration + breakTime; // Time per match including break

    // Calculate matches per hour based on courts
    const hourlyBreakdown = schedule.map((slot, index) => {
      const startTime = slot.startTime || '09:00';
      const courts = slot.courts || 1;
      
      // Calculate how many matches can be played in this hour
      const matchesPerHour = Math.floor(60 / totalMatchTime) * courts;
      
      return {
        time: startTime,
        courts: courts,
        matchesPerHour: matchesPerHour,
        totalMatches: matchesPerHour, // Assuming 1 hour per slot
        index: index
      };
    });

    // Calculate total time
    const totalHours = schedule.length;
    const totalCourts = schedule.reduce((sum, slot) => sum + (slot.courts || 1), 0);
    const avgCourts = totalCourts / schedule.length;
    const totalMatchesPossible = Math.floor((totalHours * 60) / totalMatchTime) * avgCourts;

    // Estimate completion time
    const startTime = config.tournamentStartTime 
      ? new Date(config.tournamentStartTime)
      : new Date(); // Use current time if not set
    
    // Calculate when tournament should end (rough estimate)
    const estimatedEndTime = new Date(startTime);
    estimatedEndTime.setHours(estimatedEndTime.getHours() + totalHours);

    return {
      hourlyBreakdown,
      totalHours,
      totalCourts,
      avgCourts,
      totalMatchesPossible,
      matchDuration,
      breakTime,
      totalMatchTime,
      startTime,
      estimatedEndTime
    };
  }, [config, courtSchedule]);

  if (!scheduleBreakdown) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">Please configure court schedule to see breakdown</p>
      </div>
    );
  }

  const formatTime = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Tournament Schedule Breakdown</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Match Duration</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {scheduleBreakdown.matchDuration} min
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">Total Hours</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {scheduleBreakdown.totalHours}h
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Courts</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {scheduleBreakdown.avgCourts.toFixed(1)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Max Matches</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            ~{Math.round(scheduleBreakdown.totalMatchesPossible)}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Hour-by-Hour Schedule</h4>
        <div className="space-y-2">
          {scheduleBreakdown.hourlyBreakdown.map((hour, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center">
                    <div className="text-xs text-gray-500">Time</div>
                    <div className="font-bold text-gray-800">{hour.time}</div>
                  </div>
                  <div className="w-16 text-center">
                    <div className="text-xs text-gray-500">Courts</div>
                    <div className="font-bold text-blue-600">{hour.courts}</div>
                  </div>
                  <div className="w-20 text-center">
                    <div className="text-xs text-gray-500">Matches</div>
                    <div className="font-bold text-green-600">~{hour.matchesPerHour}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDuration(scheduleBreakdown.matchDuration)} per match
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Completion */}
      {config.tournamentStartTime && (
        <div className="bg-white rounded-lg p-4 border-t-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Estimated Completion</div>
              <div className="font-bold text-gray-800">
                {formatTime(scheduleBreakdown.estimatedEndTime)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Start Time</div>
              <div className="font-bold text-blue-600">
                {formatTime(scheduleBreakdown.startTime)}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Total Duration:</span>{' '}
              {formatDuration(scheduleBreakdown.totalHours * 60)}
            </div>
          </div>
        </div>
      )}

      {!config.tournamentStartTime && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            ⚠️ Set tournament start time to see estimated completion
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentScheduleBreakdown;
