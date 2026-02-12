import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * MatchTimer component displays elapsed time for ongoing matches
 * and duration for completed matches
 */
const MatchTimer = ({ match, targetPoints = null }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!match) return;

    const status = match.status || 'SCHEDULED';
    const elapsedSeconds = match.elapsedSeconds || 0;

    if (status === 'ONGOING') {
      setIsRunning(true);
      // Use backend-calculated elapsedSeconds as initial value to avoid timezone mismatch
      // (server runs in UTC, browser runs in local timezone like IST)
      setElapsedTime(elapsedSeconds);

      // Increment locally every second
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (status === 'COMPLETED' && elapsedSeconds > 0) {
      setIsRunning(false);
      setElapsedTime(elapsedSeconds);
    } else {
      setIsRunning(false);
      setElapsedTime(0);
    }
  }, [match]);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!isRunning) return 'text-gray-500';
    
    const minutes = Math.floor(elapsedTime / 60);
    // Green for first 20 minutes, yellow for 20-40, red for 40+
    if (minutes < 20) return 'text-green-600';
    if (minutes < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!match || match.status !== 'ONGOING' && match.status !== 'COMPLETED') {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs sm:text-sm">
      <Clock className={`w-3 h-3 sm:w-4 sm:h-4 ${getTimeColor()}`} />
      <span className={`font-mono font-medium ${getTimeColor()}`}>
        {formatTime(elapsedTime)}
      </span>
      {targetPoints && match.status === 'ONGOING' && (
        <span className="text-gray-400 text-xs">
          (Target: {targetPoints} pts)
        </span>
      )}
    </div>
  );
};

export default MatchTimer;
