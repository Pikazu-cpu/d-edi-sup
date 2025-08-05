import React from 'react'
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import AdminLayout from '../../components/Layout/AdminLayout'
import StatsCard from '../../components/UI/StatsCard'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { useProducts } from '../../hooks/useProducts'
import { useOrders } from '../../hooks/useOrders'
import { format, subDays, isAfter } from 'date-fns'

export default function AdminDashboard() {
  const { products, loading: productsLoading } = useProducts()
  const { orders, loading: ordersLoading } = useOrders()

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
  const activeCustomers = new Set(orders.map(order => order.user_id)).size
  const lowStockProducts = products.filter(p => !p.in_stock).length
  
  // Recent orders (last 7 days)
  const recentOrders = orders.filter(order => 
    isAfter(new Date(order.created_at), subDays(new Date(), 7))
  )
  
  // Recent revenue
  const recentRevenue = recentOrders.reduce((sum, order) => sum + order.amount, 0)
  const previousWeekRevenue = orders
    .filter(order => 
      isAfter(new Date(order.created_at), subDays(new Date(), 14)) &&
      !isAfter(new Date(order.created_at), subDays(new Date(), 7))
    )
    .reduce((sum, order) => sum + order.amount, 0)

  const revenueChange = previousWeekRevenue > 0 
    ? ((recentRevenue - previousWeekRevenue) / previousWeekRevenue * 100).toFixed(1)
    : '0'

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: ShoppingBagIcon,
      change: { value: `${lowStockProducts} out of stock`, type: lowStockProducts > 0 ? 'decrease' as const : 'increase' as const }
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCartIcon,
      change: { value: `${recentOrders.length} this week`, type: 'increase' as const }
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: { 
        value: `${revenueChange}%`, 
        type: parseFloat(revenueChange) >= 0 ? 'increase' as const : 'decrease' as const 
      }
    },
    {
      title: 'Active Customers',
      value: activeCustomers,
      icon: UserGroupIcon,
      change: { value: 'All time', type: 'increase' as const }
    }
  ]

  const recentOrdersList = orders.slice(0, 5)
  const topProducts = products
    .filter(p => p.featured)
    .slice(0, 5)

  if (productsLoading || ordersLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your e-commerce platform performance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Orders
              </h3>
              {recentOrdersList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrdersList.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">{order.customer_name}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{order.amount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Featured Products
              </h3>
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No featured products</p>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">₹{product.price}</p>
                      </div>
                      <div className="flex items-center">
                        {product.in_stock ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`ml-1 text-xs ${
                          product.in_stock ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="/admin/products/new"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Add New Product
              </a>
              <a
                href="/admin/orders"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View All Orders
              </a>
              <a
                href="/admin/analytics"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View Analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}