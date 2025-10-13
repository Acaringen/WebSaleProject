import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  totalPrice: number
  productImage?: string
}

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  postalCode: string
  phone: string
}

export interface CreateOrderRequest {
  customerId: string
  customerName?: string
  customerEmail?: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: ShippingAddress
  paymentMethod: string
  coordinates?: { lat: number; lng: number } | null
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: ShippingAddress
  paymentMethod: string
  coordinates?: { lat: number; lng: number } | null
  status: 'created' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
  notes: string
}

export interface OrdersResponse {
  orders: Order[]
  totalCount: number
}

class OrderService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await this.apiClient.post('/api/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Create order error:', error)
      throw new Error('Sipariş oluşturulurken hata oluştu')
    }
  }

  async getOrders(customerId?: string, status?: string): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams()
      if (customerId) params.append('customerId', customerId)
      if (status) params.append('status', status)

      const response = await this.apiClient.get(`/api/orders?${params}`)
      return response.data
    } catch (error) {
      console.error('Get orders error:', error)
      throw new Error('Siparişler yüklenirken hata oluştu')
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.apiClient.get(`/api/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error('Get order error:', error)
      throw new Error('Sipariş yüklenirken hata oluştu')
    }
  }
}

export const orderService = new OrderService()
