<script lang="ts">
	let { attendance } = $props();
</script>

<span
	class={
		attendance === 'present'
			? 'rounded-full bg-green-100 px-2 py-0.5 text-green-500'
			: attendance === 'late'
			? 'rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-500'
			: 'rounded-full bg-gray-100 px-2 py-0.5 text-gray-500'
	}
>
	{attendance}
</span>
