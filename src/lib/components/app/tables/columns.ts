import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table';
import ClusterTableActions from '../admin/cluster/cluster-table-actions.svelte';
import CounterTableActions from '../admin/counter/counter-table-actions.svelte';
import QueueButton from '$lib/components/app/que/QueueButton.svelte';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { writable } from 'svelte/store';
import { queueNumbersMap } from '$lib/stores/queueStore';
import NowServingCell from '$lib/components/app/que/NowServingCell.svelte';

export type Sample = {
	id: string;
	sample: string;
};

export type Report = {
	fullName: string | null;
	acronym: string | null;
	totalEvents: number;
	totalAttended: number;
	totalLate: number;
};

export type Cluster = {
	id: string;
	cluster_name: string | null;
	userName: string | null;
};

export type Counter = {
	id: string;
	user_id: string | null;
	counter_name: string;
	company: string;
};

export type UsersTbl = {
	id: string;
	scanner_id: string;
	user_id: string;
	fullName: string;
	username: string;
	updatedAt: string;
};

export const selectedClusterIds = writable<string[]>([]);
export const selectedCounterIds = writable<string[]>([]);

export const cluster: ColumnDef<Cluster>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate:
					table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => {
					table.toggleAllPageRowsSelected(!!value);

					selectedClusterIds.update((ids) => {
						const allVisibleIds = table
							.getRowModel()
							.rows.map((row) => row.original.id);

						return value
							? Array.from(new Set([...ids, ...allVisibleIds]))
							: ids.filter((id) => !allVisibleIds.includes(id));
					});
				},
				controlledChecked: true,
				'aria-label': 'Select all'
			}),

		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),

				onCheckedChange: (value) => {
					row.toggleSelected(!!value);

					selectedClusterIds.update((ids) =>
						value
							? [...ids, row.original.id]
							: ids.filter((id) => id !== row.original.id)
					);
				},

				controlledChecked: true,
				'aria-label': 'Select row'
			}),

		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'username',
		header: 'Username'
	},

	{
		accessorKey: 'cluster_name',
		header: 'Cluster Name'
	},

	{
		accessorKey: 'role',
		header: 'Role'
	},

	{
		accessorKey: 'id',
		header: '',
		cell: ({ row }) =>
			renderComponent(ClusterTableActions, {
				userId: row.original.id,
				cluster_name: row.original.cluster_name,
				username: row.original.userName,
				data: row.original
			})
	}
];

export const counter: ColumnDef<Counter>[] = [
  // Select Checkbox
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => {
          table.toggleAllPageRowsSelected(!!value);

          selectedCounterIds.update((ids) => {
            const allVisibleIds = table.getRowModel().rows.map((row) => row.original.id);
            return value ? Array.from(new Set([...ids, ...allVisibleIds])) : ids.filter((id) => !allVisibleIds.includes(id));
          });
        },
        controlledChecked: true,
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => {
          row.toggleSelected(!!value);
          selectedCounterIds.update((ids) =>
            value ? [...ids, row.original.id] : ids.filter((id) => id !== row.original.id)
          );
        },
        controlledChecked: true,
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
  },

  // Counter Name
  {
    accessorKey: 'counter_name',
    header: 'Counter Name'
  },

  {
    accessorKey: 'company',
    header: 'Company'
  },
  {
    id: 'nowServing',
    header: 'Now Serving',
    cell: ({ row }) => renderComponent(NowServingCell, { counterId: row.original.id })
  },
   {
    id: 'lastPrinted',
    header: 'Last Printed',
    cell: ({ row }) => row.original.last_printed_ticket ?? '-'
  },
  {
    id: 'queue',
    header: 'Next Queue',
    cell: ({ row }) =>
      renderComponent(QueueButton, {
        queueNumbersMap: row.original.queueNumbersMap,
        counterId: row.original.id
      })
  },
  {
    accessorKey: 'id',
    header: 'Action',
    cell: ({ row }) =>
      renderComponent(CounterTableActions, {
        id: row.original.id,
        counter_name: row.original.counter_name,
        company: row.original.company,
        data: row.original
      })
  }
];

export const report: ColumnDef<Report>[] = [
	{
		accessorKey: 'fullName',
		header: 'Full Name'
	},

	{
		accessorKey: 'acronym',
		header: 'Office Name'
	},

	{
		accessorKey: 'totalEvents',
		header: 'Total Events Attended'
	},

	{
		accessorKey: 'totalAttended',
		header: 'Total Attendance'
	},

	{
		accessorKey: 'totalLate',
		header: 'Total Late'
	}
];