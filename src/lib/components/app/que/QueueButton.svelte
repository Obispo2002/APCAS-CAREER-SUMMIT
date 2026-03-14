<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { queueNumbersMap, initCounter } from '$lib/stores/queueStore';
  import { onMount } from 'svelte';

  export let counterId: string;
  export let company: string;

  onMount(() => {
    initCounter(counterId, company);
  });

  async function serveNext() {
    if (!queueNumbersMap || typeof queueNumbersMap.update !== 'function') {
      console.error('queueNumbersMap is undefined or not a writable store');
      toast('Queue store is not initialized', { type: 'error' });
      return;
    }

    try {
      const res = await fetch(`/api/counter/${counterId}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const text = await res.text();
        toast(`Failed: ${text}`, { type: 'error' });
        return;
      }

      const updated = await res.json();
      if (!updated || !updated.now_serving) {
        toast('Invalid server response', { type: 'error' });
        console.error('Invalid response:', updated);
        return;
      }

      try {
        queueNumbersMap.update((map) => {
          const prev = map[counterId] || { nowServing: '', nextNumber: '', company };
          return {
            ...map,
            [counterId]: {
              ...prev,
              nowServing: updated.now_serving
            }
          };
        });
      } catch (storeErr) {
        console.error('Failed to update queueNumbersMap:', storeErr);
        toast('Error updating queue store', { type: 'error' });
        return;
      }

      toast(`Now serving ${updated.now_serving}`, { type: 'success' });
    } catch (err) {
      console.error('serveNext error:', err);
      toast('Error updating queue', { type: 'error' });
    }
  }
</script>

<button
  onclick={serveNext}
  class="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow hover:bg-primary/90 active:bg-primary/80 transition-colors duration-200"
>
  Next
</button>