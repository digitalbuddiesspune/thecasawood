import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within CartProvider')
    }
    return context
}

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth()
    const [cartCount, setCartCount] = useState(0)
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch cart data
    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCartCount(0)
            setCartItems([])
            return
        }

        try {
            setLoading(true)
            const response = await cartAPI.get()
            if (response.data.success) {
                const items = response.data.data || []
                setCartItems(items)
                const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
                setCartCount(totalCount)
            }
        } catch (error) {
            console.error('Error fetching cart:', error)
            setCartCount(0)
            setCartItems([])
        } finally {
            setLoading(false)
        }
    }

    // Add item to cart
    const addToCart = async (productId, quantity = 1) => {
        try {
            await cartAPI.add({ productId, quantity })
            await fetchCart() // Refresh cart
            return { success: true }
        } catch (error) {
            console.error('Error adding to cart:', error)
            return { success: false, error: error.response?.data?.message || 'Failed to add to cart' }
        }
    }

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        try {
            await cartAPI.remove(itemId)
            await fetchCart() // Refresh cart
            return { success: true }
        } catch (error) {
            console.error('Error removing from cart:', error)
            return { success: false, error: error.response?.data?.message || 'Failed to remove from cart' }
        }
    }

    // Update item quantity
    const updateQuantity = async (itemId, quantity) => {
        try {
            await cartAPI.update(itemId, { quantity })
            await fetchCart() // Refresh cart
            return { success: true }
        } catch (error) {
            console.error('Error updating quantity:', error)
            return { success: false, error: error.response?.data?.message || 'Failed to update quantity' }
        }
    }

    // Clear cart
    const clearCart = async () => {
        try {
            // Remove all items
            for (const item of cartItems) {
                await cartAPI.remove(item._id || item.id)
            }
            await fetchCart() // Refresh cart
            return { success: true }
        } catch (error) {
            console.error('Error clearing cart:', error)
            return { success: false, error: error.response?.data?.message || 'Failed to clear cart' }
        }
    }

    // Fetch cart on mount and when authentication changes
    useEffect(() => {
        fetchCart()
    }, [isAuthenticated])

    const value = {
        cartCount,
        cartItems,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}
