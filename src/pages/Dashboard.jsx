import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournaments, useCreateTournament } from '../hooks/useTournaments';
import { LoadingSpinner, LoadingSkeleton } from '../components/LoadingSpinner';
import CreateTournamentModal from '../components/CreateTournamentModal';
import Pagination from '../components/Pagination';
import Button from '../components/ui/Button';
import { usePagination } from '../hooks/usePagination';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: tournaments = [], isLoading, error, refetch } = useTournaments({
        refetchInterval: 60000, // Poll every minute for updates
    });
    const createTournament = useCreateTournament();
    
    // Pagination
    const { paginatedItems, currentPage, totalPages, goToPage } = usePagination(tournaments, 9);

    const handleTournamentCreated = async (tournamentData) => {
        await createTournament.mutateAsync(tournamentData);
        setIsModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <LoadingSkeleton lines={2} className="h-8" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6">
                            <LoadingSkeleton lines={5} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-20 sm:pb-6">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tournament Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage your tournaments</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                        <div className="flex-1">
                            <strong>Error:</strong> <span className="text-sm sm:text-base">
                                {error?.message || 'Unable to connect to server. Please make sure the backend is running.'}
                            </span>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="bg-red-500 text-white px-3 py-1.5 sm:py-1 rounded text-sm hover:bg-red-600 self-start sm:self-auto sm:ml-4"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Tournament Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginatedItems.length === 0 && !error ? (
                    <div className="col-span-full text-center py-8 sm:py-12 px-4">
                        <div className="text-gray-500 text-base sm:text-lg">No tournaments found</div>
                        <p className="text-gray-400 mt-2 text-sm sm:text-base">Create your first tournament to get started</p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            size="md"
                            className="mt-4"
                        >
                            Create Tournament
                        </Button>
                    </div>
                ) : (
                    paginatedItems.map((tournament) => (
                        <div key={tournament.id || Math.random()} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                {tournament.title || 'Unnamed Tournament'}
                            </h3>
                            <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">
                                {tournament.description || 'No description available'}
                            </p>
                            <div className="text-xs sm:text-sm text-gray-500 mb-4 space-y-1">
                                <p><span className="font-medium">Start:</span> {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}</p>
                                <p><span className="font-medium">Venue:</span> <span className="truncate inline-block max-w-[150px] sm:max-w-none">{tournament.venue || 'TBD'}</span></p>
                                <p><span className="font-medium">Teams:</span> {tournament.maxTeams || 'Not specified'}</p>
                                <p><span className="font-medium">Type:</span> {tournament.tournamentType || 'Not specified'}</p>
                                <p><span className="font-medium">Status:</span>
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                        tournament.status === 'active' ? 'bg-green-100 text-green-800' :
                                        tournament.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {tournament.status || 'Unknown'}
                                    </span>
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate(`/tournament/${tournament.id}`)}
                                className="w-full"
                                size="md"
                            >
                                View Details
                            </Button>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </div>
            )}

            {/* Floating Add Button */}
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Create new tournament"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
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