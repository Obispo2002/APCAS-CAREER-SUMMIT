// ticket.ts
import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * Generates a PDF with tickets for a counter
 * @param counterName - counter_name
 * @param company - company name
 * @param outputPath - path to save PDF
 * @param ticketCount - number of tickets to generate, default 500
 */
export function generateTicketsPDF(
	counterName: string,
	company: string,
	outputPath: string,
	ticketCount = 500
): Promise<void> {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ size: 'A4', margin: 20 });
		const stream = fs.createWriteStream(outputPath);
		doc.pipe(stream);

		const ticketsPerPage = 6;
		const cols = 2;
		const rows = 3;

		const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
		const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

		const cellWidth = pageWidth / cols;
		const cellHeight = pageHeight / rows;

		let pageTicketIndex = 0; // counter for tickets on current page

		doc.addPage(); // start with first page

		for (let i = 0; i < ticketCount; i++) {
			// Start a new page every 6 tickets
			if (pageTicketIndex >= ticketsPerPage) {
				doc.addPage();
				pageTicketIndex = 0;
			}

			const col = pageTicketIndex % cols;
			const row = Math.floor(pageTicketIndex / cols);

			const x = doc.page.margins.left + col * cellWidth;
			const y = doc.page.margins.top + row * cellHeight;

			const ticketNumber = String(i + 1).padStart(4, '0');
			const ticketCode = `${company.toUpperCase()}_${ticketNumber}`;

			// Draw ticket box
			doc.rect(x + 5, y + 5, cellWidth - 10, cellHeight - 10).stroke();

			// Draw ticket info inside the box
			const padding = 10;
			doc.fontSize(16).text(ticketCode, x + padding, y + 20, {
				width: cellWidth - 2 * padding,
				align: 'center',
			});
			doc.fontSize(10).text(`Counter: ${counterName}`, x + padding, y + 50, {
				width: cellWidth - 2 * padding,
				align: 'center',
			});
			doc.fontSize(10).text(`Company: ${company}`, x + padding, y + 65, {
				width: cellWidth - 2 * padding,
				align: 'center',
			});

			pageTicketIndex++;
		}

		doc.end();

		stream.on('finish', () => {
			console.log(`PDF generated at: ${outputPath}`);
			resolve();
		});
		stream.on('error', (err) => reject(err));
	});
}