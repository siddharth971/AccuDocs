
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

export class PdfUtil {
  static exportToPdf(data: any[], fileName: string, columns: { header: string; dataKey: string }[], title: string = 'Report') {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.text(`Generated on: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 30);

    // Prepare body
    const body = data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        let value = item[col.dataKey];
        // Format dates
        if (value && (col.dataKey.toLowerCase().includes('date') || col.dataKey.toLowerCase().includes('at'))) {
          if (dayjs(value).isValid()) {
            value = dayjs(value).format('DD/MM/YYYY');
          }
        }
        // Format booleans
        if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No';
        }
        row[col.dataKey] = value;
      });
      return row;
    });

    // Generate Table
    autoTable(doc, {
      head: [columns.map(c => c.header)],
      body: body.map(row => columns.map(c => row[c.dataKey])),
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [79, 70, 229], // Indigo-600
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Gray-50
      },

      // Footer integration (Custom page numbers)
      didDrawPage: (data: any) => {
        // Footer
        const str = 'Page ' + (doc as any).internal.getNumberOfPages();
        doc.setFontSize(10);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    doc.save(`${fileName}_${dayjs().format('YYYY-MM-DD')}.pdf`);
  }
}
