import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { applyThemeSettings, loadThemeSettings } from '@uny/design-system';
import App from './App';
import { AuthProvider } from './auth';
import './styles-uny.css';
import './styles-app.css';

// Tokens de superfície ficam no CSS (:root + html[data-uny-theme="dark"]).
// Não setar tokensAsCssVars() como inline — isso impede o tema escuro.
applyThemeSettings(loadThemeSettings());

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
