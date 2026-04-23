import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const ClientApp = lazy(() => import('clientApp/App'));
const AdminApp = lazy(() => import('adminApp/App'));

const Fallback = () => <div className="min-h-screen flex items-center justify-center text-pink-400 animate-pulse text-lg">Loading...</div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<Fallback />}><ClientApp /></Suspense></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<Fallback />}><ClientApp /></Suspense></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><Suspense fallback={<Fallback />}><ClientApp /></Suspense></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><Suspense fallback={<Fallback />}><AdminApp /></Suspense></AdminRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
