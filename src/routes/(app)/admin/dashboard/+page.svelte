<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { LayoutDashboardIcon, Building2Icon, SunIcon, MoonIcon } from 'lucide-svelte';
	import { derived, writable } from 'svelte/store';

	let { data } = $props();

	let counters = writable(data.counters ?? []);
	let users = writable(data.users ?? []);

	let totalCounters = derived(counters, ($counters) => $counters.length);
	let totalCluster = derived(users, ($users) => $users.length);
</script>

<div class="flex justify-between items-center mb-4">
	<h1 class="text-2xl font-semibold">Dashboard</h1>
</div>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
	<Card.Root class="flex items-center border-l-8 border-l-primary px-6 py-4">
		<div class="flex items-center gap-4">
			<div class="rounded-full bg-primary p-4 flex-shrink-0">
				<LayoutDashboardIcon class="h-8 w-8 text-white" />
			</div>
			<Card.Content>
				<Card.Title class="text-2xl font-bold">{$totalCounters}</Card.Title>
				<Card.Description>Total Counters</Card.Description>
			</Card.Content>
		</div>
	</Card.Root>

	<Card.Root class="flex items-center border-l-8 border-l-primary px-6 py-4">
		<div class="flex items-center gap-4">
			<div class="rounded-full bg-primary p-4 flex-shrink-0">
				<Building2Icon class="h-8 w-8 text-white" />
			</div>
			<Card.Content>
				<Card.Title class="text-2xl font-bold">{$totalCluster}</Card.Title>
				<Card.Description>Total Cluster</Card.Description>
			</Card.Content>
		</div>
	</Card.Root>
</div>