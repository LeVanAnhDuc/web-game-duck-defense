import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './tailwind.css';
// Nạp TRƯỚC App: bắt ?code của Ducker ID và dọn URL trước khi code game đọc nó.
import '@/auth/session';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found in index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
