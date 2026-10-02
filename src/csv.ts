export interface VlanCsvRow {
  vlanId: string
  name: string
  subnet: string
  description: string
}

function escapeCsvField(value: string): string {
  const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(safeValue) ? `"${safeValue.replace(/"/g, '""')}"` : safeValue
}

export function vlanCsv(rows: VlanCsvRow[]): string {
  const header = ['VLAN ID', 'Name', 'Subnet', 'Description']
  const records = rows.map(row => [row.vlanId, row.name, row.subnet, row.description])
  return [header, ...records].map(record => record.map(escapeCsvField).join(',')).join('\r\n')
}
