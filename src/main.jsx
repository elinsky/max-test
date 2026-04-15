import React from 'react'
import ReactDOM from 'react-dom/client'
import { AllCommunityModule } from 'ag-grid-community'
import { AgGridProvider } from 'ag-grid-react'
import App from './App.jsx'
import './index.css'

const modules = [AllCommunityModule]

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AgGridProvider modules={modules}>
      <App />
    </AgGridProvider>
  </React.StrictMode>,
)
