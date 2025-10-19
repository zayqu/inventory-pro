import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AuthProvider from './context/AuthContext.jsx'

// Get the root DOM element
const container = document.getElementById('root');

// Create the React root instance
const root = createRoot(container);

// Render the application
root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);