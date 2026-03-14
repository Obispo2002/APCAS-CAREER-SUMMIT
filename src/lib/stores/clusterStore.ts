import { writable } from 'svelte/store';

export type Cluster = {
	id: string;
	username: string;
	cluster_name: string | null;
	role: 'admin' | 'user';
};

function createClusterStore() {
	const { subscribe, set, update } = writable<Cluster[]>([]);

	return {
		subscribe,

		init(data: Cluster[]) {
			set(data);
		},

		add(cluster: Cluster) {
			update((items) => [...items, cluster]);
		},

		updateCluster(id: string, values: Partial<Cluster>) {
			update((items) =>
				items.map((c) =>
					c.id === id ? { ...c, ...values } : c
				)
			);
		},

		remove(id: string) {
			update((items) => items.filter((c) => c.id !== id));
		}
	};
}

export const clusterStore = createClusterStore();