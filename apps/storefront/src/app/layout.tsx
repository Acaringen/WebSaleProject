import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '../contexts/CartContext'
import { AuthProvider } from '../contexts/AuthContext'
import { FavoritesProvider } from '../contexts/FavoritesContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebSale - Your Online Store',
  description: 'Discover amazing products at great prices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <div className="min-h-screen bg-white">
                {children}
              </div>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
