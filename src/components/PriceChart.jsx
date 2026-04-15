import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'

const BAR_INTERVAL = 10 // seconds

export default function PriceChart({ ticker }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const currentBarRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#16213e' },
        textColor: '#aaa',
      },
      grid: {
        vertLines: { color: '#1e3050' },
        horzLines: { color: '#1e3050' },
      },
      width: containerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#2a3a5c',
      },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#4caf50',
      downColor: '#f44336',
      wickUpColor: '#4caf50',
      wickDownColor: '#f44336',
      borderVisible: false,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    chartRef.current = chart
    seriesRef.current = series

    const resizeObserver = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      chart.applyOptions({ width })
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!ticker || !seriesRef.current) return

    const price = ticker.priceRaw
    const now = Math.floor(Date.now() / 1000)
    const barTime = Math.floor(now / BAR_INTERVAL) * BAR_INTERVAL

    const bar = currentBarRef.current

    if (bar && bar.time === barTime) {
      // Update current bar
      bar.high = Math.max(bar.high, price)
      bar.low = Math.min(bar.low, price)
      bar.close = price
    } else {
      // Start a new bar
      currentBarRef.current = {
        time: barTime,
        open: price,
        high: price,
        low: price,
        close: price,
      }
    }

    seriesRef.current.update({ ...currentBarRef.current })
  }, [ticker])

  return <div ref={containerRef} className="chart-container" />
}
