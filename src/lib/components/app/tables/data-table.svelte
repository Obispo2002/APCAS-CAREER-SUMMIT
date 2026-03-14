<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		type PaginationState,
		type ColumnFiltersState,
		type RowSelectionState,
		getCoreRowModel,
		getPaginationRowModel,
		getFilteredRowModel
	} from '@tanstack/table-core';

	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Empty from '$lib/components/ui/empty';
	import { FilePlus } from 'lucide-svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		filterKey: string;
	};

	let { columns, data, filterKey }: DataTableProps<TData, TValue> = $props();

	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: 15
	});

	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});

	function updateState<T>(state: T, updater: T | ((prev: T) => T)) {
		return typeof updater === 'function' ? updater(state) : updater;
	}

	const table = createSvelteTable({
		get data() {
			return data;
		},

		columns,

		/* Prevent pagination reset when data updates */
		autoResetPageIndex: false,
		autoResetAll: false,

		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),

		onPaginationChange: (u) => (pagination = updateState(pagination, u)),
		onColumnFiltersChange: (u) => (columnFilters = updateState(columnFilters, u)),
		onRowSelectionChange: (u) => (rowSelection = updateState(rowSelection, u)),

		state: {
			get pagination() {
				return pagination;
			},
			get columnFilters() {
				return columnFilters;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});

	/* Prevent empty page when rows are deleted */
	$effect(() => {
		const pageCount = table.getPageCount();
		if (pagination.pageIndex >= pageCount && pageCount > 0) {
			pagination.pageIndex = pageCount - 1;
		}
	});
</script>

{#if data.length === 0}
	<Empty.Root class="border border-dashed">
		<Empty.Header>
			<Empty.Media>
				<FilePlus class="h-8 w-8 text-gray-500" />
			</Empty.Media>
			<Empty.Title>No Existing Data</Empty.Title>
			<Empty.Description>
				You must create a new data first.
			</Empty.Description>
		</Empty.Header>
		<Empty.Content />
	</Empty.Root>
{:else}
	<div class="rounded-md border px-4">

		<div class="flex items-center py-4">
			<Input
				placeholder="Search..."
				value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ''}
				oninput={(e) =>
					table.getColumn(filterKey)?.setFilterValue(e.currentTarget.value)}
				class="max-w-sm"
			/>
		</div>

		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as group (group.id)}
					<Table.Row>
						{#each group.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>

			<Table.Body>
				{#each table.getRowModel().rows as row (row.original.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
						<FlexRender
							content={cell.column.columnDef.cell}
							context={cell.getContext()}
						/>
						</Table.Cell>
					{/each}
					</Table.Row>
				{:else}
					<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">
						No results.
					</Table.Cell>
					</Table.Row>
				{/each}
				</Table.Body>
		</Table.Root>

		<div class="flex items-center justify-between py-4">

			<div class="flex items-center space-x-2 text-sm text-muted-foreground">
				<span>Rows per page</span>

				<select
					class="h-8 rounded-md border bg-background px-2 text-sm"
					value={pagination.pageSize}
					onchange={(e) => table.setPageSize(Number(e.currentTarget.value))}
				>
					<option value="10">10</option>
					<option value="15">15</option>
					<option value="20">20</option>
					<option value="30">30</option>
					<option value="50">50</option>
				</select>
			</div>

			<div class="flex items-center space-x-4">

				<div class="text-sm text-muted-foreground">
					Page {pagination.pageIndex + 1} of {table.getPageCount()}
				</div>

				<div class="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onclick={table.previousPage}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>

					<Button
						variant="outline"
						size="sm"
						onclick={table.nextPage}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>

			</div>

		</div>
	</div>
{/if}