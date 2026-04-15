import { useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, colorSchemeDarkBlue } from 'ag-grid-community'

const darkTheme = themeQuartz.withPart(colorSchemeDarkBlue)

export default function PriceGrid({ tickers }) {
  const rowData = useMemo(() => Object.values(tickers), [tickers])

  const columnDefs = useMemo(() => [
    {
      field: 'productId',
      headerName: 'Pair',
      width: 120,
      cellStyle: { fontWeight: 600 },
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 140,
      enableCellChangeFlash: true,
      cellClassRules: {
        'price-up': p => p.data.direction === 'up',
        'price-down': p => p.data.direction === 'down',
      },
    },
    {
      field: 'change24h',
      headerName: '24h %',
      width: 100,
      enableCellChangeFlash: true,
      valueFormatter: p => p.value ? `${p.value}%` : '',
      cellClassRules: {
        'price-up': p => parseFloat(p.value) > 0,
        'price-down': p => parseFloat(p.value) < 0,
      },
    },
    {
      field: 'high24h',
      headerName: '24h High',
      width: 140,
      valueFormatter: p => p.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      field: 'low24h',
      headerName: '24h Low',
      width: 140,
      valueFormatter: p => p.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      field: 'volume24h',
      headerName: '24h Volume',
      width: 150,
      valueFormatter: p => p.value?.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    },
    { field: 'bestBid', headerName: 'Bid', width: 120, enableCellChangeFlash: true },
    { field: 'bestAsk', headerName: 'Ask', width: 120, enableCellChangeFlash: true },
  ], [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), [])

  const getRowId = useCallback(p => p.data.productId, [])

  return (
    <div className="grid-container" style={{ height: 290 }}>
      <AgGridReact
        theme={darkTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        animateRows={false}
      />
    </div>
  )
}
