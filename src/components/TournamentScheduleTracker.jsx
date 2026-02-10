import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle, TrendingUp, TrendingDown, Target, Calendar, Timer } from 'lucide-react';
import { tournamentService } from '../services/tournamentService';
import { useQuery } from '@tanstack/react-query';

/**
 * Tournament Schedule Tracker - Mobile-optimized
 * Shows court time remaining and schedule status
 */
const TournamentScheduleTracker = ({ tournamentId }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['tournament-schedule', tournamentId],
    queryFn: async () => {
      const response = await tournamentService.getScheduleStatus(tournamentId);
      return response.data;
    },
    enabled: !!tournamentId,
    refetchInterval: 30000, // Reduced polling frequency (30s instead of 10s)
    retry: 1, // Only retry once on failure
    retryDelay: 5000,
    staleTime: 15000, // Consider data fresh for 15s
    meta: { suppressErrorToast: true }, // Don't show error toasts
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (Math.floor(Date.now() / 1000) % 30 === 0) {
        refetch();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading || !status) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-4 bg-blue-200 rounded w-24 sm:w-32"></div>
            <div className="h-4 bg-blue-200 rounded w-20 sm:w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (minutes) => {
    if (minutes < 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTimeShort = (minutes) => {
    if (minutes < 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? `${mins}m` : ''}`;
  };

  const getCourtTimeRemaining = () => {
    if (!status?.courtBookingEndTime) return null;
    const endTime = new Date(status.courtBookingEndTime);
    const remaining = Math.floor((endTime - currentTime) / 1000 / 60);
    return remaining > 0 ? remaining : 0;
  };

  const getScheduleStatus = () => {
    if (!status?.tournamentStarted) return null;
    const matchesDiff = status.completedMatches - status.expectedCompletedMatches;
    
    if (matchesDiff > 1) {
      return { text: 'Early', color: 'text-green-600 bg-green-50 border-green-200', icon: <TrendingUp className="w-4 h-4" /> };
    } else if (matchesDiff < -1) {
      return { text: 'Behind', color: 'text-red-600 bg-red-50 border-red-200', icon: <TrendingDown className="w-4 h-4" /> };
    } else {
      return { text: 'On track', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Target className="w-4 h-4" /> };
    }
  };

  const getStatusText = () => {
    if (!status?.tournamentStarted) {
      if (status?.tournamentStartTime) {
        const startTime = new Date(status.tournamentStartTime);
        const timeUntilStart = Math.floor((startTime - currentTime) / 1000 / 60);
        if (timeUntilStart > 0) {
          return `Starts in ${formatTime(timeUntilStart)}`;
        }
      }
      return 'Not started';
    }
    const scheduleStatus = getScheduleStatus();
    return scheduleStatus ? scheduleStatus.text : 'On track';
  };

  const courtTimeRemaining = getCourtTimeRemaining();
  const scheduleStatus = getScheduleStatus();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3">
        {/* Mobile: Stacked Layout */}
        <div className="block sm:hidden space-y-2">
          {/* Court Time - Most Important */}
          {status?.tournamentStarted && courtTimeRemaining !== null && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600 font-medium">Court Time Left</div>
                  <div className={`text-lg font-bold font-mono ${
                    courtTimeRemaining < 60 ? 'text-red-600' : 
                    courtTimeRemaining < 120 ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    {formatTimeShort(courtTimeRemaining)}
                  </div>
                </div>
              </div>
              {status?.courtBookingEndTime && (
                <div className="text-xs text-gray-500 text-right">
                  Until {new Date(status.courtBookingEndTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
              )}
            </div>
          )}

          {/* Schedule Status */}
          {status?.tournamentStarted && scheduleStatus && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${scheduleStatus.color}`}>
              {scheduleStatus.icon}
              <span className="text-sm font-semibold">{scheduleStatus.text}</span>
            </div>
          )}

          {/* Progress Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold">
                <span className="text-green-600">{status.completedMatches}</span>
                <span className="text-gray-500">/{status.totalMatches}</span>
              </span>
            </div>
            {status.ongoingMatches > 0 && (
              <div className="flex items-center gap-1.5">
                <Circle className="w-3 h-3 text-blue-600 animate-pulse" />
                <span className="text-xs text-blue-600 font-medium">{status.ongoingMatches} live</span>
              </div>
            )}
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                style={{ width: `${status.completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 min-w-[35px]">{status.completionPercentage}%</span>
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 lg:gap-6">
          {/* Left: Court Time & Schedule Status */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-6">
            {status?.tournamentStarted && courtTimeRemaining !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-blue-300 shadow-sm">
                <Timer className="w-4 h-4 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 leading-tight">Court Time Left</span>
                  <span className={`text-sm font-bold font-mono ${
                    courtTimeRemaining < 60 ? 'text-red-600' : 
                    courtTimeRemaining < 120 ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    {formatTimeShort(courtTimeRemaining)}
                  </span>
                </div>
                {status?.courtBookingEndTime && (
                  <div className="text-xs text-gray-500 ml-2">
                    (until {new Date(status.courtBookingEndTime).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })})
                  </div>
                )}
              </div>
            )}

            {status?.tournamentStarted && scheduleStatus && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${scheduleStatus.color}`}>
                {scheduleStatus.icon}
                <span className="text-sm font-semibold">{scheduleStatus.text}</span>
              </div>
            )}
            
            {!status?.tournamentStarted && status?.tournamentStartTime && (
              <div className="flex items-center gap-2 text-blue-700">
                <Calendar className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">
                  {new Date(status.tournamentStartTime).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Right: Progress and Stats */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-6">
            {status?.tournamentStarted && status?.expectedCompletedMatches !== undefined && (
              <div className="flex items-center gap-2 px-2 py-1 bg-white/60 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Exp:</span>{' '}
                  <span className={status.completedMatches >= status.expectedCompletedMatches ? 'text-green-600' : 'text-red-600'}>
                    {status.expectedCompletedMatches}
                  </span>
                  {' / '}
                  <span className="font-semibold">Act:</span>{' '}
                  <span className="font-bold text-blue-600">{status.completedMatches}</span>
                  {(() => {
                    const diff = status.completedMatches - status.expectedCompletedMatches;
                    return diff !== 0 ? (
                      <span className={`ml-1 ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({diff > 0 ? '+' : ''}{diff})
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  <span className="font-bold text-green-600">{status.completedMatches}</span>
                  <span className="text-gray-500">/{status.totalMatches}</span>
                </span>
              </div>
              {status.ongoingMatches > 0 && (
                <div className="flex items-center gap-1.5">
                  <Circle className="w-3 h-3 text-blue-600 animate-pulse" />
                  <span className="text-xs text-blue-600 font-medium">{status.ongoingMatches} live</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 min-w-[120px] lg:min-w-[150px]">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                  style={{ width: `${status.completionPercentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 min-w-[35px]">{status.completionPercentage}%</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-600">
              <Target className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">Target: </span>
                {status.totalMatches}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentScheduleTracker;
