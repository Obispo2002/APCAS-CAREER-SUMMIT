<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Pencil, Trash2Icon, Ellipsis, LoaderCircle } from 'lucide-svelte';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { updateClusterSchema } from '$lib/zod-schema';
	import { writable } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { clusterStore } from '$lib/stores/clusterStore';

	let { userId } = $props();

	const open = writable(false);
	const alertDialogOpen = writable(false);
	const dropdownOpen = writable(false);
	const isLoading = writable(false);

	const form = superForm(defaults(zod(updateClusterSchema)), {
		validators: zodClient(updateClusterSchema),
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'failure') {
				toast.error('Failed to update cluster.');
				return;
			}

			clusterStore.updateCluster(userId, {
				cluster_name: $formData.cluster_name
			});

			open.set(false);

			toast.success('Cluster updated successfully!');
		}
	});

	const { form: formData, enhance } = form;

	function openUpdateDialog() {
		dropdownOpen.set(false);
		open.set(true);
	}

	function openDeleteDialog() {
		dropdownOpen.set(false);
		alertDialogOpen.set(true);
	}

	async function deleteCluster(userId: string) {
		isLoading.set(true);
		try {
			const response = await fetch('/api/delete/cluster', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId })
			});

			const message = await response.text();

			if (!response.ok) {
			toast.error(message);
			return;
			}
			clusterStore.remove(userId);

			alertDialogOpen.set(false);
			toast.success(message);
		} catch (err) {
			console.error(err);
			toast.error('Unexpected error while deleting cluster.');
		} finally {
			isLoading.set(false);
		}
		}
</script>
<DropdownMenu.Root bind:open={$dropdownOpen}>
	<DropdownMenu.Trigger>
		<Button variant="ghost">
			<Ellipsis />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="flex flex-col justify-start">
		<Button variant="ghost" onclick={openUpdateDialog}>
			<Pencil class="mr-2" /> Edit Cluster
		</Button>
		<Button variant="ghost" onclick={openDeleteDialog}>
			<Trash2Icon class="mr-2 text-red-500" /> Delete Cluster</Button>
	</DropdownMenu.Content>
</DropdownMenu.Root>
<Dialog.Root bind:open={$open}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Update Cluster</Dialog.Title>
			<Dialog.Description>
				Update cluster information here.
			</Dialog.Description>
		</Dialog.Header>
		<form action="?/updateCluster" use:enhance method="POST" class="space-y-4">
			<Form.Field {form} name="cluster_name">
				<Form.Control>
					{#snippet children({ props })}
						<div class="space-y-2">
							<Label>Cluster Name</Label>
							<Input
								{...props}
								bind:value={$formData.cluster_name}
								placeholder="Enter cluster name"
							/>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="hashed_password">
				<Form.Control>
					{#snippet children({ props })}
						<div class="space-y-2">
							<Label>Password</Label>
							<Input
								type="password"
								{...props}
								bind:value={$formData.hashed_password}
								placeholder="Enter new password"
							/>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Input type="hidden" name="userId" value={userId} />

			<Dialog.Footer>
				<Form.Button type="submit">
					Update Cluster
				</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
<AlertDialog.Root bind:open={$alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete this Cluster?</AlertDialog.Title>
			<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => alertDialogOpen.set(false)}>Cancel</AlertDialog.Cancel>
			<Button
				class="bg-red-400 text-white hover:bg-red-500" onclick={() => deleteCluster(userId)}>
				{#if $isLoading}
					<LoaderCircle class="mr-2 animate-spin" />
					Loading...
				{:else}
					Delete Cluster
				{/if}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>