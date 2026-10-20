import { toExportTable, type ExportCell, type ExportColumn } from './types'

const SEPARATOR = ';'
const LINE_BREAK = '\r\n'
const BOM = '﻿'

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

// Protege contra CSV injection: Excel interpreta como fórmula lo que empieza con = + - @
const neutralizeFormula = (text: string) => (/^[=+\-@]/.test(text) ? `'${text}` : text)

const escapeCell = (cell: ExportCell) => {
  const text = neutralizeFormula(cell instanceof Date ? formatDate(cell) : cell)
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv<Row>(columns: ExportColumn<Row>[], rows: Row[]): string {
  const lines = [columns.map((column) => column.header), ...toExportTable(columns, rows)].map((line) =>
    line.map(escapeCell).join(SEPARATOR)
  )
  return BOM + lines.join(LINE_BREAK) + LINE_BREAK
}
