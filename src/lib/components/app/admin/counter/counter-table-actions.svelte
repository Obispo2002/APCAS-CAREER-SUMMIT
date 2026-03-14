<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Pencil, Trash2Icon, Ellipsis, LoaderCircle } from 'lucide-svelte';
	import { writable, type Writable } from 'svelte/store';
	import { toast } from 'svelte-sonner';

	type Counter = {
		id: string;
		counter_name: string;
		company: string;
	};

	export let id: string;
	export let counter_name: string;
	export let company: string;
	export let countersStore: Writable<Counter[]> | undefined;

	if (!countersStore) {
		countersStore = writable<Counter[]>([]);
	}

	const dropdownOpen = writable(false);
	const open = writable(false);
	const alertDialogOpen = writable(false);
	const isLoading = writable(false);

	let localCounterName = '';
	let localCompany = '';

	function openUpdateDialog() {
		dropdownOpen.set(false);
		localCounterName = counter_name;
		localCompany = company;
		open.set(true);
	}

	function openDeleteDialog() {
		dropdownOpen.set(false);
		alertDialogOpen.set(true);
	}

	async function fetchCounter(
		url: string,
		formData: FormData,
		onSuccess: (data?: any) => void
	) {
		isLoading.set(true);
		try {
			const res = await fetch(url, { method: 'POST', body: formData });
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json().catch(() => null);
			onSuccess(data);
		} catch (err: any) {
			toast.error(err.message || 'Operation failed.');
		} finally {
			isLoading.set(false);
		}
	}

	function updateCounter() {
		const fd = new FormData();
		fd.append('id', id);
		fd.append('counter_name', localCounterName);
		fd.append('company', localCompany);

		fetchCounter('?/updateCounter', fd, () => {
			if (countersStore) {
				countersStore.update((counters) =>
					counters.map((c) =>
						c.id === id
							? { ...c, counter_name: localCounterName, company: localCompany }
							: c
					)
				);
			}
			open.set(false);
			toast.success('Counter updated successfully!');
		});
	}

	function deleteCounter(counterId: string) {
		const fd = new FormData();
		fd.append('id', counterId);

		fetchCounter('?/deleteCounter', fd, () => {
			if (countersStore) {
				countersStore.update((counters) => counters.filter((c) => c.id !== counterId));
			}
			alertDialogOpen.set(false);
			toast.success('Counter deleted successfully!');
		});
	}
</script>
<DropdownMenu.Root bind:open={$dropdownOpen}>
	<DropdownMenu.Trigger>
		<Button variant="ghost"><Ellipsis /></Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="flex flex-col justify-start">
		<Button variant="ghost" onclick={openUpdateDialog}>
			<Pencil class="mr-2" /> Edit Counter
		</Button>
		<Button variant="ghost" onclick={openDeleteDialog}>
			<Trash2Icon class="mr-2 text-red-500" /> Delete Counter
		</Button>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={$open}>
	<Dialog.Content class="inline-block w-auto p-6 bg-white rounded-lg shadow-lg">
		<Dialog.Header class="text-start mb-4">
			<Dialog.Title>Update Counter</Dialog.Title>
			<Dialog.Description>Update counter information here.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Counter Name</Label>
				<Input bind:value={localCounterName} placeholder="Enter counter name" class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Company</Label>
				<Input bind:value={localCompany} placeholder="Enter company name" class="col-span-3" />
			</div>

			<Dialog.Footer class="mt-4 flex justify-end">
				<Button onclick={updateCounter} disabled={$isLoading}>
					{#if $isLoading}
						<LoaderCircle class="mr-2 animate-spin" /> Updating...
					{:else}
						Update Counter
					{/if}
				</Button>
			</Dialog.Footer>
		</div>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={$alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete this Counter?</AlertDialog.Title>
			<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => alertDialogOpen.set(false)}>Cancel</AlertDialog.Cancel>
			<Button class="bg-red-400 text-white hover:bg-red-500" onclick={() => deleteCounter(id)}>
				{#if $isLoading}
					<LoaderCircle class="mr-2 animate-spin" /> Loading...
				{:else}
					Delete Counter
				{/if}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>