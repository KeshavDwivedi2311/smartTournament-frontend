import React, { useState } from 'react';
import { tournamentService } from '../services/tournamentService';

const CreateTournamentModal = ({ isOpen, onClose, onTournamentCreated }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [tournamentData, setTournamentData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        venues: [{ name: '', address: '', capacity: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
        setTournamentData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleVenueChange = (index, field, value) => {
        const updatedVenues = [...tournamentData.venues];
        updatedVenues[index] = {
            ...updatedVenues[index],
            [field]: value
        };
        setTournamentData(prev => ({
            ...prev,
            venues: updatedVenues
        }));
    };

    const addVenue = () => {
        setTournamentData(prev => ({
            ...prev,
            venues: [...prev.venues, { name: '', address: '', capacity: '' }]
        }));
    };

    const removeVenue = (index) => {
        if (tournamentData.venues.length > 1) {
            const updatedVenues = tournamentData.venues.filter((_, i) => i !== index);
            setTournamentData(prev => ({
                ...prev,
                venues: updatedVenues
            }));
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!tournamentData.name || !tournamentData.startDate) {
                setError('Please fill in all required fields');
                return;
            }
        }
        setError('');
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const tournamentPayload = {
                title: tournamentData.name,
                startDate: tournamentData.startDate,
                endDate: tournamentData.endDate || tournamentData.startDate,
                description: `Tournament with venues: ${tournamentData.venues.map(v => v.name).join(', ')}`,
                maxParticipants: 100 // Default value
            };

            await tournamentService.createTournament(tournamentPayload);
            onTournamentCreated();
            handleClose();
        } catch (err) {
            setError('Failed to create tournament. Please try again.');
            console.error('Error creating tournament:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setTournamentData({
            name: '',
            startDate: '',
            endDate: '',
            venues: [{ name: '', address: '', capacity: '' }]
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">New Tournament</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        1
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        2
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Step 1: Tournament Details */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tournament Title *
                            </label>
                            <input
                                type="text"
                                value={tournamentData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter tournament name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                value={tournamentData.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={tournamentData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Venues */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Tournament Venues</h3>

                        {tournamentData.venues.map((venue, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700">Venue {index + 1}</h4>
                                    {tournamentData.venues.length > 1 && (
                                        <button
                                            onClick={() => removeVenue(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Venue name"
                                        value={venue.name}
                                        onChange={(e) => handleVenueChange(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address"
                                        value={venue.address}
                                        onChange={(e) => handleVenueChange(index, 'address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Capacity"
                                        value={venue.capacity}
                                        onChange={(e) => handleVenueChange(index, 'capacity', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addVenue}
                            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                            + Add More Venues
                        </button>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-between mt-6">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Back
                        </button>
                    )}

                    <div className="ml-auto">
                        {currentStep < 2 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Tournament'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTournamentModal;