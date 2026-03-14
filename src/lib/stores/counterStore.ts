import { writable } from 'svelte/store';

export type Counter = {
	id: string;
	name: string;
	status: 'active' | 'inactive';
	queueLength: number;
};

function createCounterStore() {
	const { subscribe, set, update } = writable<Counter[]>([]);

	return {
		subscribe,
		init(data: Counter[]) {
			set(data);
		},
		add(counter: Counter) {
			update(counters => [...counters, counter]);
		},
		update(id: string, newData: Partial<Counter>) {
			update(counters =>
				counters.map(c => (c.id === id ? { ...c, ...newData } : c))
			);
		},
		delete(id: string) {
			update(counters => counters.filter(c => c.id !== id));
		}
	};
}

export const counterStore = createCounterStore();