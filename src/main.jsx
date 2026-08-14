import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexto/AuthContext.jsx'
import { AdminAuthProvider } from './contexto/AdminAuthContext.jsx'
import { SmoothScrollProvider } from './contexto/SmoothScrollContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/sistemabarbearia">
      <SmoothScrollProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
        </AuthProvider>
      </SmoothScrollProvider>
    </BrowserRouter>
  </StrictMode>,
)