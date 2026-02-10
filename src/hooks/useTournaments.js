import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '../services/tournamentService';
import { toast } from 'react-hot-toast';

// Query keys
export const tournamentKeys = {
  all: ['tournaments'],
  lists: () => [...tournamentKeys.all, 'list'],
  list: (filters) => [...tournamentKeys.lists(), { filters }],
  details: () => [...tournamentKeys.all, 'detail'],
  detail: (id) => [...tournamentKeys.details(), id],
};

// Fetch all tournaments
export const useTournaments = (options = {}) => {
  return useQuery({
    queryKey: tournamentKeys.lists(),
    queryFn: async () => {
      const data = await tournamentService.getTournaments();
      return data || [];
    },
    ...options,
  });
};

// Fetch single tournament
export const useTournament = (tournamentId, options = {}) => {
  return useQuery({
    queryKey: tournamentKeys.detail(tournamentId),
    queryFn: async () => {
      if (!tournamentId) return null;
      return await tournamentService.getTournamentById(tournamentId);
    },
    enabled: !!tournamentId,
    ...options,
  });
};

// Create tournament mutation with optimistic update
export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentData) => tournamentService.createTournament(tournamentData),
    onMutate: async (newTournament) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: tournamentKeys.lists() });

      // Snapshot previous value
      const previousTournaments = queryClient.getQueryData(tournamentKeys.lists());

      // Optimistically update
      queryClient.setQueryData(tournamentKeys.lists(), (old = []) => [
        ...old,
        { ...newTournament, id: `temp-${Date.now()}` },
      ]);

      return { previousTournaments };
    },
    onError: (err, newTournament, context) => {
      // Rollback on error
      queryClient.setQueryData(tournamentKeys.lists(), context.previousTournaments);
      toast.error('Failed to create tournament');
    },
    onSuccess: (data) => {
      toast.success('Tournament created successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};

// Delete tournament mutation
export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId) => tournamentService.deleteTournament(tournamentId),
    onMutate: async (tournamentId) => {
      await queryClient.cancelQueries({ queryKey: tournamentKeys.lists() });
      const previousTournaments = queryClient.getQueryData(tournamentKeys.lists());

      queryClient.setQueryData(tournamentKeys.lists(), (old = []) =>
        old.filter((t) => t.id !== tournamentId)
      );

      return { previousTournaments };
    },
    onError: (err, tournamentId, context) => {
      queryClient.setQueryData(tournamentKeys.lists(), context.previousTournaments);
      toast.error('Failed to delete tournament');
    },
    onSuccess: () => {
      toast.success('Tournament deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
};
