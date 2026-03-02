import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteTeam } from '../hooks/useTeams';
import { useAuth } from '../contexts/AuthContext';
import { LoadingButton } from './LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Eye, Pencil, Trash2, Users } from 'lucide-react';

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

    const handleViewTeam = () => navigate(`/app/team/${team.id}`);
    const handleEdit = (teamId) => navigate(`/app/edit-team/${teamId}`);

    const statusColors = {
        REGISTERED: 'bg-[var(--sport-blue)]/10 text-[var(--sport-blue)] border-[var(--sport-blue)]/20',
        CONFIRMED: 'bg-[var(--sport-live)]/10 text-[var(--sport-live)] border-[var(--sport-live)]/20',
    };

    return (
        <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden sport-card-hover">
            <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {/* Team Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sport-blue)] to-[var(--sport-purple)] flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                            {team.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-[var(--sport-blue)] transition-colors">
                                {team.name}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                statusColors[team.status] || 'bg-amber-50 text-amber-600 border-amber-200'
                            }`}>
                                {team.status}
                            </span>
                        </div>
                    </div>
                    {/* Player Count Badge */}
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shrink-0">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-[var(--sport-blue)]">{team.players?.length || 0}</span>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Captain</span>
                        <span className="font-medium text-gray-700 text-xs truncate max-w-[60%] text-right">
                            {team.captainName || 'Not assigned'}
                        </span>
                    </div>
                    {team.contactEmail && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Contact</span>
                            <span className="font-medium text-gray-700 text-xs truncate max-w-[60%] text-right">
                                {team.contactEmail}
                            </span>
                        </div>
                    )}
                    {team.registrationDate && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Registered</span>
                            <span className="font-medium text-gray-700 text-xs">
                                {new Date(team.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <button
                        onClick={handleViewTeam}
                        className="w-full bg-[var(--sport-blue)] text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                        <Eye className="w-4 h-4" /> View Team
                    </button>

                    {isAdmin && (
                        <div className="flex gap-2 pt-2 border-t border-gray-50">
                            <button
                                onClick={() => handleEdit(team.id)}
                                className="flex-1 bg-amber-50 text-amber-700 py-2 px-3 rounded-xl hover:bg-amber-100 transition-colors text-xs font-semibold flex items-center justify-center gap-1 border border-amber-100"
                            >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <LoadingButton
                                onClick={handleDeleteTeam}
                                loading={deleteTeam.isPending}
                                className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-xl hover:bg-red-100 transition-colors text-xs font-semibold flex items-center justify-center gap-1 border border-red-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                            </LoadingButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
