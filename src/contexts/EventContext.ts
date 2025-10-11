import { createContext } from "react";
import type { EventContextType } from "../types";

export const EventContext = createContext<EventContextType | undefined>(
  undefined,
);
