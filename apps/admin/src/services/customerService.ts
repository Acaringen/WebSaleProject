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
  private baseUrl = 'http://localhost:5007'

  // Tüm müşterileri getir
  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('📊 Fetching customers and orders...')
      
      // Müşterileri ve siparişleri paralel olarak çek
      const customersResponse = await fetch(`${this.baseUrl}/api/customers`)
      
      if (!customersResponse.ok) {
        throw new Error('Müşteriler yüklenemedi')
      }
      
      const customersData = await customersResponse.json()
      
      // Orders API farklı port'ta (5004), şimdilik orders olmadan devam et
      let ordersData: any[] = []
      try {
        const ordersResponse = await fetch('http://localhost:5004/api/orders')
        if (ordersResponse.ok) {
          ordersData = await ordersResponse.json()
        }
      } catch (error) {
        console.log('Orders API unavailable, continuing without order data')
      }
      
      // Backend direkt array dönüyor, object içinde değil
      const customers = Array.isArray(customersData) ? customersData : (customersData.customers || [])
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || [])
      
      console.log('📊 Customers:', customers.length)
      console.log('📊 Orders:', orders.length)
      
      // Tüm siparişleri bir kez çek, sonra her müşteri için hesapla
      const allOrders = orders
      
      const customersWithStats = customers.map((customer: any) => {
        const customerName = `${customer.firstName} ${customer.lastName}`
        console.log(`🔍 Processing customer: ${customerName} (ID: ${customer.id})`)
        
        // Bu müşteriye ait siparişleri filtrele
        const customerOrders = allOrders.filter((order: any) => {
          console.log(`🔍 Checking order ${order.id}: customerId=${order.customerId}, target=${customer.id}`)
          
          // Farklı ID formatlarını kontrol et
          const isMatch = order.customerId === customer.id || 
                         order.customerId === customer.email || 
                         order.customerEmail === customer.email ||
                         order.customerName === customerName
          
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
        
        console.log(`📊 Customer ${customerName}:`)
        console.log(`  - Teslim edilen: ${deliveredOrders.length} (₺${totalSpent})`)
        console.log(`  - Kargoda: ${shippedOrders.length}`)
        console.log(`  - İptal: ${cancelledOrders.length}`)
        console.log(`  - Onaylandı: ${approvedOrders.length}`)
        console.log(`  - Oluşturuldu: ${createdOrders.length}`)
        
        return {
          ...customer,
          name: customerName, // Backend'de name yok, firstName + lastName'den oluştur
          totalOrders, // Sadece teslim edilen siparişler
          totalSpent,   // Sadece teslim edilen siparişlerin toplamı
          status: customer.isActive ? 'active' : 'inactive', // Backend isActive dönüyor, status'a çevir
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

  // Müşteri ekleme
  async createCustomer(customerData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    address?: {
      street: string
      city: string
      postalCode: string
      country: string
    }
  }): Promise<Customer> {
    try {
      const response = await fetch(`${this.baseUrl}/api/customers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create customer error response:', errorText)
        throw new Error(`Müşteri oluşturulamadı: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw new Error('Müşteri oluşturulurken hata oluştu')
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
