<script>
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="flex h-screen w-full items-center justify-center bg-white">
	<div class="text-center font-sans">
		<div class="text-9xl mb-6">😢</div>
		<div class="text-4xl font-bold mb-4">404 - Page Not Found</div>
		<div class="text-lg mb-6 text-gray-700">
			The page you're looking for might have been removed or is temporarily unavailable.
		</div>
		<Button href="/">Back to Home</Button>
	</div>
</div>