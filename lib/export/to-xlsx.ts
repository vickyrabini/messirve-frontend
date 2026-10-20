import ExcelJS from 'exceljs'
import { toExportTable, type ExportColumn } from './types'

const DATE_FORMAT = 'dd/mm/yyyy'

// Solo se importa desde route handlers: exceljs no llega al bundle del navegador.
export async function toXlsx<Row>(sheetName: string, columns: ExportColumn<Row>[], rows: Row[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  const table = toExportTable(columns, rows)

  sheet.columns = columns.map((column) => ({ header: column.header, width: column.width }))
  sheet.getRow(1).font = { bold: true }
  sheet.addRows(table)

  columns.forEach((_, index) => {
    if (table[0]?.[index] instanceof Date) sheet.getColumn(index + 1).numFmt = DATE_FORMAT
  })

  return Buffer.from(await workbook.xlsx.writeBuffer())
}
