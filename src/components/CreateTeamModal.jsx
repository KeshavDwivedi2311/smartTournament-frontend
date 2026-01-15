import React, { useState } from 'react';
import { teamService } from '../services/teamService';

const CreateTeamModal = ({ isOpen, onClose, onTeamCreated, tournamentId }) => {
    const [teamData, setTeamData] = useState({
        name: '',
        captainName: '',
        contactEmail: '',
        contactPhone: '',
        teamLogoUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
        setTeamData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teamData.name.trim()) {
            setError('Team name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await teamService.createTeam(teamData, tournamentId);
            onTeamCreated();
            handleClose();
        } catch (err) {
            setError('Failed to create team. Please try again.');
            console.error('Error creating team:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTeamData({
            name: '',
            captainName: '',
            contactEmail: '',
            contactPhone: '',
            teamLogoUrl: ''
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Team</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Name *
                        </label>
                        <input
                            type="text"
                            value={teamData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter team name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Captain Name
                        </label>
                        <input
                            type="text"
                            value={teamData.captainName}
                            onChange={(e) => handleInputChange('captainName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter captain name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            value={teamData.contactEmail}
                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter contact email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            value={teamData.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter contact phone"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Logo URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={teamData.teamLogoUrl}
                            onChange={(e) => handleInputChange('teamLogoUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter logo URL"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTeamModal;