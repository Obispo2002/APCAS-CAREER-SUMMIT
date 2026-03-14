<script lang="ts">
	import {
		LayoutDashboardIcon,
		Building2Icon,
		FileChartColumnIncreasingIcon,
		ChevronsUpDownIcon,
		UserIcon,
		LogOut,
		KeyRound,
		LaptopMinimal,
		PictureInPicture2
	} from 'lucide-svelte';
	import { Button} from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { defaults } from 'sveltekit-superforms';
	import { changePasswordSchema } from '$lib/zod-schema';
	import { toggleMode } from "mode-watcher";

	let open = false;

	const { form, errors, enhance } = superForm(defaults(zod(changePasswordSchema)), {
		validators: zodClient(changePasswordSchema),
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'failure') {
				toast.error('Failed to change password.');
			} else if (result.type === 'success') {
				toast.success('Password changed successfully!');
				open = false;
			}
		}
	});

	function isActive(href: string): boolean {
		return $page.url.pathname === href;
	}

	const adminItems = [
		{
			title: 'Dashboard',
			url: '/admin/dashboard',
			icon: LayoutDashboardIcon
		},
		{
			title: 'Cluster Account',
			url: '/admin/cluster',
			icon: Building2Icon
		},
		{
			title: 'Generate Report',
			url: '/admin/report',
			icon: FileChartColumnIncreasingIcon
		},
	];

	const userItems = [
		{
			title: 'Dashboard',
			url: '/cluster/dashboard',
			icon: LayoutDashboardIcon
		},
		{
			title: 'Counter',
			url: '/cluster/counter',
			icon: LaptopMinimal
		},
		{
			title: 'Public Queue',
			url: '/cluster/public',
			icon: PictureInPicture2
		},
		{
			title: 'Generate Report',
			url: '/cluster/report',
			icon: FileChartColumnIncreasingIcon
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="  items-center justify-center py-12">
					<img src="/img/image.png" alt="bataan tourism logo" class="-ml-6 h-44 w-auto" />
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#if $page.data.user.role === 'admin'}
						{#each adminItems as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton class="hover:text-none hover:bg-transparent">
									{#snippet child({ props })}
										<a
											href={item.url}
											class={cn(
												'flex items-center space-x-2 rounded-md transition-colors',
												isActive(item.url)
													? 'bg-black text-white '
													: ' text-gray hover:bg-gray-200 '
											)}
										>
											<div {...props}>
												<item.icon />
												<span>{item.title}</span>
											</div>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					{:else if $page.data.user.role === 'user'}
						{#each userItems as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton class="hover:text-none hover:bg-transparent">
									{#snippet child({ props })}
										<a
											href={item.url}
											class={cn(
												'flex items-center space-x-2 rounded-md transition-colors',
												isActive(item.url)
													? 'bg-black text-white '
													: ' text-gray hover:bg-gray-200 '
											)}
										>
											<div {...props}>
												<item.icon />
												<span>{item.title}</span>
											</div>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					{/if}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								class="py-8 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div class="mr-2 rounded-full border p-2">
									<UserIcon class=" h-5 w-5 " />
								</div>
								<div>
									{#if $page.data.user}
										<div>{$page.data.user.role}</div>
										<div>{$page.data.user.username}</div>
									{:else}
										<div>No Role</div>
										<div>Guest</div>
									{/if}
								</div>
								<ChevronsUpDownIcon class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-64 md:w-60">
						<Dialog.Root bind:open>
							<Dialog.Trigger class="flex w-full gap-2">
								<Sidebar.MenuButton class="w-full">
									<KeyRound />
									Change Password
								</Sidebar.MenuButton>
							</Dialog.Trigger>
							<Dialog.Content class="max-w-lg">
								<Dialog.Header>
									<Dialog.Title>Change your password</Dialog.Title>
									<Dialog.Description>
										Type your current password to create a new one
									</Dialog.Description>
								</Dialog.Header>
								<form method="POST" action="/password?/changePassword" use:enhance>
									<div class="grid gap-4 py-4">
										<div class="grid grid-cols-4 items-center gap-4">
											<Label for="currentPassword" class="text-right">Current Password</Label>
											<Input
												id="currentPassword"
												name="currentPassword"
												autocomplete="current-password"
												bind:value={$form.currentPassword}
												class="col-span-3"
											/>
											{#if $errors.currentPassword}
												<div class="col-span-4 text-end text-sm text-red-500">
													{$errors.currentPassword}
												</div>
											{/if}
											<Label for="currentPassword" class="text-right">New Password</Label>
											<Input
												id="newPassword"
												name="newPassword"
												type="password"
												autocomplete="new-password"
												bind:value={$form.newPassword}
												class="col-span-3"
											/>
											{#if $errors.newPassword}
												<div class="col-span-4 text-end text-sm text-red-500">
													{$errors.newPassword}
												</div>
											{/if}
											<Label for="currentPassword" class="text-right">Confirm Password</Label>
											<Input
												id="confirmPassword"
												name="confirmPassword"
												type="password"
												autocomplete="new-password"
												bind:value={$form.confirmPassword}
												class="col-span-3"
											/>
											{#if $errors.confirmPassword}
												<div class="col-span-4 text-end text-sm text-red-500">
													{$errors.confirmPassword}
												</div>
											{/if}
										</div>
									</div>
									<Dialog.Footer>
										<Button type="submit">Save changes</Button>
									</Dialog.Footer>
								</form>
							</Dialog.Content>
						</Dialog.Root>

						<form method="POST" action="/logout">
							<Sidebar.MenuButton>
								<LogOut />Logout
							</Sidebar.MenuButton>
						</form>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
