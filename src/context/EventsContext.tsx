import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AppEvent } from '../data/events';
import { INITIAL_EVENTS } from '../data/events';

const STORAGE_KEY = 'workout_app_events';

interface EventsContextType {
  events: AppEvent[];
  addEvent: (data: Omit<AppEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, data: Omit<AppEvent, 'id' | 'createdAt'>) => void;
  deleteEvent: (id: string) => void;
  toggleEvent: (id: string) => void;
}

const EventsContext = createContext<EventsContextType | null>(null);

function loadEvents(): AppEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppEvent[];
  } catch {
    // 파싱 실패 시 초기값 사용
  }
  return INITIAL_EVENTS;
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>(loadEvents);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((data: Omit<AppEvent, 'id' | 'createdAt'>) => {
    setEvents((prev) => [
      { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const updateEvent = useCallback(
    (id: string, data: Omit<AppEvent, 'id' | 'createdAt'>) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...data, id, createdAt: e.createdAt } : e)),
      );
    },
    [],
  );

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleEvent = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e)),
    );
  }, []);

  return (
    <EventsContext.Provider
      value={{ events, addEvent, updateEvent, deleteEvent, toggleEvent }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext(): EventsContextType {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEventsContext must be used within EventsProvider');
  return ctx;
}
