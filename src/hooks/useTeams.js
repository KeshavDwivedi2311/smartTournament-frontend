import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import { tournamentKeys } from './useTournaments';
import { toast } from 'react-hot-toast';

export const teamKeys = {
  all: ['teams'],
  lists: () => [...teamKeys.all, 'list'],
  byTournament: (tournamentId) => [...teamKeys.lists(), 'tournament', tournamentId],
  detail: (id) => [...teamKeys.all, 'detail', id],
};

export const useTeams = (tournamentId, options = {}) => {
  return useQuery({
    queryKey: teamKeys.byTournament(tournamentId),
    queryFn: async () => {
      if (!tournamentId) return [];
      const data = await teamService.getTeamsByTournament(tournamentId);
      return data || [];
    },
    enabled: !!tournamentId,
    refetchInterval: 30000, // Poll every 30 seconds for live updates
    ...options,
  });
};

export const useCreateTeam = (tournamentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData) => teamService.createTeam(teamData, tournamentId),
    onMutate: async (newTeam) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.byTournament(tournamentId) });
      const previousTeams = queryClient.getQueryData(teamKeys.byTournament(tournamentId));

      queryClient.setQueryData(teamKeys.byTournament(tournamentId), (old = []) => [
        ...old,
        { ...newTeam, id: `temp-${Date.now()}` },
      ]);

      return { previousTeams };
    },
    onError: (err, newTeam, context) => {
      queryClient.setQueryData(teamKeys.byTournament(tournamentId), context.previousTeams);
      toast.error('Failed to create team');
    },
    onSuccess: () => {
      toast.success('Team created successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.byTournament(tournamentId) });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.detail(tournamentId) });
    },
  });
};

export const useDeleteTeam = (tournamentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId) => teamService.deleteTeam(teamId),
    onMutate: async (teamId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.byTournament(tournamentId) });
      const previousTeams = queryClient.getQueryData(teamKeys.byTournament(tournamentId));

      queryClient.setQueryData(teamKeys.byTournament(tournamentId), (old = []) =>
        old.filter((t) => t.id !== teamId)
      );

      return { previousTeams };
    },
    onError: (err, teamId, context) => {
      queryClient.setQueryData(teamKeys.byTournament(tournamentId), context.previousTeams);
      toast.error('Failed to delete team');
    },
    onSuccess: () => {
      toast.success('Team deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.byTournament(tournamentId) });
    },
  });
};
