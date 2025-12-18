"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface CartItem {
  id: number;
  title: string;
  price: number;
  condition: string;
  brand: string;
  model: string;
  year: string;
  image: string;
  quantity: number;
  seller: {
    id: number;
    name: string;
    location: string;
    verified: boolean;
  };
  shipping: {
    cost: number;
    estimatedDays: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShippingTotal: () => number;
  getSellerGroups: () => Record<string, CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage on mount
    const storedCart = localStorage.getItem("partout_cart");
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    } else {
      // Add some mock items for demo
      setItems([
        {
          id: 1,
          title: "BMW E46 Brake Pads - Front Set",
          price: 89.99,
          condition: "New",
          brand: "BMW",
          model: "E46 3 Series",
          year: "1999-2006",
          image: "/placeholder.svg?height=200&width=200&text=BMW+Brake+Pads",
          quantity: 1,
          seller: {
            id: 1,
            name: "AutoParts Pro",
            location: "Los Angeles, CA",
            verified: true,
          },
          shipping: {
            cost: 12.99,
            estimatedDays: "3-5 business days",
          },
        },
        {
          id: 2,
          title: "Honda Civic Engine Air Filter",
          price: 24.99,
          condition: "New",
          brand: "Honda",
          model: "Civic",
          year: "2016-2021",
          image: "/honda-air-filter.jpg",
          quantity: 2,
          seller: {
            id: 2,
            name: "Civic Specialist",
            location: "Miami, FL",
            verified: true,
          },
          shipping: {
            cost: 8.99,
            estimatedDays: "2-4 business days",
          },
        },
      ]);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever items change
    localStorage.setItem("partout_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShippingTotal = () => {
    // Group by seller and calculate shipping per seller
    const sellerGroups = getSellerGroups();
    return Object.values(sellerGroups).reduce((total, sellerItems) => {
      return total + sellerItems[0].shipping.cost;
    }, 0);
  };

  const getSellerGroups = () => {
    return items.reduce(
      (groups, item) => {
        const sellerId = item.seller.id.toString();
        if (!groups[sellerId]) {
          groups[sellerId] = [];
        }
        groups[sellerId].push(item);
        return groups;
      },
      {} as Record<string, CartItem[]>,
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getShippingTotal,
        getSellerGroups,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
