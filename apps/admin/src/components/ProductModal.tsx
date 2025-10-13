'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, Upload, Image } from 'lucide-react'
import { productService, CreateProductRequest, Product } from '../services/productService'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: Product | null
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    sku: '',
    category: '',
    brand: '',
    images: [],
    attributes: {}
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newAttributeKey, setNewAttributeKey] = useState('')
  const [newAttributeValue, setNewAttributeValue] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        sku: product.sku || '',
        category: product.category || '',
        brand: product.brand || '',
        images: product.images || [],
        attributes: product.attributes || {}
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        sku: '',
        category: '',
        brand: '',
        images: [],
        attributes: {}
      })
    }
    setError(null)
  }, [product, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (product) {
        await productService.updateProduct(product.id, formData)
      } else {
        await productService.createProduct(formData)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [newAttributeKey.trim()]: newAttributeValue.trim()
        }
      }))
      setNewAttributeKey('')
      setNewAttributeValue('')
    }
  }

  const removeAttribute = (key: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes }
      delete newAttributes[key]
      return {
        ...prev,
        attributes: newAttributes
      }
    })
  }

  // Dosyadan resim seçme
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Seçilen dosyaları işleme
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Dosya tipini kontrol et
        if (!file.type.startsWith('image/')) {
          setError('Lütfen sadece resim dosyalarını seçin')
          continue
        }

        // Dosya boyutunu kontrol et (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setError('Resim dosyası 5MB\'dan küçük olmalıdır')
          continue
        }

        // Base64'e çevir (gerçek uygulamada cloud storage kullanılmalı)
        const base64 = await convertToBase64(file)
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64 as string]
        }))
      }
    } catch (err) {
      setError('Resim yüklenirken hata oluştu')
      console.error('File upload error:', err)
    } finally {
      setUploadingImage(false)
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Base64 dönüştürme fonksiyonu
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-sm text-gray-500">
                {product ? 'Update product information' : 'Create a new product for your catalog'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200 transform hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 font-bold text-sm">!</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Temel Bilgiler */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                  placeholder="Enter product name..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                  placeholder="Enter product SKU..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                >
                  <option value="">Select Category</option>
                  {productService.getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                >
                  <option value="">Select Brand</option>
                  {productService.getBrands().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Açıklama ve Görseller */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm resize-none"
                  placeholder="Enter detailed product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Product Images
                </label>
                
                {/* Upload Area */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    {/* File Upload Button */}
                    <button
                      type="button"
                      onClick={handleFileSelect}
                      disabled={uploadingImage}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          Upload from Computer
                        </>
                      )}
                    </button>

                    {/* URL Input */}
                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste image URL..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        disabled={!newImageUrl.trim()}
                        className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Preview Grid */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-md">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA2NUM1Ni42Mjc0IDY1IDYyIDU5LjYyNzQgNjIgNTNDNjIgNDYuMzcyNiA1Ni42Mjc0IDQxIDUwIDQxQzQzLjM3MjYgNDEgMzggNDYuMzcyNiAzOCA1M0MzOCA1OS42Mjc0IDQzLjM3MjYgNjUgNTAgNjVaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 transform hover:scale-110"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Özellikler */}
          <div className="mt-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Product Attributes
            </label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="Attribute name (e.g., Color)"
                value={newAttributeKey}
                onChange={(e) => setNewAttributeKey(e.target.value)}
                className="flex-1 px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
              />
              <input
                type="text"
                placeholder="Attribute value (e.g., Blue)"
                value={newAttributeValue}
                onChange={(e) => setNewAttributeValue(e.target.value)}
                className="flex-1 px-4 py-3 border-0 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
              />
              <button
                type="button"
                onClick={addAttribute}
                disabled={!newAttributeKey.trim() || !newAttributeValue.trim()}
                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {formData.attributes && Object.keys(formData.attributes).length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-xl">
                {Object.entries(formData.attributes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-semibold text-gray-700">{key}:</span>
                    <span className="flex-1 text-gray-600">{value}</span>
                    <button
                      type="button"
                      onClick={() => removeAttribute(key)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
