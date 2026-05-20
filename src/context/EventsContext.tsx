import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AppEvent } from "../data/events";
import {
  fetchEvents,
  createEvent,
  updateEventInDB,
  deleteEventFromDB,
  toggleEventInDB,
} from "../lib/eventService";

interface EventsContextType {
  events: AppEvent[];
  isLoading: boolean;
  addEvent: (data: Omit<AppEvent, "id" | "createdAt">) => Promise<void>;
  updateEvent: (
    id: string,
    data: Omit<AppEvent, "id" | "createdAt">,
  ) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleEvent: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchEvents();
    setEvents(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addEvent = useCallback(
    async (data: Omit<AppEvent, "id" | "createdAt">) => {
      const created = await createEvent(data);
      if (created) setEvents((prev) => [created, ...prev]);
    },
    [],
  );

  const updateEvent = useCallback(
    async (id: string, data: Omit<AppEvent, "id" | "createdAt">) => {
      const ok = await updateEventInDB(id, data);
      if (ok)
        setEvents((prev) =>
          prev.map((e) =>
            e.id === id ? { ...data, id, createdAt: e.createdAt } : e,
          ),
        );
    },
    [],
  );

  const deleteEvent = useCallback(async (id: string) => {
    const ok = await deleteEventFromDB(id);
    if (ok) setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleEvent = useCallback(async (id: string) => {
    // optimistic update — DB sync is fire-and-forget
    setEvents((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target) return prev;
      toggleEventInDB(id, !target.isActive);
      return prev.map((e) =>
        e.id === id ? { ...e, isActive: !e.isActive } : e,
      );
    });
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        isLoading,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEvent,
        refresh: load,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext(): EventsContextType {
  const ctx = useContext(EventsContext);
  if (!ctx)
    throw new Error("useEventsContext must be used within EventsProvider");
  return ctx;
}
