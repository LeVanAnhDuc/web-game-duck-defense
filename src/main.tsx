import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './tailwind.css';
import { App } from './ui/App';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found in index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
