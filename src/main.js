import './styles/base.css';
import './styles/components.css';
import { initApp } from './app/init.js';

const root = document.getElementById('app');
if (!root) {
  throw new Error('Root-Element #app wurde nicht gefunden.');
}

void initApp(root);
