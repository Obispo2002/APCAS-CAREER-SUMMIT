<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { queueNumbersMap } from '$lib/stores/queueStore';
  export let counterId: string;
</script>

<Badge
  class="rounded-full bg-green-100 px-2 py-0.5 text-black hover:bg-green-100 focus:bg-green-100 cursor-auto"
>
  {$queueNumbersMap[counterId]?.nowServing ?? '-'}
</Badge>