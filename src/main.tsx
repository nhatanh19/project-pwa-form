import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Đăng ký Service Worker với cơ chế autoUpdate
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Phiên bản mới của PWA đã sẵn sàng!');
  },
  onOfflineReady() {
    console.log('Ứng dụng đã sẵn sàng chạy Offline 100%!');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
