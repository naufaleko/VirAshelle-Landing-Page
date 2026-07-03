/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './lib/AdminContext';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
