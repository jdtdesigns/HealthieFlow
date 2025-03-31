export function getColumnNames(): string[] {
  let column_names = localStorage.getItem('column_names')

  if (column_names) {
    return JSON.parse(column_names)
  }

  const default_names = ['Todo', 'Doing', 'Done']
  localStorage.setItem('column_names', JSON.stringify(default_names))

  return default_names
}

export function updateColumnName(index: number, newValue: string) {
  const column_names = getColumnNames()

  column_names[index] = newValue
}