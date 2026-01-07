import React from 'react';
import ReactDOM from 'react-dom/client';
import { TamaguiProvider } from '@worksite/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TamaguiProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </TamaguiProvider>
  </React.StrictMode>
);
