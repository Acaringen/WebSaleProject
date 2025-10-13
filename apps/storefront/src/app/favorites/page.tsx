'use client'

import { useState } from 'react'
import { useFavorites } from '../../contexts/FavoritesContext'
import { useAuth } from '../../contexts/AuthContext'
import { Heart, ArrowLeft, ShoppingCart, Trash2, Star } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '../../contexts/CartContext'

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemoveFromFavorites = async (productId: string) => {
    setRemovingId(productId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    removeFromFavorites(productId)
    setRemovingId(null)
  }

  const handleAddToCart = (product: any) => {
    addToCart(product, 1)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yapın</h1>
          <p className="text-gray-600 mb-6">Favorilerinizi görüntülemek için giriş yapmanız gerekiyor.</p>
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
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Favorilerim</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Favori ürününüz yok</h2>
            <p className="text-gray-600 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek burada görüntüleyebilirsiniz.</p>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Favorilerim ({favorites.length})
              </h1>
              <button
                onClick={clearFavorites}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Tümünü Temizle
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Resim Yok</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        ₺{product.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Sepete Ekle</span>
                      </button>
                      
                      <button
                        onClick={() => handleRemoveFromFavorites(product.id)}
                        disabled={removingId === product.id}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Favorilerden Çıkar"
                      >
                        {removingId === product.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
