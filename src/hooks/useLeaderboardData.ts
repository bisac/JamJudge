import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import type { LeaderboardEntryViewModel } from "../types";

const PAGE_SIZE = 20;

interface UseLeaderboardDataReturn {
  results: LeaderboardEntryViewModel[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  fetchNextPage: () => Promise<void>;
  currentPage: number;
  totalResults: number;
}

/**
 * Hook to fetch and paginate leaderboard data from publicResults collection
 * Used by LeaderboardTable component
 *
 * @param eventId - The ID of the event to fetch results for
 */
export const useLeaderboardData = (
  eventId: string | undefined,
): UseLeaderboardDataReturn => {
  const [results, setResults] = useState<LeaderboardEntryViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch initial page
  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const resultsQuery = query(
          collection(db, "publicResults"),
          where("eventId", "==", eventId),
          orderBy("rank", "asc"),
          limit(PAGE_SIZE),
        );

        const snapshot = await getDocs(resultsQuery);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          rank: doc.data().rank,
          projectName:
            doc.data().projectName || `Project ${doc.data().projectId}`,
          teamName: doc.data().teamName || "Unknown Team",
          totalScore: doc.data().totalScore || 0,
        })) as LeaderboardEntryViewModel[];

        setResults(data);
        setTotalResults(snapshot.size);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch leaderboard"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [eventId]);

  // Fetch next page
  const fetchNextPage = useCallback(async () => {
    if (!eventId || !lastDoc || !hasMore) return;

    setIsLoading(true);

    try {
      const resultsQuery = query(
        collection(db, "publicResults"),
        where("eventId", "==", eventId),
        orderBy("rank", "asc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );

      const snapshot = await getDocs(resultsQuery);

      const newData = snapshot.docs.map((doc) => ({
        id: doc.id,
        rank: doc.data().rank,
        projectName:
          doc.data().projectName || `Project ${doc.data().projectId}`,
        teamName: doc.data().teamName || "Unknown Team",
        totalScore: doc.data().totalScore || 0,
      })) as LeaderboardEntryViewModel[];

      setResults((prev) => [...prev, ...newData]);
      setTotalResults((prev) => prev + snapshot.size);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setCurrentPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching next page:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch next page"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId, lastDoc, hasMore]);

  return {
    results,
    isLoading,
    error,
    hasMore,
    fetchNextPage,
    currentPage,
    totalResults,
  };
};
