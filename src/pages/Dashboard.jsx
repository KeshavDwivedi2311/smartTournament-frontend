import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournaments, useCreateTournament } from '../hooks/useTournaments';
import { LoadingSpinner, LoadingSkeleton } from '../components/LoadingSpinner';
import CreateTournamentModal from '../components/CreateTournamentModal';
import Pagination from '../components/Pagination';
import Button from '../components/ui/Button';
import { usePagination } from '../hooks/usePagination';
import { Plus, Trophy, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';

/* ── Status Styling Map ── */
const STATUS_STYLES = {
    active: {
        bg: 'bg-[var(--sport-live)]/10',
        text: 'text-[var(--sport-live)]',
        dot: 'bg-[var(--sport-live)]',
        border: 'border-[var(--sport-live)]/20',
        gradient: 'from-green-600 to-emerald-500',
        label: 'Live',
        animate: true,
    },
    ONGOING: {
        bg: 'bg-[var(--sport-live)]/10',
        text: 'text-[var(--sport-live)]',
        dot: 'bg-[var(--sport-live)]',
        border: 'border-[var(--sport-live)]/20',
        gradient: 'from-green-600 to-emerald-500',
        label: 'Live',
        animate: true,
    },
    completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        dot: 'bg-gray-400',
        border: 'border-gray-200',
        gradient: 'from-gray-500 to-gray-400',
        label: 'Completed',
        animate: false,
    },
    COMPLETED: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        dot: 'bg-gray-400',
        border: 'border-gray-200',
        gradient: 'from-gray-500 to-gray-400',
        label: 'Completed',
        animate: false,
    },
    CREATED: {
        bg: 'bg-[var(--sport-blue)]/10',
        text: 'text-[var(--sport-blue)]',
        dot: 'bg-[var(--sport-blue)]',
        border: 'border-[var(--sport-blue)]/20',
        gradient: 'from-[var(--sport-blue)] to-blue-500',
        label: 'Setup',
        animate: false,
    },
};

const DEFAULT_STATUS = {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-orange-400',
    label: 'Pending',
    animate: false,
};

function TournamentCard({ tournament, onNavigate }) {
    const status = STATUS_STYLES[tournament.status] || DEFAULT_STATUS;

    return (
        <div
            onClick={() => onNavigate(tournament.id)}
            className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer sport-card-hover"
        >
            {/* ── Gradient Top Strip ── */}
            <div className={`h-1.5 bg-gradient-to-r ${status.gradient}`} />

            <div className="p-4 sm:p-5">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                        {status.animate && <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-live-dot`} />}
                        {status.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--sport-blue)] group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[var(--sport-blue)] transition-colors leading-snug">
                    {tournament.title || 'Unnamed Tournament'}
                </h3>

                {/* Description */}
                <p className="text-gray-500 mb-4 text-sm line-clamp-2 leading-relaxed">
                    {tournament.description || 'No description available'}
                </p>

                {/* Info Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {tournament.startDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                            <Calendar className="w-3 h-3" />
                            {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                    {tournament.venue && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100 max-w-[140px] truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {tournament.venue}
                        </span>
                    )}
                    {tournament.maxTeams && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                            <Users className="w-3 h-3" />
                            {tournament.maxTeams} teams
                        </span>
                    )}
                </div>

                {/* Type + Arrow */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 font-medium">
                        {tournament.tournamentType || 'Standard'}
                    </span>
                    <span className="text-xs font-semibold text-[var(--sport-blue)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View Details <ChevronRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </div>
    );
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: tournaments = [], isLoading, error, refetch } = useTournaments({
        refetchInterval: 60000,
    });
    const createTournament = useCreateTournament();
    const { paginatedItems, currentPage, totalPages, goToPage } = usePagination(tournaments, 9);

    const handleTournamentCreated = async (tournamentData) => {
        await createTournament.mutateAsync(tournamentData);
        setIsModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="mb-6"><LoadingSkeleton lines={2} className="h-8" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                            <div className="h-1.5 bg-gray-100 rounded-full mb-4 w-16" />
                            <LoadingSkeleton lines={5} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-20 sm:pb-6">
            {/* ═══ Header ═══ */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-[var(--sport-blue)]" /> Tournaments
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 sm:w-auto">
                        <Plus className="w-4 h-4" />
                        New Tournament
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between gap-3">
                    <div className="text-sm">
                        <strong>Error:</strong> {error?.message || 'Unable to connect. Is the backend running?'}
                    </div>
                    <button onClick={() => refetch()} className="shrink-0 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                        Retry
                    </button>
                </div>
            )}

            {/* ═══ Tournament Grid ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {paginatedItems.length === 0 && !error ? (
                    <div className="col-span-full">
                        {/* ── Premium Empty State ── */}
                        <div className="text-center py-16 sm:py-20 px-6">
                            <div className="relative inline-block mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--sport-blue)]/10 to-[var(--sport-green)]/10 flex items-center justify-center mx-auto">
                                    <Trophy className="w-12 h-12 text-[var(--sport-blue)]" />
                                </div>
                                {/* Court line decoration */}
                                <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 opacity-20" viewBox="0 0 128 16" fill="none">
                                    <line x1="0" y1="8" x2="128" y2="8" stroke="var(--sport-blue)" strokeWidth="1.5" />
                                    <line x1="64" y1="0" x2="64" y2="16" stroke="var(--sport-blue)" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No tournaments yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                                Create your first tournament and start managing matches, teams, and scores in real time.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create First Tournament
                            </Button>
                        </div>
                    </div>
                ) : (
                    paginatedItems.map((tournament) => (
                        <TournamentCard
                            key={tournament.id || Math.random()}
                            tournament={tournament}
                            onNavigate={(id) => navigate(`/app/tournament/${id}`)}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                </div>
            )}

            {/* Floating Add Button */}
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-br from-[var(--sport-blue)] to-blue-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--sport-blue)] focus:ring-offset-2"
                    aria-label="Create new tournament"
                >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </div>

            {/* Create Tournament Modal */}
            <CreateTournamentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTournamentCreated={handleTournamentCreated}
                isLoading={createTournament.isPending}
            />
        </div>
    );
};

export default Dashboard;
