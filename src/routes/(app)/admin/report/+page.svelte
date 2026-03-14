<!-- <script lang="ts">
	import DataTable from '$lib/components/app/tables/data-table.svelte';
	import { cluster } from '$lib/components/app/tables/columns';
	import GenerateReportModal from '$lib/components/app/admin/report/generate-report-modal.svelte';
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="text-lg font-semibold">Generate Report</div>

		<GenerateReportModal />
	</div>
	<DataTable filterKey="name" columns={cluster} />
</div> -->
<script lang="ts">
  let submitted = false;

</script>

<div class="flex min-h-screen flex-col items-center justify-center text-center px-4">
  <div class="mb-8">
    <div class="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
      <span class="text-white text-2xl font-bold">🚀</span>
    </div>
  </div>
  <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
    Coming Soon
  </h1>
  <p class="text-lg sm:text-xl text-gray-600 mb-8">
    We're working hard to launch something amazing. Stay tuned!
  </p>
  {#if !submitted}
    <form class="flex flex-col sm:flex-row items-center gap-4">
      <button
        type="submit"
        class="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow hover:bg-primary/90 transition-colors duration-200"
      >
        Notify Me
      </button>
    </form>
  {:else}
    <p class="text-green-600 font-semibold">Thank you! We'll keep you updated.</p>
  {/if}

  <!-- Footer -->
  <p class="mt-12 text-sm text-gray-400">
    &copy; {new Date().getFullYear()} APCAS-EPILA. All rights reserved.
  </p>
</div>