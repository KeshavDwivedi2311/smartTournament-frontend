import React, { useState, useEffect } from 'react';
import { X, Settings, Save } from 'lucide-react';
import { tournamentConfigService } from '../services/tournamentConfigService';
import TournamentScheduleBreakdown from './TournamentScheduleBreakdown';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';

const TournamentConfigModal = ({ isOpen, onClose, tournamentId, onConfigUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    poolMatchPoints: 15,
    knockoutMatchPoints: 21,
    breakTimeMinutes: 2,
    estimatedMatchDurationMinutes: 15,
    qualifiersPerPool: 4,
    tournamentStartTime: null,
    courtBookingEndTime: null,
    courtSchedule: []
  });
  const [courtSchedule, setCourtSchedule] = useState([]);

  useEffect(() => {
    if (isOpen && tournamentId) {
      loadConfig();
    }
  }, [isOpen, tournamentId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await tournamentConfigService.getConfig(tournamentId);
      setConfig({
        poolMatchPoints: data.poolMatchPoints || 15,
        knockoutMatchPoints: data.knockoutMatchPoints || 21,
        breakTimeMinutes: data.breakTimeMinutes || 2,
        estimatedMatchDurationMinutes: data.estimatedMatchDurationMinutes || 15,
        qualifiersPerPool: data.qualifiersPerPool || 4,
        tournamentStartTime: data.tournamentStartTime || null,
        courtBookingEndTime: data.courtBookingEndTime || null,
        courtSchedule: data.courtSchedule || ''
      });
      
      // Parse court schedule
      const schedule = tournamentConfigService.parseCourtSchedule(data.courtSchedule);
      setCourtSchedule(schedule.length > 0 ? schedule : [
        { startTime: '09:00', courts: 4 },
        { startTime: '10:00', courts: 4 },
        { startTime: '11:00', courts: 3 },
        { startTime: '12:00', courts: 2 }
      ]);
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const configToSave = {
        ...config,
        courtSchedule: tournamentConfigService.formatCourtSchedule(courtSchedule),
        // Ensure tournamentStartTime is properly formatted (already in ISO format from onChange)
        tournamentStartTime: config.tournamentStartTime || null
      };
      await tournamentConfigService.updateConfig(tournamentId, configToSave);
      toast.success('Configuration saved successfully');
      if (onConfigUpdated) onConfigUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const addCourtSlot = () => {
    const lastSlot = courtSchedule[courtSchedule.length - 1];
    const lastTime = lastSlot ? lastSlot.startTime : '09:00';
    const [hours, minutes] = lastTime.split(':');
    const nextHour = String(parseInt(hours) + 1).padStart(2, '0');
    setCourtSchedule([...courtSchedule, { startTime: `${nextHour}:00`, courts: 2 }]);
  };

  const removeCourtSlot = (index) => {
    setCourtSchedule(courtSchedule.filter((_, i) => i !== index));
  };

  const updateCourtSlot = (index, field, value) => {
    const updated = [...courtSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setCourtSchedule(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-bold">Tournament Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Match Points */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Match Points</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pool Matches
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.poolMatchPoints}
                  onChange={(e) => setConfig({ ...config, poolMatchPoints: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Knockout Matches
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.knockoutMatchPoints}
                  onChange={(e) => setConfig({ ...config, knockoutMatchPoints: parseInt(e.target.value) || 21 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Timing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={config.breakTimeMinutes}
                  onChange={(e) => setConfig({ ...config, breakTimeMinutes: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Match Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={config.estimatedMatchDurationMinutes}
                  onChange={(e) => setConfig({ ...config, estimatedMatchDurationMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Tournament Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tournament Start Time
              </label>
              <input
                type="datetime-local"
                value={(() => {
                  if (!config.tournamentStartTime) return '';
                  try {
                    // Backend sends LocalDateTime as "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm"
                    // datetime-local expects "YYYY-MM-DDTHH:mm"
                    let dateStr = config.tournamentStartTime;
                    
                    // Remove timezone info if present (shouldn't be, but just in case)
                    if (dateStr.includes('Z')) {
                      dateStr = dateStr.replace('Z', '');
                    }
                    if (dateStr.includes('+') || (dateStr.includes('-') && dateStr.lastIndexOf('-') > 10)) {
                      // Has timezone offset, remove it
                      const tzIndex = dateStr.indexOf('+') > -1 ? dateStr.indexOf('+') : dateStr.lastIndexOf('-');
                      dateStr = dateStr.substring(0, tzIndex);
                    }
                    
                    // Extract just the date and time parts (remove seconds if present)
                    // Format: "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
                    const [datePart, timePart] = dateStr.split('T');
                    if (!datePart || !timePart) {
                      console.warn('Invalid date format:', config.tournamentStartTime);
                      return '';
                    }
                    
                    // Get just hours and minutes (remove seconds)
                    const [hours, minutes] = timePart.split(':').slice(0, 2);
                    
                    // Format for datetime-local: "YYYY-MM-DDTHH:mm"
                    return `${datePart}T${hours}:${minutes}`;
                  } catch (error) {
                    console.error('Error parsing tournament start time:', error, config.tournamentStartTime);
                    return '';
                  }
                })()}
                onChange={(e) => {
                  if (!e.target.value) {
                    setConfig({ ...config, tournamentStartTime: null });
                    return;
                  }
                  try {
                    // datetime-local gives us "YYYY-MM-DDTHH:mm" in local time
                    // Backend expects LocalDateTime as "YYYY-MM-DDTHH:mm:ss"
                    const localDateTimeString = e.target.value; // e.g., "2024-01-15T10:00"
                    
                    // Add seconds to match LocalDateTime format
                    const formattedDateTime = `${localDateTimeString}:00`; // "2024-01-15T10:00:00"
                    
                    console.log('Setting tournament start time:', {
                      input: localDateTimeString,
                      formatted: formattedDateTime
                    });
                    
                    // Store directly as LocalDateTime string (no timezone conversion!)
                    setConfig({ ...config, tournamentStartTime: formattedDateTime });
                  } catch (error) {
                    console.error('Error setting tournament start time:', error);
                    toast.error('Invalid date/time format');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Set when the tournament will start (local time)</p>
            </div>
            
            {/* Court Booking End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Court Booking End Time
              </label>
              <input
                type="datetime-local"
                value={(() => {
                  if (!config.courtBookingEndTime) return '';
                  try {
                    let dateStr = config.courtBookingEndTime;
                    if (dateStr.includes('Z')) {
                      dateStr = dateStr.replace('Z', '');
                    }
                    if (dateStr.includes('+') || (dateStr.includes('-') && dateStr.lastIndexOf('-') > 10)) {
                      const tzIndex = dateStr.indexOf('+') > -1 ? dateStr.indexOf('+') : dateStr.lastIndexOf('-');
                      dateStr = dateStr.substring(0, tzIndex);
                    }
                    const [datePart, timePart] = dateStr.split('T');
                    if (!datePart || !timePart) {
                      return '';
                    }
                    const [hours, minutes] = timePart.split(':').slice(0, 2);
                    return `${datePart}T${hours}:${minutes}`;
                  } catch (error) {
                    return '';
                  }
                })()}
                onChange={(e) => {
                  if (!e.target.value) {
                    setConfig({ ...config, courtBookingEndTime: null });
                    return;
                  }
                  try {
                    const localDateTimeString = e.target.value;
                    const formattedDateTime = `${localDateTimeString}:00`;
                    setConfig({ ...config, courtBookingEndTime: formattedDateTime });
                  } catch (error) {
                    console.error('Error setting court booking end time:', error);
                    toast.error('Invalid date/time format');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">When court booking ends (leave empty to auto-calculate from schedule)</p>
            </div>
          </div>

          {/* Qualification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Qualification</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teams Qualifying Per Pool
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.qualifiersPerPool || 4}
                onChange={(e) => setConfig({ ...config, qualifiersPerPool: parseInt(e.target.value) || 4 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Number of teams that qualify from each pool to knockout phase</p>
            </div>
          </div>

          {/* Court Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex-1">Court Schedule</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={addCourtSlot}
              >
                + Add Slot
              </Button>
            </div>
            <div className="space-y-3">
              {courtSchedule.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateCourtSlot(index, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Number of Courts</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={slot.courts}
                      onChange={(e) => updateCourtSlot(index, 'courts', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {courtSchedule.length > 1 && (
                    <button
                      onClick={() => removeCourtSlot(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove slot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tournament Schedule Breakdown */}
        <TournamentScheduleBreakdown
          config={config}
          courtSchedule={courtSchedule}
          tournamentId={tournamentId}
        />

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 sm:p-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TournamentConfigModal;
