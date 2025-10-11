import { useContext } from "react";
import { EventContext } from "../contexts/EventContext";
import type { EventContextType } from "../types";

export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error(
      "useEventContext must be used within an EventContextProvider",
    );
  }
  return context;
};
