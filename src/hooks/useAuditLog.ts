import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../firebase";
import type { AuditDTO, AuditAction } from "../types";

export const useAuditLog = (
  eventId: string | null,
  actionFilter?: AuditAction,
) => {
  const [audits, setAudits] = useState<AuditDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const pageSize = 20;

  const fetchAudits = async (loadMore: boolean = false) => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const auditsCollection = collection(db, "audits");
      let q = query(
        auditsCollection,
        where("eventId", "==", eventId),
        orderBy("createdAt", "desc"),
        limit(pageSize),
      );

      // Apply action filter if provided
      if (actionFilter) {
        q = query(
          auditsCollection,
          where("eventId", "==", eventId),
          where("action", "==", actionFilter),
          orderBy("createdAt", "desc"),
          limit(pageSize),
        );
      }

      // If loading more, start after the last document
      if (loadMore && lastDoc) {
        q = query(
          auditsCollection,
          where("eventId", "==", eventId),
          ...(actionFilter ? [where("action", "==", actionFilter)] : []),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize),
        );
      }

      const auditsSnapshot = await getDocs(q);

      const auditsData = auditsSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as AuditDTO[];

      if (loadMore) {
        setAudits((prev) => [...prev, ...auditsData]);
      } else {
        setAudits(auditsData);
      }

      setLastDoc(auditsSnapshot.docs[auditsSnapshot.docs.length - 1] || null);
      setHasMore(auditsSnapshot.docs.length === pageSize);
      setError(null);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setAudits([]);
    setLastDoc(null);
    setHasMore(true);
    fetchAudits(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, actionFilter]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchAudits(true);
    }
  };

  return { audits, isLoading, error, hasMore, loadMore };
};
