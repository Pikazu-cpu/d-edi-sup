import React from 'react'
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@heroicons/react/24/outline'
import AdminLayout from '../../components/Layout/AdminLayout'
import StatsCard from '../../components/UI/StatsCard'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { useProducts } from '../../hooks/useProducts'
import { useOrders } from '../../hooks/useOrders'
import { format, subDays, isAfter, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

export default function AdminAnalytics() {
  const { products, loading: productsLoading } = useProducts()
  const { orders, loading: ordersLoading } = useOrders()

  if (productsLoading || ordersLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
  const totalCustomers = new Set(orders.map(order => order.user_id)).size
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  // Time-based analytics
  const now = new Date()
  const thisWeekStart = startOfWeek(now)
  const thisWeekEnd = endOfWeek(now)
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)

  const thisWeekOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    return orderDate >= thisWeekStart && orderDate <= thisWeekEnd
  })

  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    return orderDate >= thisMonthStart && orderDate <= thisMonthEnd
  })

  const thisWeekRevenue = thisWeekOrders.reduce((sum, order) => sum + order.amount, 0)
  const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.amount, 0)

  // Product analytics
  const inStockProducts = products.filter(p => p.in_stock).length
  const outOfStockProducts = products.filter(p => !p.in_stock).length
  const featuredProducts = products.filter(p => p.featured).length

  // Order status analytics
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Category analytics
  const productsByCategory = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(productsByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Recent performance
  const last7Days = orders.filter(order => 
    isAfter(new Date(order.created_at), subDays(now, 7))
  )
  const previous7Days = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    return orderDate >= subDays(now, 14) && orderDate < subDays(now, 7)
  })

  const recentRevenue = last7Days.reduce((sum, order) => sum + order.amount, 0)
  const previousRevenue = previous7Days.reduce((sum, order) => sum + order.amount, 0)
  const revenueChange = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue * 100) : 0

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: { 
        value: `${revenueChange.toFixed(1)}%`, 
        type: revenueChange >= 0 ? 'increase' as const : 'decrease' as const 
      }
    },
    {
      title: 'This Month Revenue',
      value: `₹${thisMonthRevenue.toLocaleString()}`,
      icon: TrendingUpIcon,
      change: { value: `${thisMonthOrders.length} orders`, type: 'increase' as const }
    },
    {
      title: 'Average Order Value',
      value: `₹${averageOrderValue.toFixed(0)}`,
      icon: ShoppingCartIcon,
      change: { value: `${orders.length} total orders`, type: 'increase' as const }
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: UserGroupIcon,
      change: { value: 'Unique customers', type: 'increase' as const }
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Detailed insights into your e-commerce performance
          </p>
        </div>

        {/* Main Stats */}
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

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Analytics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Product Analytics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBagIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">In Stock Products</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">{inStockProducts}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">Out of Stock</span>
                  </div>
                  <span className="text-lg font-semibold text-red-600">{outOfStockProducts}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">Featured Products</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-600">{featuredProducts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Analytics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Order Status Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 capitalize">{status}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{count}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'delivered' ? 'bg-green-100 text-green-800' :
                        status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {((count / orders.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Top Product Categories
              </h3>
              <div className="space-y-4">
                {topCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {category.replace('-', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">products</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Recent Performance
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">This Week</span>
                    <span className="text-lg font-semibold text-blue-600">
                      ₹{thisWeekRevenue.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{thisWeekOrders.length} orders</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">This Month</span>
                    <span className="text-lg font-semibold text-purple-600">
                      ₹{thisMonthRevenue.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{thisMonthOrders.length} orders</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">7-Day Change</span>
                    <span className={`text-lg font-semibold ${
                      revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Revenue growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}