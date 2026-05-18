import { useMemo } from 'react';
import { useEventsContext } from '../context/EventsContext';
import type { AppEvent, EventCategory } from '../data/events';
import { CATEGORY_META, CONDITION_META, REWARD_TYPE_META } from '../data/events';
import { BUBBLE_PREVIEWS } from '../data/bubblePreviews';

const today = new Date().toISOString().slice(0, 10);

export function getEventStatus(event: AppEvent) {
  const isExpired = event.endDate < today;
  const isPending = event.startDate > today;
  if (isExpired) return { label: '종료', color: 'text-gray-400 bg-gray-100' };
  if (isPending) return { label: '예정', color: 'text-blue-500 bg-blue-50' };
  if (!event.isActive) return { label: '비활성', color: 'text-gray-400 bg-gray-100' };
  return { label: '진행 중', color: 'text-emerald-600 bg-emerald-50' };
}

export function getRewardLabel(event: AppEvent): string {
  const rewardMeta = REWARD_TYPE_META[event.reward.type];
  const parts: string[] = [];
  if (event.reward.bubbleId) {
    const bubble = BUBBLE_PREVIEWS[event.reward.bubbleId];
    if (bubble) parts.push(`${rewardMeta.emoji} ${bubble.text}`);
  }
  if (event.reward.titleText) {
    parts.push(`🏅 ${event.reward.titleText}`);
  }
  return parts.length > 0 ? parts.join(' + ') : rewardMeta.label;
}

export function getConditionLabel(event: AppEvent): string {
  const meta = CONDITION_META[event.conditionType];
  return `${event.conditionValue.toLocaleString()}${meta.unit} ${meta.label}`;
}

export function useEvents() {
  const { events, addEvent, updateEvent, deleteEvent, toggleEvent } =
    useEventsContext();

  const activeEvents = useMemo(
    () =>
      events.filter(
        (e) => e.isActive && e.startDate <= today && e.endDate >= today,
      ),
    [events],
  );

  const byCategory = useMemo(
    (): Record<EventCategory, AppEvent[]> => ({
      personal: activeEvents.filter((e) => e.category === 'personal'),
      party: activeEvents.filter((e) => e.category === 'party'),
      streak: activeEvents.filter((e) => e.category === 'streak'),
    }),
    [activeEvents],
  );

  return {
    events,
    activeEvents,
    byCategory,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEvent,
    // 메타 helpers
    CATEGORY_META,
    CONDITION_META,
    REWARD_TYPE_META,
    getEventStatus,
    getRewardLabel,
    getConditionLabel,
  };
}
