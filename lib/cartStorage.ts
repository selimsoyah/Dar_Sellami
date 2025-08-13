export type CartItems = Record<string, number>;

export const cartStorage = {
  // Save cart to localStorage
  save: (cart: CartItems) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  },

  // Load cart from localStorage
  load: (): CartItems => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : {};
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cartStorage.clear(); // Clear invalid data
        return {};
      }
    }
    return {};
  },

  // Clear cart from localStorage
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  },

  // Check if cart exists in localStorage
  exists: (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cart') !== null;
    }
    return false;
  }
};
