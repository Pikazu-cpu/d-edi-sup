import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Public e-commerce pages
import Home from './pages/Public/Home'
import ProductDetail from './pages/Public/ProductDetail'
import Cart from './pages/Public/Cart'
import Checkout from './pages/Public/Checkout'

// Admin pages
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminProducts from './pages/Admin/AdminProducts'
import AdminProductForm from './pages/Admin/AdminProductForm'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminAnalytics from './pages/Admin/AdminAnalytics'

// Protected Route component for admin
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public e-commerce routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <AdminProducts />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <AdminProtectedRoute>
                <AdminProductForm />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <AdminProtectedRoute>
                <AdminProductForm />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrders />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminProtectedRoute>
                <AdminAnalytics />
              </AdminProtectedRoute>
            }
          />
          
          {/* Redirect old dashboard routes to admin */}
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/products" element={<Navigate to="/admin/products" replace />} />
          <Route path="/orders" element={<Navigate to="/admin/orders" replace />} />
          
          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App