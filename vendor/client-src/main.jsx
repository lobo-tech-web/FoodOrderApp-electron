import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './main.css';

// ---- TRAEMOS TODOS LOS PROVIDERS DEL CONTEXT ----
import { LobotechThemeProvider } from '@/context/ThemeContext.jsx';
import { AppProviders } from './AppProviders.jsx';
// --------------------------------------------------

const Root = () => (
  <React.StrictMode>
    <BrowserRouter>
      <LobotechThemeProvider>
        <AppProviders>
          <App />
        </AppProviders>
      </LobotechThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
