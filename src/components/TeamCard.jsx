import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteTeam } from '../hooks/useTeams';
import { useAuth } from '../contexts/AuthContext';
import { LoadingButton } from './LoadingSpinner';
import { toast } from 'react-hot-toast';

const TeamCard = ({ team, onTeamDeleted, tournamentId }) => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const deleteTeam = useDeleteTeam(tournamentId);

    const handleDeleteTeam = async () => {
        if (window.confirm(`Are you sure you want to delete team "${team.name}"? This will also delete all players in this team.`)) {
            try {
                await deleteTeam.mutateAsync(team.id);
                onTeamDeleted?.();
            } catch (error) {
                toast.error(error?.response?.data?.error || 'Failed to delete team');
            }
        }
    };

    const handleViewTeam = () => {
        navigate(`/team/${team.id}`);
    };

    const handleEdit = (teamId) => {
        navigate(`/edit-team/${teamId}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2 sm:gap-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2 sm:pr-0">
                    {team.name}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium self-start sm:self-auto whitespace-nowrap ${
                    team.status === 'REGISTERED' ? 'bg-blue-100 text-blue-800' :
                    team.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {team.status}
                </span>
            </div>

            {/* Team Information */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
                {/* Captain */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 min-w-0 sm:min-w-[80px]">Captain:</span>
                    <span className="truncate sm:ml-2">{team.captainName || 'Not assigned'}</span>
                </div>

                {/* Contact Email */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 min-w-0 sm:min-w-[80px]">Contact:</span>
                    <span className="truncate sm:ml-2 break-all sm:break-normal">
                        {team.contactEmail || 'Not provided'}
                    </span>
                </div>

                {/* Phone */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 min-w-0 sm:min-w-[80px]">Phone:</span>
                    <span className="truncate sm:ml-2">{team.contactPhone || 'Not provided'}</span>
                </div>

                {/* Registration Date and Players Count - Mobile: Stack, Desktop: Side by side */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-700 min-w-0 sm:min-w-[80px]">Registered:</span>
                        <span className="sm:ml-2">
                            {team.registrationDate ? new Date(team.registrationDate).toLocaleDateString() : 'Unknown'}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium text-gray-700">Players:</span>
                        <span className="sm:ml-2 font-semibold text-blue-600">
                            {team.players?.length || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-0">
                {/* Primary Action - View Team */}
                <button
                    onClick={handleViewTeam}
                    className="w-full bg-blue-600 text-white px-4 py-2 sm:py-2.5 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                >
                    <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Team
                    </span>
                </button>

                {/* Admin Actions */}
                {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                        <button
                            onClick={() => handleEdit(team.id)}
                            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors text-sm sm:text-base font-medium"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="hidden sm:inline">Edit Team</span>
                                <span className="sm:hidden">Edit</span>
                            </span>
                        </button>
                        <LoadingButton
                            onClick={handleDeleteTeam}
                            loading={deleteTeam.isPending}
                            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base font-medium"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="hidden sm:inline">Delete Team</span>
                                <span className="sm:hidden">Delete</span>
                            </span>
                        </LoadingButton>
                    </div>
                )}
            </div>

            {/* Mobile-specific quick info bar */}
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>ID: {team.id}</span>
                    <span>{team.players?.length || 0} players</span>
                    <span className={`px-2 py-1 rounded ${
                        team.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        {team.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TeamCard;