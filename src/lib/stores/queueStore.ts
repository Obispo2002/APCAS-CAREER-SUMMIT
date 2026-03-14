// src/lib/stores/queueStore.ts
import { writable } from 'svelte/store';

export const queueNumbersMap = writable<Record<string, { nowServing: string; nextNumber: string; company: string }>>({});

export function initCounter(counterId: string, company: string) {
  queueNumbersMap.update((map) => {
    if (!map[counterId]) {
      map[counterId] = {
        nowServing: `${company}_0001`,
        nextNumber: `${company}_0002`,
        company
      };
    }
    return map;
  });
}