// Müşteri yönetimi servisi

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: string
  lastLogin?: string
  totalOrders: number
  totalSpent: number
  status: 'active' | 'inactive' | 'blocked'
  orderStats?: {
    delivered: number
    shipped: number
    cancelled: number
    approved: number
    created: number
    total: number
  }
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  averageOrderValue: number
}

class CustomerService {
  private baseUrl = 'http://localhost:5001'

  // Tüm müşterileri getir
  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('📊 Fetching customers and orders...')
      
      // Müşterileri ve siparişleri paralel olarak çek
      const [customersResponse, ordersResponse] = await Promise.all([
        fetch(`${this.baseUrl}/api/customers`),
        fetch(`${this.baseUrl}/api/orders`)
      ])
      
      if (!customersResponse.ok) {
        throw new Error('Müşteriler yüklenemedi')
      }
      if (!ordersResponse.ok) {
        throw new Error('Siparişler yüklenemedi')
      }
      
      const customersData = await customersResponse.json()
      const ordersData = await ordersResponse.json()
      
      console.log('📊 Customers:', customersData.customers.length)
      console.log('📊 Orders:', ordersData.orders.length)
      
      // Tüm siparişleri bir kez çek, sonra her müşteri için hesapla
      const allOrders = ordersData.orders
      
      const customersWithStats = customersData.customers.map((customer: Customer) => {
        console.log(`🔍 Processing customer: ${customer.name} (ID: ${customer.id})`)
        
        // Bu müşteriye ait siparişleri filtrele
        const customerOrders = allOrders.filter((order: any) => {
          console.log(`🔍 Checking order ${order.id}: customerId=${order.customerId}, target=${customer.id}`)
          
          // Farklı ID formatlarını kontrol et
          const isMatch = order.customerId === customer.id || 
                         order.customerId === customer.email || 
                         order.customerEmail === customer.email ||
                         order.customerName === customer.name
          
          console.log(`🔍 Match result: ${isMatch}`)
          return isMatch
        })
        
        // Sipariş durumlarına göre grupla
        const deliveredOrders = customerOrders.filter((order: any) => order.status === 'delivered')
        const shippedOrders = customerOrders.filter((order: any) => order.status === 'shipped')
        const cancelledOrders = customerOrders.filter((order: any) => order.status === 'cancelled')
        const approvedOrders = customerOrders.filter((order: any) => order.status === 'approved')
        const createdOrders = customerOrders.filter((order: any) => order.status === 'created')
        
        // Sadece teslim edilen siparişlerin toplamını hesapla
        const totalOrders = deliveredOrders.length
        const totalSpent = deliveredOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
        
        console.log(`📊 Customer ${customer.name}:`)
        console.log(`  - Teslim edilen: ${deliveredOrders.length} (₺${totalSpent})`)
        console.log(`  - Kargoda: ${shippedOrders.length}`)
        console.log(`  - İptal: ${cancelledOrders.length}`)
        console.log(`  - Onaylandı: ${approvedOrders.length}`)
        console.log(`  - Oluşturuldu: ${createdOrders.length}`)
        
        return {
          ...customer,
          totalOrders, // Sadece teslim edilen siparişler
          totalSpent,   // Sadece teslim edilen siparişlerin toplamı
          orderStats: {
            delivered: deliveredOrders.length,
            shipped: shippedOrders.length,
            cancelled: cancelledOrders.length,
            approved: approvedOrders.length,
            created: createdOrders.length,
            total: customerOrders.length
          }
        }
      })
      
      return customersWithStats
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw new Error('Müşteriler yüklenirken hata oluştu')
    }
  }


  // Müşteri istatistiklerini getir
  async getCustomerStats(): Promise<CustomerStats> {
    try {
      const customers = await this.getCustomers()
      
      const totalCustomers = customers.length
      const activeCustomers = customers.filter(c => c.status === 'active').length
      
      // Bu ay yeni müşteriler
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const newCustomersThisMonth = customers.filter(customer => {
        const customerDate = new Date(customer.createdAt)
        return customerDate.getMonth() === currentMonth && customerDate.getFullYear() === currentYear
      }).length
      
      // Ortalama sipariş değeri
      const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
      const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0)
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
      
      return {
        totalCustomers,
        activeCustomers,
        newCustomersThisMonth,
        averageOrderValue
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      throw new Error('Müşteri istatistikleri yüklenirken hata oluştu')
    }
  }

  // Müşteri detaylarını getir
  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const customers = await this.getCustomers()
      return customers.find(customer => customer.id === customerId) || null
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw new Error('Müşteri bilgileri yüklenirken hata oluştu')
    }
  }

  // Müşteri durumunu güncelle
  async updateCustomerStatus(customerId: string, status: 'active' | 'inactive' | 'blocked'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/customers/${customerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Müşteri durumu güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating customer status:', error)
      throw new Error('Müşteri durumu güncellenirken hata oluştu')
    }
  }

  // Müşteri arama
  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/customers/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Müşteri arama yapılamadı')
      }
      const data = await response.json()
      return data.customers
    } catch (error) {
      console.error('Error searching customers:', error)
      throw new Error('Müşteri arama sırasında hata oluştu')
    }
  }
}

export const customerService = new CustomerService()
