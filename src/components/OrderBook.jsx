import { useMemo } from 'react'

export default function OrderBook({ orderBook }) {
  const maxTotal = useMemo(() => {
    const maxBid = orderBook.bids.length ? orderBook.bids[orderBook.bids.length - 1].total : 0
    const maxAsk = orderBook.asks.length ? orderBook.asks[orderBook.asks.length - 1].total : 0
    return Math.max(maxBid, maxAsk) || 1
  }, [orderBook])

  return (
    <div className="order-book">
      <div className="ob-header">
        <span>Price (USD)</span>
        <span>Size (BTC)</span>
        <span>Total</span>
      </div>

      <div className="ob-asks">
        {[...orderBook.asks].reverse().map((level) => (
          <div key={level.price} className="ob-row ask">
            <div
              className="ob-bar ask-bar"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="ob-price price-down">{parseFloat(level.price).toFixed(2)}</span>
            <span>{level.size.toFixed(4)}</span>
            <span>{level.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      <div className="ob-spread">
        {orderBook.asks[0] && orderBook.bids[0] && (
          <>Spread: ${(parseFloat(orderBook.asks[0].price) - parseFloat(orderBook.bids[0].price)).toFixed(2)}</>
        )}
      </div>

      <div className="ob-bids">
        {orderBook.bids.map((level) => (
          <div key={level.price} className="ob-row bid">
            <div
              className="ob-bar bid-bar"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="ob-price price-up">{parseFloat(level.price).toFixed(2)}</span>
            <span>{level.size.toFixed(4)}</span>
            <span>{level.total.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
