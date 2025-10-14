'use client'

import { useState, useEffect } from 'react'
import { Package, Eye, CheckCircle, Truck, XCircle, Clock, MapPin, User, Mail, Phone, DollarSign } from 'lucide-react'
import { orderService, Order } from '../services/orderService'
import { emailService } from '../services/emailService'

const statusConfig = {
  created: { 
    label: 'Oluşturuldu', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  approved: { 
    label: 'Onaylandı', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle
  },
  shipped: { 
    label: 'Kargoya Verildi', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck
  },
  delivered: { 
    label: 'Teslim Edildi', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Package
  },
  cancelled: { 
    label: 'İptal Edildi', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
}

const statusFlow = ['created', 'approved', 'shipped', 'delivered']

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.getOrders(statusFilter || undefined)
      setOrders(response.orders)
    } catch (err) {
      setError('Siparişler yüklenirken hata oluştu')
      console.error('Load orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      // Sipariş durumunu güncelle
      await orderService.updateOrderStatus(orderId, { status: newStatus as any, notes })
      
      // Email bildirimi gönder
      const order = orders.find(o => o.id === orderId)
      if (order) {
        await emailService.sendOrderStatusUpdate({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          orderId: order.id,
          orderStatus: newStatus,
          orderItems: order.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: order.totalAmount,
          trackingNumber: newStatus === 'shipped' ? `TRK${Date.now()}` : undefined,
          estimatedDelivery: newStatus === 'shipped' ? 
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR') : undefined
        })
      }
      
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null)
      }
    } catch (err) {
      setError('Sipariş durumu güncellenirken hata oluştu')
      console.error('Update status error:', err)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusActions = (currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus)
    const actions = []

    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1]
      actions.push({
        status: nextStatus,
        label: statusConfig[nextStatus].label,
        color: 'bg-green-600 hover:bg-green-700'
      })
    }

    if (currentStatus !== 'cancelled') {
      actions.push({
        status: 'cancelled',
        label: 'İptal Et',
        color: 'bg-red-600 hover:bg-red-700'
      })
    }

    return actions
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h2>
          <p className="text-gray-600">Siparişleri görüntüleyin ve durumlarını güncelleyin</p>
        </div>
        <button
          onClick={loadOrders}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Yenile
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Durum Filtresi:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tümü</option>
            <option value="created">Oluşturuldu</option>
            <option value="approved">Onaylandı</option>
            <option value="shipped">Kargoya Verildi</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Siparişler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={loadOrders}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Henüz sipariş bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const statusInfo = statusConfig[order.status]
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{order.items.length} ürün</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {getStatusActions(order.status).map((action) => (
                          <button
                            key={action.status}
                            onClick={() => updateOrderStatus(order.id, action.status)}
                            className={`text-white px-3 py-1 rounded text-xs font-medium mr-2 ${action.color}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sipariş Detayları</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sipariş Bilgileri</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sipariş No:</span>
                      <span className="text-sm font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Durum:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status].color}`}>
                        {statusConfig[selectedOrder.status].label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tarih:</span>
                      <span className="text-sm">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ödeme:</span>
                      <span className="text-sm">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Müşteri Bilgileri</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedOrder.customerName}</span>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Teslimat Adresi
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <div className="flex items-center mt-2">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{selectedOrder.shippingAddress.phone}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Sipariş Ürünleri</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">{item.productName}</h5>
                        <p className="text-sm text-gray-600">Miktar: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Toplam: ${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Toplam Tutar:</span>
                  <span className="text-xl font-bold text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Sipariş Durumu Güncelle</h4>
                <div className="flex space-x-3">
                  {getStatusActions(selectedOrder.status).map((action) => (
                    <button
                      key={action.status}
                      onClick={() => updateOrderStatus(selectedOrder.id, action.status)}
                      className={`text-white px-4 py-2 rounded-lg text-sm font-medium ${action.color}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
