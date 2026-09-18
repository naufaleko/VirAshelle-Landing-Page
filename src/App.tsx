/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './lib/AdminContext';
import { HomePage } from './pages/HomePage';

// Lazy-load Admin routes
const AdminLayout = lazy(() => import('./admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AuthGuard = lazy(() => import('./admin/AuthGuard').then(m => ({ default: m.AuthGuard })));
const LoginPage = lazy(() => import('./admin/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const OverviewPage = lazy(() => import('./admin/pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const CmsPage = lazy(() => import('./admin/pages/CmsPage').then(m => ({ default: m.CmsPage })));
const ProjectsPage = lazy(() => import('./admin/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./admin/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const InvoicePage = lazy(() => import('./admin/pages/InvoicePage').then(m => ({ default: m.InvoicePage })));

// Lazy-load internal UI Component Showcase
const UIComponentsPage = lazy(() => import('./pages/UIComponentsPage').then(m => ({ default: m.UIComponentsPage })));

function AdminLoadingFallback({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        <div className="text-brand-light text-xs font-mono uppercase tracking-widest">{message}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<HomePage />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={
            <Suspense fallback={<AdminLoadingFallback message="Loading Login..." />}>
              <LoginPage />
            </Suspense>
          } />
          {/* Redirect /login to /admin/login */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <Suspense fallback={<AdminLoadingFallback message="Verifying Admin Access..." />}>
              <AuthGuard />
            </Suspense>
          }>
            <Route element={<AdminLayout />}>
              <Route index element={
                <Suspense fallback={<AdminLoadingFallback message="Loading Overview..." />}>
                  <OverviewPage />
                </Suspense>
              } />
              <Route path="cms" element={
                <Suspense fallback={<AdminLoadingFallback message="Loading CMS Manager..." />}>
                  <CmsPage />
                </Suspense>
              } />
              <Route path="projects" element={
                <Suspense fallback={<AdminLoadingFallback message="Loading Projects..." />}>
                  <ProjectsPage />
                </Suspense>
              } />
              <Route path="projects/:id" element={
                <Suspense fallback={<AdminLoadingFallback message="Loading Project Details..." />}>
                  <ProjectDetailPage />
                </Suspense>
              } />
              <Route path="invoices" element={
                <Suspense fallback={<AdminLoadingFallback message="Loading Invoice Generator..." />}>
                  <InvoicePage />
                </Suspense>
              } />
              <Route path="invoice" element={<Navigate to="/admin/invoices" replace />} />
            </Route>
          </Route>

          {/* Internal UI Lab */}
          <Route path="/UIComponents" element={
            <Suspense fallback={<AdminLoadingFallback message="Loading UI Lab..." />}>
              <UIComponentsPage />
            </Suspense>
          } />
          <Route path="/uicomponents" element={<Navigate to="/UIComponents" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
