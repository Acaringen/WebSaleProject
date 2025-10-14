import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004'

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

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: ShippingAddress
  paymentMethod: string
  status: 'created' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
  notes: string
}

export interface OrdersResponse {
  orders: Order[]
  totalCount: number
}

export interface UpdateOrderStatusRequest {
  status: 'created' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
}

class OrderService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  async getOrders(status?: string): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)

      const response = await this.apiClient.get(`/api/orders?${params}`)
      
      // Backend direkt array dönüyor, object formatına çevir
      const orders = Array.isArray(response.data) ? response.data : (response.data.orders || [])
      
      return {
        orders: orders,
        totalCount: orders.length
      }
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

  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusRequest): Promise<Order> {
    try {
      const response = await this.apiClient.put(`/api/orders/${orderId}/status`, statusData)
      return response.data
    } catch (error) {
      console.error('Update order status error:', error)
      throw new Error('Sipariş durumu güncellenirken hata oluştu')
    }
  }
}

export const orderService = new OrderService()
