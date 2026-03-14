<script lang="ts">
	import SideBar from '$lib/components/app/side-bar.svelte/side-bar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<SideBar />
	<main class="container">
		<Sidebar.Trigger class="my-6" />
		{@render children?.()}
	</main>
</Sidebar.Provider>
