
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

export class ExcelUtil {
  static async exportToExcel(data: any[], fileName: string, columns: { header: string; key: string; width?: number }[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Add headers
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }, // Indigo-600
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    // Add data
    data.forEach(item => {
      const rowData: any = {};
      columns.forEach(col => {
        let value = item[col.key];
        // Auto-format dates
        if (value && (col.key.toLowerCase().includes('date') || col.key.toLowerCase().includes('at'))) {
          if (dayjs(value).isValid()) {
            value = dayjs(value).format('DD/MM/YYYY HH:mm');
          }
        }
        // Auto-format booleans
        if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No';
        }
        rowData[col.key] = value;
      });
      worksheet.addRow(rowData);
    });


    // Style data rows (Zebra striping optional, but simple borders here)
    worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        // Apply alternate background
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' } // Gray-50
          };
        }
      }

      row.eachCell((cell: ExcelJS.Cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

    // Generate buffer

    const buffer = await (workbook.xlsx as any).writeBuffer();

    // Save file
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  }
}
