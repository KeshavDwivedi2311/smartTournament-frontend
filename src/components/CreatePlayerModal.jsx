import React, { useState } from 'react';
import { playerService } from '../services/playerService';

const CreatePlayerModal = ({ isOpen, onClose, onPlayerCreated, teamId }) => {
    const [playerData, setPlayerData] = useState({
        name: '',
        email: '',
        phone: '',
        position: 'PLAYER',
        jerseyNumber: '',
        dateOfBirth: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
        setPlayerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!playerData.name.trim()) {
            setError('Player name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                ...playerData,
                jerseyNumber: playerData.jerseyNumber ? parseInt(playerData.jerseyNumber) : null
            };

            await playerService.createPlayer(payload, teamId);
            onPlayerCreated();
            handleClose();
        } catch (err) {
            setError('Failed to create player. Please try again.');
            console.error('Error creating player:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPlayerData({
            name: '',
            email: '',
            phone: '',
            position: 'PLAYER',
            jerseyNumber: '',
            dateOfBirth: ''
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto">
                {/* Header - Mobile optimized */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                            Add New Player
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Player Name *
                            </label>
                            <input
                                type="text"
                                value={playerData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                placeholder="Enter player name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={playerData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={playerData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Position
                            </label>
                            <select
                                value={playerData.position}
                                onChange={(e) => handleInputChange('position', e.target.value)}
                                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
                            >
                                <option value="PLAYER">Player</option>
                                <option value="CAPTAIN">Captain</option>
                                <option value="SUBSTITUTE">Substitute</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Jersey Number
                            </label>
                            <input
                                type="number"
                                value={playerData.jerseyNumber}
                                onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
                                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                placeholder="Enter jersey number"
                                min="1"
                                max="99"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={playerData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            />
                        </div>

                        {/* Action buttons - Mobile optimized */}
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full sm:flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:flex-1 bg-green-600 text-white px-4 py-3 sm:py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                            >
                                {loading ? 'Adding...' : 'Add Player'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePlayerModal;