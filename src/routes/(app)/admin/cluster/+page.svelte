<script lang="ts">
	import DataTable from '$lib/components/app/tables/data-table.svelte';
	import { cluster } from '$lib/components/app/tables/columns';
	import NewClusterModal from '$lib/components/app/admin/cluster/new-cluster-modal.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { buttonVariants } from '$lib/components/ui/button';
	import { FilterIcon, X} from 'lucide-svelte';
	import { clusterStore } from '$lib/stores/clusterStore';
	import { writable, derived, type Writable } from 'svelte/store';

	type Cluster = {
		id: string;
		username: string;
		cluster_name: string | null;
		role: 'admin' | 'user';
	};
	const activeCluster: Writable<string | null> = writable(null);
	const filteredEmployees = derived(
		[clusterStore, activeCluster],
		([$clusters, $activeCluster]) => {
			const mapped = $clusters.map((emp: Cluster) => ({
				id: emp.id,
				username: emp.username,
				cluster_name: emp.cluster_name ?? '',
				role: emp.role
			}));
			if ($activeCluster) return mapped.filter(emp => emp.cluster_name === $activeCluster);
			return mapped;
		}
	);
	const clusters = derived(clusterStore, $clusters =>
		[...new Set($clusters.map((e: Cluster) => e.cluster_name).filter(Boolean))]
	);
	let open = false;
	function setCluster(cluster: string) {
		activeCluster.set(cluster);
		open = false;
	}
	function clearClusterFilter() {
		activeCluster.set(null);
		open = false;
	}
	export let data: { employees: Cluster[] };
	clusterStore.init(data.employees);
</script>

<div class="space-y-4">
	<div class="flex flex-col items-start justify-between md:flex-row md:items-center">
		<div class="text-lg font-semibold">Cluster Page</div>

		<div class="mt-4 flex flex-col-reverse gap-2 md:-mb-32 md:mt-0 md:flex-row md:gap-2">
			<DropdownMenu.Root bind:open={open}>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
					<FilterIcon class="mr-2 h-4 w-4" /> Filter
				</DropdownMenu.Trigger>

				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Filter by Cluster</DropdownMenu.Label>
					<DropdownMenu.Separator />

					{#each $clusters as clusterName}
						<DropdownMenu.Item onclick={() => setCluster(clusterName)}>
							{clusterName}
						</DropdownMenu.Item>
					{/each}

					{#if $activeCluster}
						<DropdownMenu.Separator />
						<DropdownMenu.Item class="text-red-500" onclick={clearClusterFilter}>
							<X class="mr-2 h-4 w-4" /> Clear Filter
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<NewClusterModal />
		</div>
	</div>
		<DataTable filterKey="cluster_name" columns={cluster} data={$filteredEmployees} />
</div>