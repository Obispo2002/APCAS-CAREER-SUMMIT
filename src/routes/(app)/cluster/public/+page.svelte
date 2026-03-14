<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { setupQZ, connectQZ, disconnectQZ, printToThermal } from '$lib/qz/qz';
  import { toast } from 'svelte-sonner';
  import { Building2, Printer, Monitor, WifiOff } from 'lucide-svelte';

  let counters: {
    id: string;
    counter_name: string;
    company_name: string;
    last_printed_ticket?: string;
    now_serving?: string;
  }[] = [];

  let selectedCounter: {
    id: string;
    counter_name: string;
    company_name: string;
  } | null = null;

  let ticketCode = '';
  let dialogOpen = false;
  let isLoading = false;
  let isPrinting = false;
  let qzConnected = false;
  let fetchInterval: NodeJS.Timeout;

  const REFRESH_INTERVAL = 5000;
  const PRINTER_NAME = import.meta.env.VITE_PRINTER_NAME || 'APCAS';

  const fetchCounters = async () => {
    try {
      const res = await fetch('/api/counter/get');
      if (!res.ok) throw new Error('Failed to fetch counters');
      const data = await res.json();

      counters = data.map((c: any) => ({
        id: c.id,
        counter_name: c.counter_name,
        company_name: c.company || 'Unknown',
        last_printed_ticket: c.last_printed_ticket,
        now_serving: c.now_serving
      }));
    } catch (err) {
      console.error('Failed to fetch counters:', err);
    }
  };

  const initializeQZ = async () => {
    setupQZ();
    try {
      await connectQZ();
      qzConnected = true;
    } catch (err) {
      console.error('QZ Tray connection failed:', err);
      qzConnected = false;
      toast.error('Printer service not connected. Please ensure QZ Tray is running.');
    }
  };

  function openDialog(counter: { id: string; counter_name: string; company_name: string }) {
    if (!qzConnected) {
      toast.error('Printer service not connected');
      return;
    }
    selectedCounter = counter;
    dialogOpen = true;
  }

 async function printTicket() {
  if (!selectedCounter || isPrinting) return;

  if (!qzConnected) {
    toast.error('Cannot print: Printer not connected.');
    return;
  }

  isPrinting = true;

  try {
    const res = await fetch('/api/print-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counterId: selectedCounter.id }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to generate ticket');
    }

    const { ticketCode: newTicketCode, data, counterId } = await res.json();

    await printToThermal(PRINTER_NAME, data);

    ticketCode = newTicketCode;
    counters = counters.map(c =>
      c.id === counterId ? { ...c, last_printed_ticket: newTicketCode } : c
    );

    toast.success(`Ticket ${newTicketCode} printed successfully`);
    dialogOpen = false;

  } catch (err: any) {
    console.error('Printing failed:', err);
    toast.error(err.message || 'Failed to print ticket');
  } finally {
    isPrinting = false;
  }
}

  onMount(async () => {
    isLoading = true;
    await fetchCounters();
    await initializeQZ();
    fetchInterval = setInterval(fetchCounters, REFRESH_INTERVAL);
    isLoading = false;
  });

  onDestroy(() => {
    if (fetchInterval) clearInterval(fetchInterval);
    disconnectQZ().catch(console.error);
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold flex items-center gap-2">
      <Printer class="w-6 h-6 text-black" />
      Print Ticket
    </h2>

    {#if !qzConnected}
      <span class="text-sm text-yellow-600 flex items-center gap-1">
        <WifiOff class="w-4 h-4"/>
        Printer offline
      </span>
    {/if}
  </div>

  {#if isLoading}
    <div class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  {:else if counters.length === 0}
    <div class="text-center py-8 text-gray-500">No counters available</div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {#each counters as counter}
        <button
          class="p-5 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 hover:border-blue-500 transition text-left"
          onclick={() => openDialog(counter)}
          disabled={!qzConnected}
          class:opacity-50={!qzConnected}
        >
          <div class="flex items-center gap-2 mb-1">
            <Building2 class="w-5 h-5 text-gray-600"/>
            <h2 class="text-xl font-bold text-gray-900">{counter.company_name}</h2>
          </div>
          <div class="flex items-center gap-2">
            <Monitor class="w-4 h-4 text-green-600"/>
            <h3 class="text-md font-semibold text-green-600">{counter.counter_name}</h3>
          </div>
          <p class="text-sm text-gray-500 mt-2">Click to print ticket</p>
        </button>
      {/each}
    </div>
  {/if}

  {#if ticketCode}
    <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p class="text-green-700 font-semibold">
        Last ticket printed: {ticketCode}
      </p>
    </div>
  {/if}
</div>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/40" />
    <Dialog.Content class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg w-80">
      <Dialog.Title class="text-xl font-bold mb-4 flex items-center gap-2">
        <Printer class="w-5 h-5"/>
        Print Ticket
      </Dialog.Title>

      <Dialog.Description class="mb-4 space-y-2">
        <div class="flex items-center gap-2 text-lg font-bold">
          <Building2 class="w-5 h-5 text-gray-600"/>
          {selectedCounter?.company_name}
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <Monitor class="w-4 h-4"/>
          Counter: <span class="font-semibold">{selectedCounter?.counter_name}</span>
        </div>
        <p class="text-base text-gray-700 italic mt-2">
          Note: One ticket per student. Each ticket is valid for only one transaction.
        </p>
      </Dialog.Description>

      <div class="flex justify-end gap-2">
        <Dialog.Close asChild>
          <Button variant="outline" disabled={isPrinting}>Cancel</Button>
        </Dialog.Close>

        <Button onclick={printTicket} disabled={isPrinting || !qzConnected} class="flex items-center gap-2">
          <Printer class="w-4 h-4"/>
          {isPrinting ? 'Printing...' : 'Print'}
        </Button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>