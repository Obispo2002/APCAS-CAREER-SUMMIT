import { writable, type Writable } from 'svelte/store';

export const allQueueNumbers: Writable<
  Record<string, { nowServing: string; nextNumber: string }>
> = writable({});

export function getQueueNumber(counterId: string): Writable<
  Record<string, { nowServing: string; nextNumber: string }>
> {
  allQueueNumbers.update((map) => {
    if (!map[counterId]) {
      map[counterId] = { nowServing: `${counterId}_0001`, nextNumber: `${counterId}_0002` };
    }
    return map;
  });

  return allQueueNumbers;
}