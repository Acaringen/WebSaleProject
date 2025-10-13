'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, Heart, Star, ShoppingBag, LogOut, Package } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { productService, Product } from '../services/productService'
import Link from 'next/link'

export default function Storefront() {
  const [searchTerm, setSearchTerm] = useState('')
  const { state, addToCart } = useCart()
  const { customer, logout, isAuthenticated } = useAuth()
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ürünleri yükle
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const products = await productService.getFeaturedProducts(8)
        setFeaturedProducts(products)
      } catch (err) {
        setError('Ürünler yüklenirken hata oluştu')
        console.error('Featured products error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  const categories = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Home & Garden', icon: '🏠' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Books', icon: '📚' },
    { name: 'Beauty', icon: '💄' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">WebSale</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/favorites" className="p-2 text-gray-400 hover:text-gray-500 relative" title="Favoriler">
                <Heart className="h-6 w-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="p-2 text-gray-400 hover:text-gray-500 relative" title="Sepet">
                <ShoppingCart className="h-6 w-6" />
                {state.cart && state.cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.cart.totalItems}
                  </span>
                )}
              </Link>
              
              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Merhaba, {customer?.name}</span>
                  <div className="flex items-center space-x-1">
                    <Link href="/orders" className="p-2 text-gray-400 hover:text-gray-500" title="Siparişlerim">
                      <Package className="h-6 w-6" />
                    </Link>
                    <button 
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-gray-500" 
                      title="Çıkış Yap"
                    >
                      <LogOut className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="p-2 text-gray-400 hover:text-gray-500" title="Giriş Yap">
                  <User className="h-6 w-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Shop the latest trends at unbeatable prices
            </p>
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Öne Çıkan Ürünler</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Ürünler yükleniyor...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz ürün eklenmemiş</h3>
              <p className="text-gray-600">Admin panelinden ürün ekleyerek başlayın!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      {product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling!.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: product.images.length > 0 ? 'none' : 'flex' }}>
                        <span className="text-gray-400">Ürün Görseli</span>
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <button 
                      onClick={() => {
                        if (isFavorite(product.id)) {
                          removeFromFavorites(product.id)
                        } else {
                          addToFavorites({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images?.[0],
                            description: product.description,
                            category: product.category
                          })
                        }
                      }}
                      className={`absolute top-2 right-2 p-1 rounded-full shadow-sm transition-colors ${
                        isFavorite(product.id) 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      </div>
                      <button 
                        className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={state.loading}
                        onClick={() => {
                          const imageUrl = product.images?.[0];
                          // Eğer resim base64 formatındaysa direkt kullan, değilse placeholder kullan
                          const finalImageUrl = imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) 
                            ? imageUrl 
                            : 'https://via.placeholder.com/150x150?text=Ürün';
                          addToCart(product.id, product.name, product.price, 1, finalImageUrl);
                        }}
                      >
                        {state.loading ? 'Ekleniyor...' : 'Sepete Ekle'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ShoppingBag className="h-6 w-6 text-primary-400" />
                <span className="ml-2 text-xl font-bold">WebSale</span>
              </div>
              <p className="text-gray-400">
                Your one-stop shop for amazing products at great prices.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Electronics</a></li>
                <li><a href="#" className="hover:text-white">Clothing</a></li>
                <li><a href="#" className="hover:text-white">Home & Garden</a></li>
                <li><a href="#" className="hover:text-white">Sports</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WebSale. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
