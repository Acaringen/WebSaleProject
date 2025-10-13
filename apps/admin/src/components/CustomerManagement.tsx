'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, Phone, MapPin, Calendar, DollarSign, ShoppingBag, Search, Filter, Eye, UserCheck, UserX, Shield } from 'lucide-react'
import { customerService, Customer, CustomerStats } from '../services/customerService'

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const loadCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      const [customersData, statsData] = await Promise.all([
        customerService.getCustomers(),
        customerService.getCustomerStats()
      ])
      setCustomers(customersData)
      setStats(statsData)
    } catch (err) {
      setError('Müşteriler yüklenirken hata oluştu')
      console.error('Load customers error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadCustomers()
      return
    }

    setLoading(true)
    try {
      const searchResults = await customerService.searchCustomers(searchQuery)
      setCustomers(searchResults)
    } catch (err) {
      setError('Müşteri arama sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const updateCustomerStatus = async (customerId: string, status: 'active' | 'inactive' | 'blocked') => {
    try {
      await customerService.updateCustomerStatus(customerId, status)
      await loadCustomers()
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null)
      }
    } catch (err) {
      setError('Müşteri durumu güncellenirken hata oluştu')
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'Pasif'
      case 'blocked':
        return 'Engellenmiş'
      default:
        return status
    }
  }

  const filteredCustomers = customers.filter(customer => 
    !statusFilter || customer.status === statusFilter
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h2>
          <p className="text-gray-600">Kayıtlı müşterileri görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={loadCustomers}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bu Ay Yeni</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newCustomersThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ortalama Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="blocked">Engellenmiş</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Müşteriler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={loadCustomers}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Henüz müşteri bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siparişler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Harcama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      {customer.phone && (
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.totalOrders}</div>
                      <div className="text-sm text-gray-500">sipariş</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₺{customer.totalSpent.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {getStatusLabel(customer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Detayları Gör"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {customer.status === 'active' ? (
                          <button
                            onClick={() => updateCustomerStatus(customer.id, 'inactive')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Pasif Yap"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : customer.status === 'inactive' ? (
                          <button
                            onClick={() => updateCustomerStatus(customer.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                            title="Aktif Yap"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateCustomerStatus(customer.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                            title="Engeli Kaldır"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Müşteri Detayları</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <UserX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Kişisel Bilgiler</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{selectedCustomer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">İstatistikler</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Teslim Edilen:</span>
                      <span className="text-sm font-medium text-green-600">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Toplam Harcama:</span>
                      <span className="text-sm font-medium text-green-600">₺{selectedCustomer.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kayıt Tarihi:</span>
                      <span className="text-sm">{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sipariş Durumu Detayları */}
              {selectedCustomer.orderStats && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sipariş Durumu Detayları</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Teslim Edilen</span>
                        <span className="text-lg font-bold text-green-600">{selectedCustomer.orderStats.delivered}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Kargoda</span>
                        <span className="text-lg font-bold text-blue-600">{selectedCustomer.orderStats.shipped}</span>
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-700">İptal</span>
                        <span className="text-lg font-bold text-red-600">{selectedCustomer.orderStats.cancelled}</span>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-700">Onaylandı</span>
                        <span className="text-lg font-bold text-yellow-600">{selectedCustomer.orderStats.approved}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Oluşturuldu</span>
                        <span className="text-lg font-bold text-gray-600">{selectedCustomer.orderStats.created}</span>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-700">Toplam</span>
                        <span className="text-lg font-bold text-purple-600">{selectedCustomer.orderStats.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {selectedCustomer.address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Adres Bilgileri
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedCustomer.address.street}</p>
                    <p className="text-sm text-gray-600">
                      {selectedCustomer.address.city} {selectedCustomer.address.postalCode}
                    </p>
                    <p className="text-sm text-gray-500">{selectedCustomer.address.country}</p>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Durum Yönetimi</h4>
                <div className="flex space-x-3">
                  {selectedCustomer.status !== 'active' && (
                    <button
                      onClick={() => updateCustomerStatus(selectedCustomer.id, 'active')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Aktif Yap
                    </button>
                  )}
                  {selectedCustomer.status !== 'inactive' && (
                    <button
                      onClick={() => updateCustomerStatus(selectedCustomer.id, 'inactive')}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700"
                    >
                      Pasif Yap
                    </button>
                  )}
                  {selectedCustomer.status !== 'blocked' && (
                    <button
                      onClick={() => updateCustomerStatus(selectedCustomer.id, 'blocked')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Engelle
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
