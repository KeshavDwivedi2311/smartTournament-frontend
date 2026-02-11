import React, { useState } from 'react';
import { playerService } from '../services/playerService';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Medal, Zap, User, Mail, Smartphone, Cake, Siren, Heart, BarChart3, Eye } from 'lucide-react';

const PlayerCard = ({ player, onPlayerDeleted }) => {
    const { isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDeletePlayer = async () => {
        if (window.confirm(`Are you sure you want to delete player "${player.name}"?`)) {
            try {
                setLoading(true);
                await playerService.deletePlayer(player.id);
                onPlayerDeleted();
            } catch (error) {
                console.error('Error deleting player:', error);
                alert('Failed to delete player. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const getPositionConfig = (position) => {
        switch (position) {
            case 'CAPTAIN':
                return {
                    bg: 'bg-gradient-to-r from-yellow-400 to-orange-400',
                    text: 'text-yellow-900',
                    icon: Crown,
                    label: 'Captain'
                };
            case 'VICE_CAPTAIN':
                return {
                    bg: 'bg-gradient-to-r from-blue-400 to-purple-400',
                    text: 'text-blue-900',
                    icon: Medal,
                    label: 'Vice Captain'
                };
            case 'PLAYER':
                return {
                    bg: 'bg-gradient-to-r from-green-400 to-blue-400',
                    text: 'text-green-900',
                    icon: Zap,
                    label: 'Player'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: User,
                    label: position || 'Player'
                };
        }
    };

    const positionConfig = getPositionConfig(player.position);

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(player.dateOfBirth);

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
            {/* Header Section */}
            <div className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate pr-2">
                            {player.name}
                        </h3>
                        {player.jerseyNumber && (
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                Jersey #{player.jerseyNumber}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`
                            px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1
                            ${positionConfig.bg} ${positionConfig.text} shadow-sm
                        `}>
                            <span className="hidden sm:inline">{React.createElement(positionConfig.icon, { className: "w-3 h-3 sm:w-4 sm:h-4" })}</span>
                            <span>{positionConfig.label}</span>
                        </span>
                        {age && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {age} years
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Info - Always Visible */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="text-xs text-gray-500 mb-1">Contact</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {player.email ? (
                                <a
                                    href={`mailto:${player.email}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Mail className="w-3 h-3 inline mr-1" />{player.email.length > 15 ? `${player.email.substring(0, 15)}...` : player.email}
                                </a>
                            ) : (
                                <span className="text-gray-400">No email</span>
                            )}
                        </div>
                        {player.phone && (
                            <div className="text-xs text-gray-600 mt-1 truncate">
                                <Smartphone className="w-3 h-3 inline mr-1" />{player.phone}
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="text-xs text-gray-500 mb-1">Registered</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {player.registrationDate ?
                                new Date(player.registrationDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: '2-digit'
                                }) :
                                'Unknown'
                            }
                        </div>
                    </div>
                </div>

                {/* Expandable Details - Mobile */}
                <div className="sm:hidden">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-center py-2 text-sm text-blue-600 hover:text-blue-800 border-t border-gray-200"
                    >
                        <span>{isExpanded ? 'Less Details' : 'More Details'}</span>
                        <svg
                            className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Detailed Info - Desktop Always Visible, Mobile Expandable */}
                <div className={`
                    space-y-2 text-sm text-gray-600
                    ${isExpanded ? 'block' : 'hidden'} sm:block
                    ${isExpanded ? 'mt-3 pt-3 border-t border-gray-200' : ''}
                `}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {player.dateOfBirth && (
                            <div className="flex items-center">
                                <span className="font-medium text-gray-700 min-w-0 flex-shrink-0 flex items-center gap-1"><Cake className="w-3 h-3" /> Birthday:</span>
                                <span className="ml-2 truncate">
                                    {new Date(player.dateOfBirth).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}

                        {player.emergencyContact && (
                            <div className="flex items-center">
                                <span className="font-medium text-gray-700 min-w-0 flex-shrink-0 flex items-center gap-1"><Siren className="w-3 h-3" /> Emergency:</span>
                                <span className="ml-2 truncate">{player.emergencyContact}</span>
                            </div>
                        )}

                        {player.medicalInfo && (
                            <div className="flex items-start sm:col-span-2">
                                <span className="font-medium text-gray-700 min-w-0 flex-shrink-0 flex items-center gap-1"><Heart className="w-3 h-3" /> Medical:</span>
                                <span className="ml-2 text-xs sm:text-sm">{player.medicalInfo}</span>
                            </div>
                        )}
                    </div>

                    {/* Player Stats - if available */}
                    {(player.matchesPlayed || player.wins || player.losses) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Statistics</div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-blue-50 rounded p-2">
                                    <div className="text-lg font-bold text-blue-600">{player.matchesPlayed || 0}</div>
                                    <div className="text-xs text-gray-600">Matches</div>
                                </div>
                                <div className="bg-green-50 rounded p-2">
                                    <div className="text-lg font-bold text-green-600">{player.wins || 0}</div>
                                    <div className="text-xs text-gray-600">Wins</div>
                                </div>
                                <div className="bg-red-50 rounded p-2">
                                    <div className="text-lg font-bold text-red-600">{player.losses || 0}</div>
                                    <div className="text-xs text-gray-600">Losses</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons - Only for logged in users */}
            {isLoggedIn && (
                <div className="bg-gray-50 px-3 sm:px-4 lg:px-6 py-3 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={() => {/* Add edit functionality */}}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit Player</span>
                            <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                            onClick={handleDeletePlayer}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    <span className="hidden sm:inline">Deleting...</span>
                                    <span className="sm:hidden">...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="hidden sm:inline">Delete Player</span>
                                    <span className="sm:hidden">Delete</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* View-Only Indicator */}
            {!isLoggedIn && (
                <div className="bg-blue-50 px-3 sm:px-4 lg:px-6 py-2 border-t border-blue-200">
                    <div className="flex items-center justify-center text-blue-700 text-xs sm:text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <Eye className="w-4 h-4 mr-1" /> View Only Mode
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerCard;