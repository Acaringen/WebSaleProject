'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Customer {
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
}

interface AuthContextType {
  customer: Customer | null
  login: (email: string, password: string) => Promise<boolean>
  register: (customerData: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sayfa yüklendiğinde localStorage'dan müşteri bilgilerini kontrol et
  useEffect(() => {
    const savedCustomer = localStorage.getItem('customer')
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer))
      } catch (error) {
        localStorage.removeItem('customer')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Basit müşteri girişi (gerçek uygulamada API'den kontrol edilir)
      const customers = JSON.parse(localStorage.getItem('customers') || '[]')
      const customer = customers.find((c: any) => c.email === email && c.password === password)
      
      if (customer) {
        const customerData: Customer = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        }
        
        setCustomer(customerData)
        localStorage.setItem('customer', JSON.stringify(customerData))
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const register = async (customerData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:5001/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        setIsLoading(false)
        return false
      }

      const data = await response.json()
      const customer: Customer = {
        id: data.customer.id,
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        address: data.customer.address
      }

      setCustomer(customer)
      localStorage.setItem('customer', JSON.stringify(customer))
      setIsLoading(false)
      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setCustomer(null)
    localStorage.removeItem('customer')
  }

  const value: AuthContextType = {
    customer,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!customer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
