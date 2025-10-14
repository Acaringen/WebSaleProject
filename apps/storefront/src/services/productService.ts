import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  sku: string
  category: string
  brand: string
  images: string[]
  attributes: Record<string, string>
  isActive: boolean
  createdAt: string
  updatedAt?: string
  stockQuantity?: number
}

export interface ProductsResponse {
  items: Product[]
  totalCount: number
  pageSize: number
  currentPage: number
  totalPages: number
}

class ProductService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  async getProducts(
    page: number = 1, 
    pageSize: number = 20, 
    category?: string, 
    searchTerm?: string
  ): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        isActive: 'true' // Sadece aktif ürünleri getir
      })
      
      if (category) params.append('category', category)
      if (searchTerm) params.append('searchTerm', searchTerm)

      const response = await this.apiClient.get(`/api/products?${params}`)
      
      // API'den gelen veriyi frontend formatına çevir
      const apiData = response.data
      if (apiData.products) {
        return {
          items: apiData.products,
          totalCount: apiData.products.length,
          pageSize: pageSize,
          currentPage: page,
          totalPages: Math.ceil(apiData.products.length / pageSize)
        }
      }
      
      return apiData
    } catch (error) {
      console.error('Get products error:', error)
      // Hata durumunda boş liste döndür
      return {
        items: [],
        totalCount: 0,
        pageSize: pageSize,
        currentPage: page,
        totalPages: 0
      }
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await this.apiClient.get(`/api/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Get product error:', error)
      return null
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const response = await this.getProducts(1, limit)
      return response.items
    } catch (error) {
      console.error('Get featured products error:', error)
      return []
    }
  }

  getCategories(): string[] {
    return [
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Sports',
      'Books',
      'Beauty',
      'Automotive',
      'Toys',
      'Health',
      'Food & Beverages'
    ]
  }
}

export const productService = new ProductService()
