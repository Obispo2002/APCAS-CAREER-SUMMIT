import ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';

export async function exportReportToExcel(reportData: any[], allEmployees: any[]) {
	const workbook = new ExcelJS.Workbook();

	// Load images into buffers
	const phrmoLogoBuffer = await fetch('/img/phrmo-logo.png').then((res) => res.arrayBuffer());
	const bataanLogoBuffer = await fetch('/img/1bataan-logo.png').then((res) => res.arrayBuffer());

	// Add images to the workbook
	const phrmoLogo = workbook.addImage({
		buffer: phrmoLogoBuffer,
		extension: 'png'
	});
	const bataanLogo = workbook.addImage({
		buffer: bataanLogoBuffer,
		extension: 'png'
	});

	// Combine all employees with attendance data
	const mergedData = allEmployees.map((employee) => {
		const attendance = reportData.find((row) => row.fullName === employee.fullName);
		return {
			fullName: employee.fullName,
			acronym: employee.acronym,
			totalEvents: attendance?.totalEvents ?? 0,
			totalAttended: attendance?.totalAttended ?? 0,
			totalLate: attendance?.totalLate ?? 0
		};
	});

	// Group merged data by office
	const officeGroups = mergedData.reduce(
		(acc, row) => {
			const office = row.acronym || 'Unknown Office';
			if (!acc[office]) acc[office] = [];
			acc[office].push(row);
			return acc;
		},
		{} as Record<string, any[]>
	);

	// Create worksheets dynamically for each office
	Object.keys(officeGroups).forEach((acronym) => {
		const worksheet = workbook.addWorksheet(acronym);

		worksheet.addImage(phrmoLogo, {
			tl: { col: 1, row: 1 },
			ext: { width: 64, height: 64 }
		});
		worksheet.addImage(bataanLogo, {
			tl: { col: 5, row: 1 },
			ext: { width: 64, height: 64 }
		});

		// Merge cells and set main title
		worksheet.mergeCells('A1:F1');
		const cellA1 = worksheet.getCell('A1');
		cellA1.font = { color: { argb: 'FFFFFF' } };

		// Set report title
		worksheet.mergeCells('A2:F2');
		const cellA2 = worksheet.getCell('A2');
		cellA2.value = `ATTENDANCE & TARDINESS REPORT`;
		cellA2.font = { bold: true, size: 14 };
		cellA2.alignment = { horizontal: 'center', vertical: 'middle' };

		worksheet.getRow(2).height = 60;

		// Display the acronym (office name) in A3
		worksheet.mergeCells('A3:F3');
		worksheet.getCell('A3').value = `Office: ${acronym}`;
		worksheet.getCell('A3').font = { italic: true, size: 12 };
		worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

		// Define headers for each worksheet
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
				key: 'acronym',
				width: 15,
				style: {
					alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
				}
			},
			{
				header: 'No. of Events Attended',
				key: 'totalEvents',
				width: 15,
				style: {
					alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
				}
			},
			{
				header: 'No. of Attendance',
				key: 'totalAttended',
				width: 15,
				style: {
					alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
				}
			},
			{
				header: 'No. of Late',
				key: 'totalLate',
				width: 15,
				style: {
					alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
				}
			}
		];

		// Populate the header row in row 4
		const headerRow = worksheet.getRow(5);
		headerRow.height = 60;
		worksheet.columns.forEach((col, index) => {
			const cell = headerRow.getCell(index + 1);
			cell.value = typeof col.header === 'string' ? col.header : '';
			cell.font = { bold: true };
			cell.alignment = { horizontal: 'left', vertical: 'middle' };
		});

		headerRow.eachCell((cell) => {
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'D3D3D3' }
			};

			cell.font = {
				bold: true
			};

			cell.alignment = {
				horizontal: 'center',
				vertical: 'middle',
				wrapText: true
			};

			cell.border = {
				top: { style: 'thin', color: { argb: '000000' } },
				left: { style: 'thin', color: { argb: '000000' } },
				bottom: { style: 'thin', color: { argb: '000000' } },
				right: { style: 'thin', color: { argb: '000000' } }
			};
		});

		// Populate rows with merged data
		officeGroups[acronym].forEach((row, index) => {
			worksheet.addRow({
				no: index + 1,
				fullName: row.fullName,
				acronym: row.acronym ?? 'N/A',
				totalEvents: row.totalEvents ?? 0,
				totalAttended: row.totalAttended ?? 0,
				totalLate: row.totalLate ?? 0
			});
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
	FileSaver.saveAs(blob, `Attendance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
