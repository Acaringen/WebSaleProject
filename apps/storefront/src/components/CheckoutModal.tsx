'use client'

import { useState } from 'react'
import { X, CreditCard, MapPin, User, Mail, Phone } from 'lucide-react'
import { CartItem } from '../contexts/CartContext'
import { orderService, CreateOrderRequest, ShippingAddress } from '../services/orderService'
// Harita component'leri kaldırıldı

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  totalAmount: number
  customerId: string
  onOrderSuccess: (orderId: string) => void
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  customerId,
  onOrderSuccess
}: CheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    paymentMethod: 'credit-card'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const shippingAddress: ShippingAddress = {
        fullName: formData.fullName,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone
      }

      const orderData: CreateOrderRequest = {
        customerId,
        customerName: formData.customerName || 'Anonim Müşteri',
        customerEmail: formData.customerEmail,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          productImage: item.productImage
        })),
        totalAmount,
        shippingAddress,
        paymentMethod: formData.paymentMethod === 'credit-card' ? 'Kredi Kartı' : 'Nakit'
      }

      const order = await orderService.createOrder(orderData)
      onOrderSuccess(order.id)
      onClose()
    } catch (error) {
      console.error('Order creation failed:', error)
      alert('Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Harita fonksiyonu kaldırıldı

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Siparişi Tamamla</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Müşteri Bilgileri */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Müşteri Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad Soyad (Opsiyonel)
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-posta (Opsiyonel)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Teslimat Adresi
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adres *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mahalle, Sokak, No"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Şehir *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Şehir"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Posta Kodu *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="34000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0555 123 45 67"
                />
              </div>
            </div>
          </div>

          {/* Ödeme Yöntemi */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Ödeme Yöntemi
            </h3>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="credit-card">Kredi Kartı</option>
              <option value="cash">Kapıda Nakit Ödeme</option>
            </select>
          </div>

          {/* Sipariş Özeti */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Sipariş Özeti</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-gray-300">
                  <span>{item.productName} x {item.quantity}</span>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-gray-600">
                <span>Toplam</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Onayla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
