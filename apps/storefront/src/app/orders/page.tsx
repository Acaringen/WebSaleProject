'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, Eye, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  totalPrice: number
  productImage?: string
}

interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: {
    fullName: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
  paymentMethod: string
  status: 'created' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
  notes: string
}

export default function OrdersPage() {
  const { customer, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Siparişleri yükle
  const loadOrders = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    try {
      const response = await fetch('http://localhost:5001/api/orders')
      const data = await response.json()
      
      // Sadece bu müşterinin siparişlerini filtrele
      const customerOrders = data.orders.filter((order: Order) => 
        order.customerId === customer?.id
      )
      
      setOrders(customerOrders)
    } catch (err) {
      setError('Siparişler yüklenirken hata oluştu')
      console.error('Load orders error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    loadOrders()
  }, [isAuthenticated, customer?.id])

  // Her 30 saniyede bir otomatik yenile
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      loadOrders(true)
    }, 30000) // 30 saniye

    return () => clearInterval(interval)
  }, [isAuthenticated, customer?.id])

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      created: {
        label: 'Sipariş Alındı',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        description: 'Siparişiniz alındı ve işleme alındı.'
      },
      approved: {
        label: 'Onaylandı',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        description: 'Siparişiniz onaylandı ve hazırlanıyor.'
      },
      shipped: {
        label: 'Kargoya Verildi',
        color: 'bg-purple-100 text-purple-800',
        icon: Truck,
        description: 'Siparişiniz kargoya verildi.'
      },
      delivered: {
        label: 'Teslim Edildi',
        color: 'bg-emerald-100 text-emerald-800',
        icon: CheckCircle,
        description: 'Siparişiniz teslim edildi.'
      },
      cancelled: {
        label: 'İptal Edildi',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        description: 'Siparişiniz iptal edildi.'
      }
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.created
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yapın</h1>
          <p className="text-gray-600 mb-6">Siparişlerinizi görüntülemek için giriş yapmanız gerekiyor.</p>
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Ana Sayfaya Dön
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">Siparişlerim</span>
              </div>
              <button
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Yenileniyor...' : 'Yenile'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz siparişiniz yok</h2>
            <p className="text-gray-600 mb-6">İlk siparişinizi vermek için alışverişe başlayın.</p>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
            
            <div className="grid gap-6">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Sipariş #{order.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {statusInfo.label}
                          </span>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detayları Gör
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Toplam Tutar</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ₺{order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Ürün Sayısı</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {order.items.length} ürün
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Ödeme</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">
                          <strong>Teslimat Adresi:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city}
                        </p>
                        {order.updatedAt !== order.createdAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Son güncelleme: {formatDate(order.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Sipariş Detayları #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sipariş Durumu</h3>
                  {(() => {
                    const statusInfo = getStatusInfo(selectedOrder.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {statusInfo.label}
                        </span>
                        <p className="text-sm text-gray-600">{statusInfo.description}</p>
                      </div>
                    )
                  })()}
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Edilen Ürünler</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        {item.productImage && (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₺{item.totalPrice.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">₺{item.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Teslimat Adresi</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Toplam Tutar</span>
                    <span className="text-xl font-bold text-gray-900">₺{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
