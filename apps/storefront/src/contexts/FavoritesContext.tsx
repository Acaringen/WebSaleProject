'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface Product {
  id: string
  name: string
  price: number
  image?: string
  description?: string
  category?: string
}

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const { customer, isAuthenticated } = useAuth()

  // Favorileri localStorage'dan yükle
  useEffect(() => {
    if (isAuthenticated && customer) {
      const savedFavorites = localStorage.getItem(`favorites_${customer.id}`)
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites))
        } catch (error) {
          console.error('Error loading favorites:', error)
        }
      }
    } else {
      setFavorites([])
    }
  }, [isAuthenticated, customer])

  // Favorileri localStorage'a kaydet
  useEffect(() => {
    if (isAuthenticated && customer) {
      localStorage.setItem(`favorites_${customer.id}`, JSON.stringify(favorites))
    }
  }, [favorites, isAuthenticated, customer])

  const addToFavorites = (product: Product) => {
    if (!isAuthenticated) {
      alert('Favorilere eklemek için giriş yapmanız gerekiyor.')
      return
    }

    setFavorites(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.id === product.id)
      if (isAlreadyFavorite) {
        return prev
      }
      return [...prev, product]
    })
  }

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== productId))
  }

  const isFavorite = (productId: string) => {
    return favorites.some(fav => fav.id === productId)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
