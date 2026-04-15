import { useCoinbaseWebSocket } from './useCoinbaseWebSocket'
import PriceGrid from './components/PriceGrid.jsx'
import PriceChart from './components/PriceChart.jsx'
import OrderBook from './components/OrderBook.jsx'
import TradeTape from './components/TradeTape.jsx'

function App() {
  const { tickers, matches, orderBook, status } = useCoinbaseWebSocket()

  return (
    <div className="app">
      <header className="header">
        <h1>Crypto Market Monitor</h1>
        <div className={`status ${status}`}>
          {status === 'connected' ? 'Live' :
           status === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </div>
      </header>

      <section className="section">
        <h2>Markets</h2>
        <PriceGrid tickers={tickers} />
      </section>

      <div className="two-col">
        <section className="section">
          <h2>BTC-USD Price</h2>
          <PriceChart ticker={tickers['BTC-USD']} />
        </section>

        <section className="section">
          <h2>BTC-USD Order Book</h2>
          <OrderBook orderBook={orderBook} />
        </section>
      </div>

      <section className="section">
        <h2>BTC-USD Trade Tape</h2>
        <TradeTape matches={matches} />
      </section>
    </div>
  )
}

export default App
