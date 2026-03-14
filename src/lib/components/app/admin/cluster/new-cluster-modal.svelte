<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { PlusCircleIcon } from 'lucide-svelte';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { clusterSchema } from '$lib/zod-schema';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { clusterStore } from '$lib/stores/clusterStore';

	let open = false;

	const form = superForm(defaults(zod(clusterSchema)), {
		validators: zodClient(clusterSchema),
		resetForm: false,
		onResult({ result }) {
    if (result.type === 'failure') {
        toast.error('Failed to add cluster account.');
    } else if (result.type === 'success') {
        const data = result.data.user;
        clusterStore.add({
            id: data.id,
            username: data.username,
            cluster_name: data.cluster_name,
            role: data.role
        });

        invalidate('refetch:employees');
        open = false;
        toast.success('Cluster account added successfully!');
    }
}
	});

	const { form: formData, enhance } = form;
</script>

<div class="md:-mb-32 md:px-4">
	<Dialog.Root bind:open>
		<div class="flex gap-2">
			<Dialog.Trigger>
				<Button><PlusCircleIcon class="mt-0.5" /> Add Cluster Account</Button>
			</Dialog.Trigger>
		</div>

		<Dialog.Content class="inline-block w-auto p-6 bg-white rounded-lg shadow-lg">
			<Dialog.Header class="text-start mb-4">
				<Dialog.Title>New Cluster</Dialog.Title>
				<Dialog.Description>Add a new cluster account here.</Dialog.Description>
			</Dialog.Header>

			<form action="?/employee" use:enhance method="POST" class="grid gap-4">
				<!-- Cluster Name -->
				<Form.Field {form} name="cluster_name">
					<Form.Control>
						{#snippet children({ props })}
							<div class="grid grid-cols-4 items-center gap-4">
								<Label class="text-right">Cluster Name</Label>
								<Input
									{...props}
									bind:value={$formData.cluster_name}
									placeholder="Enter cluster name"
									class="col-span-3"
								/>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="flex justify-end" />
				</Form.Field>

				<!-- Password -->
				<Form.Field {form} name="hashed_password">
					<Form.Control>
						{#snippet children({ props })}
							<div class="grid grid-cols-4 items-center gap-4">
								<Label class="text-right">Password</Label>
								<Input
									{...props}
									bind:value={$formData.hashed_password}
									type="password"
									placeholder="Enter password"
									class="col-span-3"
								/>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="flex justify-end" />
				</Form.Field>

				<Dialog.Footer class="mt-4 flex justify-end">
					<Form.Button type="submit">Add Cluster</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>