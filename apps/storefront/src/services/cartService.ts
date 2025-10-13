import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'

export interface AddToCartRequest {
  customerId: string
  productId: string
  productName: string
  price: number
  quantity: number
  productImage?: string
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  totalPrice: number
}

export interface Cart {
  id?: string
  customerId: string
  items: CartItem[]
  totalAmount: number
  totalItems: number
  createdAt: string
  updatedAt: string
}

class CartService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  async getCart(customerId: string): Promise<Cart> {
    try {
      const response = await this.apiClient.get(`/api/cart/cart/${customerId}`)
      return response.data
    } catch (error) {
      console.error('Get cart error:', error)
      // Hata durumunda boş sepet döndür
      return {
        customerId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  }

  async addToCart(request: AddToCartRequest): Promise<Cart> {
    try {
      const response = await this.apiClient.post('/api/cart/cart/add-item', request)
      return response.data
    } catch (error) {
      console.error('Add to cart error:', error)
      throw new Error('Ürün sepete eklenirken hata oluştu')
    }
  }

  async removeFromCart(customerId: string, productId: string): Promise<Cart> {
    try {
      const response = await this.apiClient.delete(`/api/cart/cart/${customerId}/items/${productId}`)
      return response.data
    } catch (error) {
      console.error('Remove from cart error:', error)
      throw new Error('Ürün sepetten çıkarılırken hata oluştu')
    }
  }

  async updateCartItemQuantity(customerId: string, productId: string, quantity: number): Promise<Cart> {
    // Bu endpoint henüz Cart API'sinde yok, gelecekte eklenecek
    throw new Error('Update quantity endpoint not implemented yet')
  }

  async clearCart(customerId: string): Promise<void> {
    // Bu endpoint henüz Cart API'sinde yok, gelecekte eklenecek
    throw new Error('Clear cart endpoint not implemented yet')
  }
}

export const cartService = new CartService()
