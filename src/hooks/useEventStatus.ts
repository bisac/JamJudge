import { useEventContext } from "./useEventContext";

/**
 * Hook to check if event results have been published
 * Used by PublicLeaderboardPage to conditionally render the leaderboard
 */
export const useEventStatus = () => {
  const { event, isLoading } = useEventContext();

  const areResultsPublished = !!(event && event.resultsPublishedAt);

  return {
    event,
    areResultsPublished,
    isLoading,
  };
};
