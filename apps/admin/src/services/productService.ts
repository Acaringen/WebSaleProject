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

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  sku: string
  category: string
  brand: string
  images: string[]
  attributes: Record<string, string>
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
    searchTerm?: string, 
    isActive?: boolean
  ): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      
      if (category) params.append('category', category)
      if (searchTerm) params.append('searchTerm', searchTerm)
      if (isActive !== undefined) params.append('isActive', isActive.toString())

      console.log('Fetching products from:', `${API_BASE_URL}/api/products?${params}`)
      const response = await this.apiClient.get(`/api/products?${params}`)
      console.log('Products response:', response.data)
      
      // API response formatını düzelt
      const apiData = response.data
      return {
        items: apiData.products || apiData.items || [],
        totalCount: apiData.totalCount || 0,
        pageSize: apiData.pageSize || pageSize,
        currentPage: apiData.page || apiData.currentPage || page,
        totalPages: apiData.totalPages || 0
      }
    } catch (error: any) {
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

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await this.apiClient.get(`/api/products/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Get product error:', error)
      throw new Error('Ürün yüklenirken hata oluştu')
    }
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    try {
      console.log('Creating product:', product)
      console.log('API URL:', `${API_BASE_URL}/api/products`)
      
      const response = await this.apiClient.post('/api/products', product)
      console.log('Product created successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Create product error:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw new Error(`Ürün oluşturulurken hata oluştu: ${error.response?.data?.message || error.message}`)
    }
  }

  async updateProduct(id: string, product: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await this.apiClient.put(`/api/products/${id}`, product)
      return response.data
    } catch (error: any) {
      console.error('Update product error:', error)
      throw new Error('Ürün güncellenirken hata oluştu')
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/products/${id}`)
    } catch (error: any) {
      console.error('Delete product error:', error)
      throw new Error('Ürün silinirken hata oluştu')
    }
  }

  // Kategori listesini getir (örnek kategoriler)
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

  // Marka listesini getir (örnek markalar)
  getBrands(): string[] {
    return [
      'Apple',
      'Samsung',
      'Sony',
      'Nike',
      'Adidas',
      'Microsoft',
      'Google',
      'Amazon',
      'Generic',
      'Other'
    ]
  }
}

export const productService = new ProductService()
