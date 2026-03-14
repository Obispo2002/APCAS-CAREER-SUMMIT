<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Card from '$lib/components/ui/card';
  import { Grid2X2 } from 'lucide-svelte';
  import * as Empty from '$lib/components/ui/empty';
  import { queueNumbersMap } from '$lib/stores/queueStore';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";

  type Counter = {
    id: string;
    counter_name: string;
    company: string;
  };

  let counters: Counter[] = [];
  let isLoading = true;
  const POLL_INTERVAL = 3000;
  let poller: ReturnType<typeof setInterval>;

  async function fetchCounters() {
    const res = await fetch('/api/counter/get');
    if (!res.ok) throw new Error('Failed to fetch counters');

    const data = await res.json();
    if (counters.length === 0) {
      counters = data.map((c: any) => ({
        id: c.id,
        counter_name: c.counter_name ?? '',
        company: c.company ?? ''
      }));
    }
    updateQueueMap(data);
    isLoading = false;
  }

  function updateQueueMap(data: any[]) {
    queueNumbersMap.update((map) => {
      const newMap = { ...map };

      for (const c of data) {
        const dbNowServing = c.now_serving ?? '-';
        const dbNext = c.next_number ?? '-';

        newMap[c.id] = {
          nowServing: dbNowServing,
          nextNumber: dbNext,
          company: c.company ?? ''
        };
      }

      return newMap;
    });
  }
  async function pollQueues() {
    try {
      const res = await fetch('/api/counter/get');
      if (!res.ok) return;
      const data = await res.json();
      updateQueueMap(data); // <-- no counters reassignment
    } catch (err) {
      console.error('Queue polling failed', err);
    }
  }

  onMount(async () => {
    try {
      await fetchCounters();
      poller = setInterval(pollQueues, POLL_INTERVAL);
    } catch (err) {
      console.error(err);
      isLoading = false;
    }
  });

  onDestroy(() => clearInterval(poller));

  function redirectToCounter() {
    goto('/cluster/counter'); 
  }
</script>

{#if isLoading}
  <div class="flex justify-center py-8 px-4">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 w-full max-w-7xl">
      {#each Array(6) as _, i (i)}
        <div class="border rounded-lg shadow-md animate-pulse bg-gray-50 dark:bg-gray-700 p-4">
          <Skeleton class="h-[140px] w-full rounded-xl bg-gray-200 dark:bg-gray-600" />
          <div class="mt-4 space-y-2">
            <Skeleton class="h-4 w-full bg-gray-300 dark:bg-gray-500" />
            <Skeleton class="h-4 w-3/4 bg-gray-300 dark:bg-gray-500" />
          </div>
        </div>
      {/each}
    </div>
  </div>

{:else if counters.length === 0}
  <div class="flex justify-center py-12 px-4">
    <Empty.Root class="border border-dashed w-full max-w-md shadow-md rounded-lg">
      <Empty.Header>
        <Empty.Media>
          <Grid2X2 class="h-10 w-10 text-gray-500" />
        </Empty.Media>
        <Empty.Title>No Counter Yet</Empty.Title>
        <Empty.Description>
          You must create a counter first.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content class="mt-6 flex justify-center">
        <Button variant="default" onclick={redirectToCounter}>
          Create Counter
        </Button>
      </Empty.Content>
    </Empty.Root>
  </div>
{:else}
<div class="flex justify-center py-8 px-4">
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 w-full max-w-7xl">
    {#each counters as counter (counter.id)}
      <Card.Root class="border rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
        <Card.Header class="border-b px-6 py-6 bg-gray-50 dark:bg-gray-800">
          <div class="flex items-center gap-6">
            <div class="rounded-lg bg-primary p-4 flex-shrink-0">
              <Grid2X2 class="h-6 w-6 text-white" />
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-2xl font-semibold">
                {counter.counter_name}
              </span>
              <span class="text-lg ">
                {counter.company}
              </span>
            </div>
          </div>
        </Card.Header>
       <Card.Content class="grid grid-cols-2 divide-x py-8 bg-white dark:bg-gray-900">
        <div class="flex flex-col items-center justify-center px-2">
          <p class="text-sm uppercase font-bold text-muted-foreground tracking-widest">
            Now Serving
          </p>
          <p class="w-full text-center text-primary mt-2 text-[clamp(1rem,2.5vw,1.4rem)] break-words leading-tight">
            {$queueNumbersMap[counter.id]?.nowServing ?? '-'}
          </p>
        </div>
        <div class="flex flex-col items-center justify-center px-2">
          <p class="text-sm uppercase  font-bold text-muted-foreground tracking-widest">
            Next
          </p>
          {#if $queueNumbersMap[counter.id]?.nowServing}
            <p class="w-full text-center text-primary mt-2 text-[clamp(1rem,2.5vw,1.4rem)] break-words leading-tight">
              {(() => {
                const nowServing = $queueNumbersMap[counter.id].nowServing;
                const parts = nowServing.split('_');
                const prefix = parts[0];
                const num = parseInt(parts[1]) || 0;
                return `${prefix}_${String(num + 1).padStart(4, '0')}`;
              })()}
            </p>
          {:else}
            <p class="w-full text-center font-bold text-primary mt-2 text-[clamp(1rem,2.5vw,1.4rem)] break-words leading-tight">
              -
            </p>
          {/if}
        </div>
      </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
{/if}