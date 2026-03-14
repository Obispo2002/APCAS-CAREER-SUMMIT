<script lang="ts">
	import { writable, derived } from 'svelte/store';
	import { onMount } from 'svelte';
	import DataTable from '$lib/components/app/tables/data-table.svelte';
	import { counter } from '$lib/components/app/tables/columns';
	import { queueNumbersMap } from '$lib/stores/queueStore';
	import NewCounterModal from '$lib/components/app/admin/counter/new-counter-modal.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { buttonVariants } from '$lib/components/ui/button';
	import { FilterIcon, X } from 'lucide-svelte';

	export let data: { counters: any[] } = { counters: [] };

	const counterStore = writable<any[]>(data.counters);
	const activeCounter = writable<string | null>(null);

	const filteredCounters = derived(
		[counterStore, activeCounter],
		([$counters, $activeCounter]) =>
			$activeCounter
				? $counters.filter(c => c.counter_name === $activeCounter)
				: $counters
	);

	const counterNames = derived(counterStore, $counters =>
		[...new Set($counters.map(c => c.counter_name).filter(Boolean))]
	);

	let open = false;

	function setCounter(counterName: string) {
		activeCounter.set(counterName);
		open = false;
	}

	function clearCounterFilter() {
		activeCounter.set(null);
		open = false;
	}

	async function fetchQueue() {
		try {
			const res = await fetch('/api/counter/get');
			if (!res.ok) {
				console.error('Failed to fetch counters:', res.status, await res.text());
				return;
			}
			const data = await res.json();
			console.log('Fetched counters:', data);

			const queueMap: Record<string, { nowServing: string; nextNumber: string; company_name: string }> = {};
			for (const q of data) {
				queueMap[q.id] = {
					nowServing: q.now_serving,
					nextNumber: q.next_number,
					company_name: q.company_name || 'Unknown'
				};
			}
			queueNumbersMap.set(queueMap);
			counterStore.set(data);
		} catch (err) {
			console.error('Error fetching counters:', err);
		}
	}

	onMount(() => {
		fetchQueue();
		const interval = setInterval(fetchQueue, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="space-y-4">
	<div class="flex flex-col items-start justify-between md:flex-row md:items-center">
		<div class="text-lg font-semibold">Counter Page</div>

		<div class="mt-4 flex flex-col-reverse gap-2 md:-mb-32 md:mt-0 md:flex-row md:gap-2">
			<DropdownMenu.Root bind:open={open}>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
					<FilterIcon class="mr-2 h-4 w-4" />
					Filter
				</DropdownMenu.Trigger>

				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Filter by Counter</DropdownMenu.Label>
					<DropdownMenu.Separator />

					{#each $counterNames as counterName}
						<DropdownMenu.Item onclick={() => setCounter(counterName)}>
							{counterName}
						</DropdownMenu.Item>
					{/each}

					{#if $activeCounter}
						<DropdownMenu.Separator />
						<DropdownMenu.Item class="text-red-500" onclick={clearCounterFilter}>
							<X class="mr-2 h-4 w-4" />
							Clear Filter
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<NewCounterModal />
		</div>
	</div>

	<DataTable filterKey="counter_name" columns={counter} data={$filteredCounters} />
</div>