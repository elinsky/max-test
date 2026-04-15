import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = 'wss://ws-feed.exchange.coinbase.com'

const PRODUCTS = [
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD',
  'AVAX-USD', 'LINK-USD', 'ADA-USD', 'XRP-USD',
]

export function useCoinbaseWebSocket() {
  const [tickers, setTickers] = useState({})
  const [matches, setMatches] = useState([])
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [status, setStatus] = useState('disconnected')

  const wsRef = useRef(null)
  const tickersRef = useRef({})
  const matchesRef = useRef([])
  const orderBookRef = useRef({ bids: new Map(), asks: new Map() })
  const reconnectTimeoutRef = useRef(null)
  const orderBookThrottleRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')

      // Subscribe to ticker for all products, level2_batch + matches for BTC-USD
      ws.send(JSON.stringify({
        type: 'subscribe',
        product_ids: PRODUCTS,
        channels: [
          'ticker',
          { name: 'level2_batch', product_ids: ['BTC-USD'] },
          { name: 'matches', product_ids: ['BTC-USD'] },
        ],
      }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'ticker':
          handleTicker(data)
          break
        case 'snapshot':
          handleL2Snapshot(data)
          break
        case 'l2update':
          handleL2Update(data)
          break
        case 'match':
        case 'last_match':
          handleMatch(data)
          break
      }
    }

    ws.onclose = () => {
      setStatus('disconnected')
      reconnectTimeoutRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  function handleTicker(data) {
    const prev = tickersRef.current[data.product_id]
    const price = parseFloat(data.price)
    const direction = prev ? (price > prev.priceRaw ? 'up' : price < prev.priceRaw ? 'down' : prev.direction) : ''

    tickersRef.current = {
      ...tickersRef.current,
      [data.product_id]: {
        productId: data.product_id,
        priceRaw: price,
        price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        open24h: parseFloat(data.open_24h),
        high24h: parseFloat(data.high_24h),
        low24h: parseFloat(data.low_24h),
        volume24h: parseFloat(data.volume_24h),
        bestBid: parseFloat(data.best_bid).toFixed(2),
        bestAsk: parseFloat(data.best_ask).toFixed(2),
        change24h: ((price - parseFloat(data.open_24h)) / parseFloat(data.open_24h) * 100).toFixed(2),
        side: data.side,
        direction,
      },
    }
    setTickers({ ...tickersRef.current })
  }

  function handleL2Snapshot(data) {
    const bids = new Map()
    const asks = new Map()
    for (const [price, size] of data.bids) {
      bids.set(price, parseFloat(size))
    }
    for (const [price, size] of data.asks) {
      asks.set(price, parseFloat(size))
    }
    orderBookRef.current = { bids, asks }
    flushOrderBook()
  }

  function handleL2Update(data) {
    for (const [side, price, size] of data.changes) {
      const map = side === 'buy' ? orderBookRef.current.bids : orderBookRef.current.asks
      const sizeNum = parseFloat(size)
      if (sizeNum === 0) {
        map.delete(price)
      } else {
        map.set(price, sizeNum)
      }
    }
    // Throttle order book state updates to every 200ms
    if (!orderBookThrottleRef.current) {
      orderBookThrottleRef.current = setTimeout(() => {
        flushOrderBook()
        orderBookThrottleRef.current = null
      }, 200)
    }
  }

  function flushOrderBook() {
    const { bids, asks } = orderBookRef.current
    const sortedBids = [...bids.entries()]
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .slice(0, 15)
      .map(([price, size]) => ({ price, size, total: size }))
    const sortedAsks = [...asks.entries()]
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .slice(0, 15)
      .map(([price, size]) => ({ price, size, total: size }))

    // Calculate cumulative totals
    for (let i = 1; i < sortedBids.length; i++) {
      sortedBids[i].total = sortedBids[i - 1].total + sortedBids[i].size
    }
    for (let i = 1; i < sortedAsks.length; i++) {
      sortedAsks[i].total = sortedAsks[i - 1].total + sortedAsks[i].size
    }

    setOrderBook({ bids: sortedBids, asks: sortedAsks })
  }

  function handleMatch(data) {
    const match = {
      id: data.trade_id,
      time: new Date(data.time).toLocaleTimeString(),
      price: parseFloat(data.price).toFixed(2),
      size: parseFloat(data.size).toFixed(6),
      side: data.side,
      productId: data.product_id,
    }
    matchesRef.current = [match, ...matchesRef.current.slice(0, 199)]
    setMatches([...matchesRef.current])
  }

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimeoutRef.current)
      clearTimeout(orderBookThrottleRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { tickers, matches, orderBook, status, products: PRODUCTS }
}
