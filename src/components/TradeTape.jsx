import { useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, colorSchemeDarkBlue } from 'ag-grid-community'

const darkTheme = themeQuartz.withPart(colorSchemeDarkBlue)

export default function TradeTape({ matches }) {
  const columnDefs = useMemo(() => [
    { field: 'time', headerName: 'Time', width: 110 },
    {
      field: 'price',
      headerName: 'Price',
      width: 130,
      enableCellChangeFlash: true,
      cellClassRules: {
        'price-up': p => p.data.side === 'buy',
        'price-down': p => p.data.side === 'sell',
      },
    },
    { field: 'size', headerName: 'Size', width: 130 },
    {
      field: 'side',
      headerName: 'Side',
      width: 80,
      cellStyle: p => ({
        color: p.value === 'buy' ? '#4caf50' : '#f44336',
        fontWeight: 600,
        textTransform: 'uppercase',
      }),
    },
  ], [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), [])

  const getRowId = useCallback(p => String(p.data.id), [])

  return (
    <div className="grid-container" style={{ height: 300 }}>
      <AgGridReact
        theme={darkTheme}
        rowData={matches}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        animateRows={false}
      />
    </div>
  )
}
