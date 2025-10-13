'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { cartService } from '../services/cartService'
import Toast from '../components/Toast'

export interface CartItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  totalPrice: number
  productImage?: string
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

interface CartState {
  cart: Cart | null
  loading: boolean
  error: string | null
  toast: {
    message: string
    type: 'success' | 'error' | 'info'
    show: boolean
  } | null
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'HIDE_TOAST' }
  | { type: 'ADD_ITEM'; payload: { productId: string; productName: string; price: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  toast: null
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SHOW_TOAST':
      return { ...state, toast: { ...action.payload, show: true } }
    case 'HIDE_TOAST':
      return { ...state, toast: null }
    case 'CLEAR_CART':
      return { ...state, cart: null }
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addToCart: (productId: string, productName: string, price: number, quantity?: number, productImage?: string) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => void
  loadCart: () => Promise<void>
  hideToast: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Geçici olarak sabit bir customer ID kullanıyoruz
  // Gerçek uygulamada bu authentication'dan gelecek
  const customerId = "550e8400-e29b-41d4-a716-446655440000"

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cart = await cartService.getCart(customerId)
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Sepet yüklenirken hata oluştu' })
      console.error('Cart loading error:', error)
    }
  }

  const addToCart = async (productId: string, productName: string, price: number, quantity: number = 1, productImage?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedCart = await cartService.addToCart({
        customerId,
        productId,
        productName,
        price,
        quantity,
        productImage
      })
      dispatch({ type: 'SET_CART', payload: updatedCart })
      dispatch({ type: 'SHOW_TOAST', payload: { message: `${productName} sepete eklendi!`, type: 'success' } })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Ürün sepete eklenirken hata oluştu' })
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Ürün sepete eklenirken hata oluştu', type: 'error' } })
      console.error('Add to cart error:', error)
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedCart = await cartService.removeFromCart(customerId, productId)
      dispatch({ type: 'SET_CART', payload: updatedCart })
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Ürün sepetten çıkarıldı', type: 'success' } })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Ürün sepetten kaldırılırken hata oluştu' })
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Ürün sepetten çıkarılırken hata oluştu', type: 'error' } })
      console.error('Remove from cart error:', error)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      // Mevcut ürün bilgilerini bul
      const existingItem = state.cart?.items.find(item => item.productId === productId)
      if (existingItem) {
        const updatedCart = await cartService.addToCart({
          customerId,
          productId,
          productName: existingItem.productName,
          price: existingItem.price,
          quantity: quantity - existingItem.quantity // Fark kadar ekle/çıkar
        })
        dispatch({ type: 'SET_CART', payload: updatedCart })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Ürün miktarı güncellenirken hata oluştu' })
      console.error('Update quantity error:', error)
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const hideToast = () => {
    dispatch({ type: 'HIDE_TOAST' })
  }

  // Component mount olduğunda sepeti yükle
  useEffect(() => {
    loadCart()
  }, [])

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
    hideToast
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      {state.toast && (
        <Toast
          message={state.toast.message}
          type={state.toast.type}
          onClose={hideToast}
        />
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
