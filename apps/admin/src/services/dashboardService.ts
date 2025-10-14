import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  ordersGrowth: number
  customersGrowth: number
  revenueGrowth: number
}

export interface RecentActivity {
  id: string
  type: 'order' | 'customer' | 'product'
  description: string
  timestamp: string
  status?: string
}

class DashboardService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Gerçek verileri çek
      const [customerService, orderService, productService] = await Promise.all([
        import('./customerService'),
        import('./orderService'),
        import('./productService')
      ])

      const [customers, orders, products] = await Promise.all([
        customerService.customerService.getCustomers().catch(() => []),
        orderService.orderService.getOrders().catch(() => ({ orders: [] })),
        productService.productService.getProducts(1, 1000).catch(() => ({ items: [] }))
      ])

      const totalCustomers = customers.length
      const totalOrders = orders.orders.length
      const totalProducts = products.items.length
      
      // Sadece teslim edilen siparişlerin toplamını hesapla
      const deliveredOrders = orders.orders.filter((order: any) => order.status === 'delivered')
      const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)

      return {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        ordersGrowth: 0, // Şimdilik 0
        customersGrowth: 0, // Şimdilik 0
        revenueGrowth: 0 // Şimdilik 0
      }
    } catch (error: any) {
      console.error('Get dashboard stats error:', error)
      // Hata durumunda varsayılan değerler döndür
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        ordersGrowth: 0,
        customersGrowth: 0,
        revenueGrowth: 0
      }
    }
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      console.log('Fetching recent activity from:', `${API_BASE_URL}/api/dashboard/recent-activity`)
      const response = await this.apiClient.get('/api/dashboard/recent-activity')
      console.log('Recent activity response:', response.data)
      return response.data || []
    } catch (error: any) {
      console.error('Get recent activity error:', error)
      // Hata durumunda boş liste döndür
      return []
    }
  }

  // Mock data için geçici metod (API hazır olana kadar)
  getMockStats(): DashboardStats {
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      ordersGrowth: 0,
      customersGrowth: 0,
      revenueGrowth: 0
    }
  }

  getMockRecentActivity(): RecentActivity[] {
    return [
      {
        id: '1',
        type: 'order',
        description: 'Henüz sipariş bulunmuyor',
        timestamp: new Date().toISOString(),
        status: 'info'
      }
    ]
  }
}

export const dashboardService = new DashboardService()
