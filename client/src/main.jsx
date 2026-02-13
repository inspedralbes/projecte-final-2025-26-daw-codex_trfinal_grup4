import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '4rem' }}>
      <h1>🚀 TFG - Frontend</h1>
      <p>El entorno de desarrollo está funcionando correctamente.</p>
      <p style={{ color: '#888' }}>React + Vite + HMR</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
