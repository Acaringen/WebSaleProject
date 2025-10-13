'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus, X, ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'
import CheckoutModal from '../../components/CheckoutModal'

export default function CartPage() {
  const { state, updateQuantity, removeFromCart } = useCart()
  const { customer, isAuthenticated } = useAuth()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string>('')

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setIsUpdating(productId)
    try {
      await updateQuantity(productId, newQuantity)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(productId)
    try {
      await removeFromCart(productId)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleOrderSuccess = (newOrderId: string) => {
    setOrderId(newOrderId)
    setShowOrderSuccess(true)
    // Sepeti temizle
    if (state.cart) {
      state.cart.items.forEach(item => {
        removeFromCart(item.productId)
      })
    }
    // 3 saniye sonra success mesajını kapat
    setTimeout(() => {
      setShowOrderSuccess(false)
    }, 5000)
  }

  if (state.loading && !state.cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Sepet yükleniyor...</p>
        </div>
      </div>
    )
  }

  const isEmpty = !state.cart || state.cart.items.length === 0

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-300 hover:text-white">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Alışverişe Devam Et
              </Link>
            </div>
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-2xl font-bold text-white">WebSale</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Sepetim</h1>

        {isEmpty ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-gray-500 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Sepetiniz boş</h2>
            <p className="text-gray-400 mb-8">Harika ürünlerimizi keşfetmek için alışverişe başlayın!</p>
            <Link 
              href="/"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Sepetinizdeki Ürünler ({state.cart?.totalItems || 0} ürün)
                  </h2>
                  
                  <div className="space-y-4">
                    {state.cart?.items?.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-600 rounded-lg bg-gray-700">
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-300 text-sm">Ürün</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{item.productName}</h3>
                          <p className="text-gray-300">${item.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1 text-gray-300 hover:text-white disabled:opacity-50"
                            disabled={isUpdating === item.productId}
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="px-3 py-1 border border-gray-500 rounded text-center min-w-[50px] text-white bg-gray-600">
                            {item.quantity}
                          </span>
                          
                          <button
                            className="p-1 text-gray-300 hover:text-white disabled:opacity-50"
                            disabled={isUpdating === item.productId}
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-white">${item.totalPrice.toFixed(2)}</p>
                        </div>
                        
                        <button
                          className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50"
                          disabled={isUpdating === item.productId}
                          onClick={() => handleRemoveItem(item.productId)}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 sticky top-8">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Sipariş Özeti</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ara Toplam</span>
                      <span className="font-semibold text-white">${(state.cart?.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Kargo</span>
                      <span className="font-semibold text-white">Ücretsiz</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-white">Toplam</span>
                        <span className="text-lg font-semibold text-white">${state.cart?.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                          <button
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                            disabled={state.loading}
                            onClick={() => setShowCheckoutModal(true)}
                          >
                            Siparişi Tamamla
                          </button>
                  
                  <Link 
                    href="/"
                    className="block text-center text-primary-600 hover:text-primary-700 mt-4"
                  >
                    Alışverişe Devam Et
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {state.error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {state.error}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {state.cart && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          cartItems={state.cart.items}
          totalAmount={state.cart.totalAmount}
          customerId={customer?.id || "guest"}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Success Message */}
      {showOrderSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="h-6 w-6 mr-3" />
          <div>
            <p className="font-semibold">Siparişiniz Oluşturuldu!</p>
            <p className="text-sm">Sipariş No: {orderId}</p>
          </div>
        </div>
      )}
    </div>
  )
}
