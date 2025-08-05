import { useState, useEffect } from 'react'
import { Product } from '../lib/supabase'
import toast from 'react-hot-toast'

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => 
          item.product.id === product.id && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
      )

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        toast.success('Cart updated!')
        return updatedItems
      } else {
        // Add new item
        toast.success('Added to cart!')
        return [...prevItems, { product, quantity, selectedSize, selectedColor }]
      }
    })
  }

  const removeFromCart = (productId: string, selectedSize?: string, selectedColor?: string) => {
    setItems(prevItems => {
      const filtered = prevItems.filter(
        item => !(
          item.product.id === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
        )
      )
      toast.success('Removed from cart')
      return filtered
    })
  }

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    toast.success('Cart cleared')
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  }
}