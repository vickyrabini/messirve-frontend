export type ExportCell = string | Date

export type ExportColumn<Row> = {
  header: string
  width: number
  value: (row: Row) => ExportCell
}

export const toExportTable = <Row>(columns: ExportColumn<Row>[], rows: Row[]): ExportCell[][] =>
  rows.map((row) => columns.map((column) => column.value(row)))
