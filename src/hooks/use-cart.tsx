"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/trpc/react";

interface CartItem {
  id: string; // Changed to string for real part IDs
  title: string;
  price: number;
  condition: string;
  brand: string;
  model: string;
  year: string;
  image: string;
  quantity: number;
  seller: {
    id: string; // Changed to string
    name: string;
    location: string;
    verified: boolean;
  };
  shipping?: {
    cost: number;
    estimatedDays: string;
  };
}

interface ShippingRate {
  rateId: string;
  carrier: string;
  service: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

interface SellerShippingRates {
  sellerId: string;
  sellerName: string | null | undefined;
  rates: ShippingRate[];
  selectedRateId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShippingTotal: () => number;
  getSellerGroups: () => Record<string, CartItem[]>;
  // New shipping-related methods
  shippingRates: SellerShippingRates[];
  calculateShipping: (addressId: string) => Promise<void>;
  selectShippingRate: (sellerId: string, rateId: string) => void;
  getSelectedShippingRate: (sellerId: string) => ShippingRate | null;
  isCalculatingShipping: boolean;
  shippingError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingRates, setShippingRates] = useState<SellerShippingRates[]>(
    [],
  );
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // tRPC mutation for calculating shipping
  const calculateShippingMutation = api.order.calculateShipping.useMutation();

  useEffect(() => {
    // Load cart from localStorage on mount
    const storedCart = localStorage.getItem("partout_cart");
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever items change
    if (items.length > 0) {
      localStorage.setItem("partout_cart", JSON.stringify(items));
    } else {
      localStorage.removeItem("partout_cart");
    }
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

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    // Clear shipping rates when cart changes
    setShippingRates([]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
    // Clear shipping rates when quantities change
    setShippingRates([]);
  };

  const clearCart = () => {
    setItems([]);
    setShippingRates([]);
    setShippingError(null);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShippingTotal = () => {
    // Calculate total shipping based on selected rates
    return shippingRates.reduce((total, sellerRates) => {
      const selectedRate = sellerRates.rates.find(
        (r) => r.rateId === sellerRates.selectedRateId,
      );
      return total + (selectedRate?.amount ?? 0);
    }, 0);
  };

  const getSellerGroups = () => {
    return items.reduce(
      (groups, item) => {
        const sellerId = item.seller.id;
        if (!groups[sellerId]) {
          groups[sellerId] = [];
        }
        groups[sellerId].push(item);
        return groups;
      },
      {} as Record<string, CartItem[]>,
    );
  };

  /**
   * Calculate shipping rates from Shippo for all items
   * Must be called with a valid shipping address
   */
  const calculateShipping = async (addressId: string) => {
    if (items.length === 0) {
      setShippingError("Cart is empty");
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const rates = await calculateShippingMutation.mutateAsync({
        items: items.map((item) => ({
          partId: item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: addressId,
      });

      // Auto-select cheapest rate for each seller
      const ratesWithSelection: SellerShippingRates[] = rates.map((r) => ({
        ...r,
        selectedRateId: r.rates[0]?.rateId, // Auto-select cheapest
      }));

      setShippingRates(ratesWithSelection);
    } catch (error) {
      console.error("Failed to calculate shipping:", error);
      setShippingError(
        error instanceof Error
          ? error.message
          : "Failed to calculate shipping rates",
      );
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  /**
   * Select a specific shipping rate for a seller
   */
  const selectShippingRate = (sellerId: string, rateId: string) => {
    setShippingRates((prev) =>
      prev.map((sellerRates) =>
        sellerRates.sellerId === sellerId
          ? { ...sellerRates, selectedRateId: rateId }
          : sellerRates,
      ),
    );
  };

  /**
   * Get the selected shipping rate for a seller
   */
  const getSelectedShippingRate = (sellerId: string): ShippingRate | null => {
    const sellerRates = shippingRates.find((r) => r.sellerId === sellerId);
    if (!sellerRates || !sellerRates.selectedRateId) return null;

    return (
      sellerRates.rates.find((r) => r.rateId === sellerRates.selectedRateId) ??
      null
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
        // Shipping calculation
        shippingRates,
        calculateShipping,
        selectShippingRate,
        getSelectedShippingRate,
        isCalculatingShipping,
        shippingError,
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
