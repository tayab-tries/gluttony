import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item, restaurant) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menu_item_id === item.id);
      if (existing) {
        return prev.map(i => i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        menu_item_id: item.id,
        menu_item_name: item.name,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        price: item.price,
        quantity: 1,
        image_url: item.image_url,
      }];
    });
  };

  const removeFromCart = (menu_item_id) => {
    setCartItems(prev => prev.filter(i => i.menu_item_id !== menu_item_id));
  };

  const updateQuantity = (menu_item_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menu_item_id);
      return;
    }
    setCartItems(prev => prev.map(i => i.menu_item_id === menu_item_id ? { ...i, quantity } : i));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const itemsByRestaurant = cartItems.reduce((acc, item) => {
    if (!acc[item.restaurant_id]) {
      acc[item.restaurant_id] = { restaurant_name: item.restaurant_name, items: [] };
    }
    acc[item.restaurant_id].items.push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, itemsByRestaurant }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);