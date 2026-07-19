/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './lib/AdminContext';
import { HomePage } from './pages/HomePage';

// Lazy-load admin dashboard — only downloaded when visiting /admin
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={
            <Suspense fallback={
              <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-brand-light text-sm font-ui uppercase tracking-widest animate-pulse">Loading Dashboard...</div>
              </div>
            }>
              <AdminDashboard />
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
