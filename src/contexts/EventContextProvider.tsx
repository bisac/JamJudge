import React, { useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import { useActiveEvent } from "../hooks/useActiveEvent";
import type { EventDTO, EventStage, EventContextType } from "../types";
import { EventContext } from "./EventContext";

const determineCurrentStage = (event: EventDTO | null): EventStage => {
  if (!event) return "unknown";

  const now = Timestamp.now();
  const {
    registrationDeadline,
    submissionDeadline,
    ratingStartAt,
    ratingEndAt,
  } = event;

  if (registrationDeadline && now < registrationDeadline) {
    return "registration";
  }
  if (
    submissionDeadline &&
    (!registrationDeadline || now > registrationDeadline) &&
    now < submissionDeadline
  ) {
    return "work_in_progress";
  }
  if (
    ratingStartAt &&
    ratingEndAt &&
    now > ratingStartAt &&
    now < ratingEndAt
  ) {
    return "rating";
  }
  if (ratingEndAt && now > ratingEndAt) {
    return "finished";
  }

  return "unknown";
};

export const EventContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { event, isLoading, error } = useActiveEvent();

  const contextValue = useMemo<EventContextType>(() => {
    const currentStage = determineCurrentStage(event);
    return {
      event,
      isLoading,
      error,
      currentStage,
      deadlines: {
        submission: event?.submissionDeadline || null,
        rating: event?.ratingEndAt || null,
      },
    };
  }, [event, isLoading, error]);

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};
