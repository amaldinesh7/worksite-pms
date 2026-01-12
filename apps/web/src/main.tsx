import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { initAuthMutations } from '@worksite/data';
import { request } from './lib/api';

import App from './App';
import './index.css';
import './styles/globals.css';

// Initialize auth mutations with the API request function
initAuthMutations(request);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      retry: false, // Don't retry failed requests
    },
    mutations: {
      retry: false, // Don't retry failed mutations
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
