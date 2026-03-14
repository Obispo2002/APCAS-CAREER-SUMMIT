<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { PlusCircleIcon } from 'lucide-svelte';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { counterSchemaClient } from '$lib/zod-schema';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';

	let open = false;
	const form = superForm(defaults(zod(counterSchemaClient)), {
		validators: zodClient(counterSchemaClient),
		resetForm: false,
		onResult({ result, form }) {
			if (result.type === 'failure') {
				toast.error('Failed to add counter.');
			} else if (result.type === 'success') {
				invalidate('refetch:counter'); 
				open = false;
				toast.success('Counter added successfully!');
				form.reset(); 
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<div class="md:-mb-32 md:px-4">
	<Dialog.Root bind:open>
		<div class="flex gap-2">
			<Dialog.Trigger>
				<Button><PlusCircleIcon class="mt-0.5" /> Add Counter</Button>
			</Dialog.Trigger>
		</div>

		<Dialog.Content class="inline-block w-auto p-6 bg-white rounded-lg shadow-lg">
			<Dialog.Header class="text-start mb-4">
				<Dialog.Title>New Counter</Dialog.Title>
				<Dialog.Description>Add a new Counter here.</Dialog.Description>
			</Dialog.Header>

			<form action="?/createCounter" use:enhance method="POST" class="grid gap-4">
				<Form.Field {form} name="counter_name">
					<Form.Control>
						{#snippet children({ props })}
							<div class="grid grid-cols-4 items-center gap-4">
								<Label class="text-right">Counter Name</Label>
								<Input
									{...props}
									bind:value={$formData.counter_name}
									placeholder="Enter counter name"
									class="col-span-3"
								/>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="flex justify-end" />
				</Form.Field>
				<Form.Field {form} name="company">
					<Form.Control>
						{#snippet children({ props })}
							<div class="grid grid-cols-4 items-center gap-4">
								<Label class="text-right">Company</Label>
								<Input
									{...props}
									bind:value={$formData.company}
									placeholder="Enter company name"
									class="col-span-3"
								/>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="flex justify-end" />
				</Form.Field>

				<Dialog.Footer class="mt-4 flex justify-end">
					<Form.Button type="submit">Add Counter</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>