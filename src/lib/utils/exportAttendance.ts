import ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';

export async function exportToExcel(data: any[], eventDetails: { title: string; date: string }) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Attendees');

	// Event details (rows 1 and 2)
	worksheet.mergeCells('A1:E1');
	const cellA1 = worksheet.getCell('A1');
	cellA1.font = { color: { argb: 'FFFFFF' } };

	worksheet.mergeCells('A2:E2');
	worksheet.getCell('A2').value = `Event Title: ${eventDetails.title}`;
	worksheet.getCell('A2').font = { bold: true, size: 14 };
	worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

	worksheet.mergeCells('A3:E3');
	worksheet.getCell('A3').value = `Event Date: ${eventDetails.date}`;
	worksheet.getCell('A3').font = { size: 12 };
	worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

	// Add an empty row after event details (row 3 will be blank)
	worksheet.addRow([]);

	// Define headers in row 5
	worksheet.columns = [
		{
			header: 'No.',
			key: 'no',
			width: 8,
			style: {
				alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
			}
		},
		{
			header: 'Full Name',
			key: 'fullName',
			width: 45,
			style: {
				alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
			}
		},
		{
			header: 'Office Name',
			key: 'officeName',
			width: 45,
			style: {
				alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
			}
		},
		{
			header: 'Office Assign',
			key: 'acronym',
			width: 15,
			style: {
				alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
			}
		},
		{
			header: 'Scan Time',
			key: 'scanTime',
			width: 30,
			style: {
				alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
			}
		}
	];

	// Populate the header row in row 5
	const headerRow = worksheet.getRow(5);
	worksheet.columns.forEach((col, index) => {
		const cell = headerRow.getCell(index + 1);
		cell.value = typeof col.header === 'string' ? col.header : '';
		cell.font = { bold: true };
		cell.alignment = { horizontal: 'center', vertical: 'middle' };
	});

	// Add rows for data, starting from row 6
	data.forEach((row, index) => {
		worksheet.addRow({
			no: index + 1,
			fullName: row.fullName ?? 'N/A',
			officeName: row.officeName ?? 'N/A',
			acronym: row.acronym ?? 'N/A',
			scanTime: row.scanTime ? new Date(row.scanTime).toLocaleString() : 'N/A'
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
	FileSaver.saveAs(blob, `Attendance_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
