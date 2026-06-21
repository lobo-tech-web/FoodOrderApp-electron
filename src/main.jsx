import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource/roboto';
import '@/main.css';
import './renderer.css';
import { AdminDesktopApp } from './AdminDesktopApp.jsx';
import { AdminDesktopProviders } from './providers/AdminDesktopProviders.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AdminDesktopProviders>
        <AdminDesktopApp />
      </AdminDesktopProviders>
    </HashRouter>
  </React.StrictMode>
);
