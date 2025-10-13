'use client'

import { useState, useEffect } from 'react'
import { Plus, Package, ShoppingCart, Users, DollarSign, TrendingUp, Edit, Trash2, Search, Bell, Settings as SettingsIcon, LogOut, BarChart3, Activity, Star, Eye, ClipboardList } from 'lucide-react'
import ProductModal from '../components/ProductModal'
import OrderManagement from '../components/OrderManagement'
import CustomerManagement from '../components/CustomerManagement'
import Settings from '../components/Settings'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'
import { productService, Product } from '../services/productService'
import { dashboardService, DashboardStats, RecentActivity } from '../services/dashboardService'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [statsLoading, setStatsLoading] = useState(false)

  const stats = [
    { 
      name: 'Total Products', 
      value: dashboardStats?.totalProducts?.toString() || '0', 
      icon: Package, 
      change: '+0%', 
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    { 
      name: 'Total Orders', 
      value: dashboardStats?.totalOrders?.toString() || '0', 
      icon: ShoppingCart, 
      change: `${dashboardStats?.ordersGrowth || 0}%`, 
      changeType: (dashboardStats?.ordersGrowth || 0) >= 0 ? 'positive' : 'negative',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100'
    },
    { 
      name: 'Total Customers', 
      value: dashboardStats?.totalCustomers?.toString() || '0', 
      icon: Users, 
      change: `${dashboardStats?.customersGrowth || 0}%`, 
      changeType: (dashboardStats?.customersGrowth || 0) >= 0 ? 'positive' : 'negative',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    { 
      name: 'Revenue', 
      value: `$${dashboardStats?.totalRevenue?.toLocaleString() || '0'}`, 
      icon: DollarSign, 
      change: `${dashboardStats?.revenueGrowth || 0}%`, 
      changeType: (dashboardStats?.revenueGrowth || 0) >= 0 ? 'positive' : 'negative',
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100'
    },
  ]

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: BarChart3 },
    { name: 'Products', id: 'products', icon: Package },
    { name: 'Orders', id: 'orders', icon: ClipboardList },
    { name: 'Customers', id: 'customers', icon: Users },
    { name: 'Settings', id: 'settings', icon: SettingsIcon },
  ]

  // Ürünleri yükle
  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await productService.getProducts(
        1, 
        50, 
        selectedCategory || undefined, 
        searchTerm || undefined
      )
      setProducts(response.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürünler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Ürün sil
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    
    try {
      await productService.deleteProduct(id)
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürün silinirken hata oluştu')
    }
  }

  // Modal işlemleri
  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    loadProducts()
  }

  // Products tab'ına geçildiğinde ürünleri yükle
  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts()
    }
  }, [activeTab, selectedCategory, searchTerm])

  // Component mount olduğunda da ürünleri yükle (stats için)
  useEffect(() => {
    loadProducts()
  }, [])

  // Dashboard stats'ı yükle
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setStatsLoading(true)
      try {
        const stats = await dashboardService.getDashboardStats()
        setDashboardStats(stats)
        
        const activity = await dashboardService.getRecentActivity()
        setRecentActivity(activity)
      } catch (error) {
        console.error('Dashboard stats yüklenirken hata:', error)
        // Mock data kullan
        setDashboardStats(dashboardService.getMockStats())
        setRecentActivity(dashboardService.getMockRecentActivity())
      } finally {
        setStatsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
        {/* Logo Section */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                WebSale Admin
              </h1>
              <p className="text-sm text-gray-500">Management Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-[1.01]'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@websale.com'}</p>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                title="Ayarlar"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {navigation.find(nav => nav.id === activeTab)?.icon && 
                    (() => {
                      const Icon = navigation.find(nav => nav.id === activeTab)!.icon
                      return (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      )
                    })()
                  }
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent capitalize">
                {navigation.find(nav => nav.id === activeTab)?.name}
              </h2>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'dashboard' && 'Overview of your business metrics'}
                      {activeTab === 'products' && 'Manage your product catalog'}
                      {activeTab === 'orders' && 'Track and manage orders'}
                      {activeTab === 'customers' && 'Customer relationship management'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* Action Button */}
                {activeTab === 'products' && (
                  <button 
                    onClick={handleAddProduct}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="font-medium">Yeni Ürün</span>
                  </button>
                )}
                {activeTab !== 'products' && (
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105">
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="font-medium">Add New</span>
              </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
                  <p className="text-blue-100 text-lg">Here's what's happening with your business today.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div 
                      key={stat.name} 
                      className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                          <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                      <div className="flex items-center">
                            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              stat.changeType === 'positive' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <TrendingUp className={`h-3 w-3 mr-1 ${
                                stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                              }`} />
                              {stat.change}
                            </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                    <Activity className="h-5 w-5 text-gray-400" />
                </div>
                  <div className="space-y-4">
                    {[
                      { 
                        icon: ShoppingCart, 
                        text: "New order #1234 received", 
                        time: "2 minutes ago", 
                        color: "bg-emerald-500",
                        bgColor: "bg-emerald-50"
                      },
                      { 
                        icon: Package, 
                        text: "Product \"Wireless Headphones\" updated", 
                        time: "5 minutes ago", 
                        color: "bg-blue-500",
                        bgColor: "bg-blue-50"
                      },
                      { 
                        icon: Users, 
                        text: "New customer registered", 
                        time: "10 minutes ago", 
                        color: "bg-purple-500",
                        bgColor: "bg-purple-50"
                      },
                      { 
                        icon: Star, 
                        text: "Product review received", 
                        time: "15 minutes ago", 
                        color: "bg-amber-500",
                        bgColor: "bg-amber-50"
                      }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/40 transition-colors duration-200">
                        <div className={`w-10 h-10 ${activity.bgColor} rounded-xl flex items-center justify-center`}>
                          <activity.icon className={`h-5 w-5 ${activity.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    ))}
                      </div>
                    </div>

                {/* Quick Actions */}
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { 
                        name: "Add Product", 
                        icon: Plus, 
                        color: "from-blue-500 to-blue-600",
                        action: () => handleAddProduct()
                      },
                      { 
                        name: "View Orders", 
                        icon: ShoppingCart, 
                        color: "from-emerald-500 to-emerald-600",
                        action: () => setActiveTab('orders')
                      },
                      { 
                        name: "Customers", 
                        icon: Users, 
                        color: "from-purple-500 to-purple-600",
                        action: () => setActiveTab('customers')
                      },
                      { 
                        name: "Analytics", 
                        icon: BarChart3, 
                        color: "from-amber-500 to-amber-600",
                        action: () => {}
                      }
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`bg-gradient-to-r ${action.color} p-4 rounded-xl text-white hover:shadow-lg hover:scale-105 transition-all duration-200 group`}
                      >
                        <action.icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <p className="text-sm font-medium">{action.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* Filtreler */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, SKU, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="md:w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                    >
                      <option value="">All Categories</option>
                      {productService.getCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ürün Listesi */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="px-8 py-6 border-b border-white/20 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Products</h3>
                        <p className="text-sm text-gray-600">{products?.length || 0} total products</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg transition-colors">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 m-6 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 font-bold text-sm">!</span>
                      </div>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="p-16 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto"></div>
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
                    <p className="text-sm text-gray-400">This won't take long</p>
                  </div>
                ) : !products || products.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No products yet</h4>
                    <p className="text-gray-600 mb-6">Get started by adding your first product to the catalog</p>
                    <button 
                      onClick={handleAddProduct}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">
                            Product
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            SKU
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Price
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th className="px-8 py-4 text-right text-sm font-semibold text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(products || []).map((product, index) => (
                          <tr 
                            key={product.id} 
                            className="hover:bg-white/60 transition-colors duration-200 group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  {product.images.length > 0 ? (
                                    <img 
                                      className="h-12 w-12 rounded-xl object-cover shadow-md" 
                                      src={product.images[0]} 
                                      alt={product.name}
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkMyMy4zMTM3IDI2IDI2IDIzLjMxMzcgMjYgMjBDMjYgMTYuNjg2MyAyMy4zMTM3IDE0IDIwIDE0QzE2LjY4NjMgMTQgMTQgMTYuNjg2MyAxNCAyMEMxNCAyMy4zMTM3IDE2LjY4NjMgMjYgMjAgMjZaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='
                                      }}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.brand}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">
                                {product.sku}
                              </span>
                            </td>
                            <td className="px-6 py-6">
                              <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-6">
                              <span className="text-lg font-bold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-6">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                product.isActive 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                  product.isActive ? 'bg-emerald-500' : 'bg-red-500'
                                }`}></div>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
              </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <OrderManagement />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement />
          )}

          {activeTab === 'settings' && (
            <Settings />
          )}
        </main>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        product={selectedProduct}
      />
      </div>
    </ProtectedRoute>
  )
}
