<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { reportSchema } from '$lib/zod-schema';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { PlusCircleIcon } from 'lucide-svelte';

	const form = superForm(defaults(zod(reportSchema)), {
		validators: zodClient(reportSchema),
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'failure') {
				toast.error('Failed to generate report.');
			} else if (result.type === 'success') {
				toast.success('Generate reprot successfully!');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<div class="md:-mb-32 md:px-4">
	<Dialog.Root>
		<Dialog.Trigger>
			<Button><PlusCircleIcon class="mt-0.5" />Report Info</Button>
		</Dialog.Trigger>

		<Dialog.Content class="max-w-xl">
			<Dialog.Header class="text-start">
				<Dialog.Title>Generate Report</Dialog.Title>
				<Dialog.Description>generate report here.</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<form method="POST" use:enhance action="?/login">
					<div class="grid gap-4 py-4">
						<Form.Field {form} name="title">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">Title</Label>
										<Input
											{...props}
											bind:value={$formData.title}
											placeholder="Enter title"
											class="col-span-3"
										/>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>

						<Form.Field {form} name="subtitle">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">Subtitle</Label>
										<Input
											{...props}
											bind:value={$formData.subtitle}
											placeholder="Enter subtitle"
											class="col-span-3"
										/>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>

						<Form.Field {form} name="startDate">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">From Date</Label>
										<Input
											{...props}
											bind:value={$formData.startDate}
											placeholder="Enter from start date"
											class="col-span-3"
											type="date"
										/>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>

						<Form.Field {form} name="endDate">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">From Date</Label>
										<Input
											{...props}
											bind:value={$formData.endDate}
											placeholder="Enter from end date"
											class="col-span-3"
											type="date"
										/>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>

						<Form.Field {form} name="preparedBy">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">Prepared By</Label>
										<Input
											{...props}
											bind:value={$formData.subtitle}
											placeholder="Enter prepared by"
											class="col-span-3"
										/>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>

						<Form.Field {form} name="eventType">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">Event Type</Label>
										<Select.Root type="single" bind:value={$formData.eventType} name={props.name}>
											<Select.Trigger {...props} class="col-span-3">
												{$formData.eventType ? $formData.eventType : 'Select an event type'}
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="Flag Raising" label="Flag Raising" />
												<Select.Item value="Flag Retreat" label="Flag Retreat" />
											</Select.Content>
										</Select.Root>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>

						<Form.Field {form} name="positionPrepared">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">Position (Prepared By)</Label>
										<Input
											{...props}
											bind:value={$formData.subtitle}
											placeholder="Enter position of prepared by"
											class="col-span-3"
										/>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>

						<Form.Field {form} name="positionNoted">
							<Form.Control>
								{#snippet children({ props })}
									<div class="grid grid-cols-4 items-center gap-4">
										<Label class="text-right">Position (Noted By)</Label>
										<Input
											{...props}
											bind:value={$formData.positionNoted}
											placeholder="Enter position of noted by"
											class="col-span-3"
										/>
									</div>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors class="flex justify-end " />
						</Form.Field>
					</div>
				</form>
			</div>
			<Dialog.Footer>
				<Button type="submit">Generate</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
