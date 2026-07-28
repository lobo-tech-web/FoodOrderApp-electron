import { createContext, useContext, useReducer } from "react";

// ---------LIBRERIA PARA COMPARAR OBJETOS DE FORMA PROFUNDA --------
import _ from "lodash";
// <-------------------

// Crear el contexto
const CartContext = createContext();

// --------- FUNCIONES AUXILIARES --------
const normalizeProductComment = (comment) => {
  return String(comment || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const normalizeCustomOptions = (customOptions = []) => {
  if (!Array.isArray(customOptions)) return [];

  return customOptions
    .map((option) => ({
      optionId:
        option.optionId ??
        option.customOptionId ??
        option.productCustomOptionId ??
        null,

      optionName: String(option.optionName || "")
        .trim()
        .toLowerCase(),

      itemId: option.itemId ?? option.customOptionItemId ?? option.id ?? null,

      name: String(option.name || "")
        .trim()
        .toLowerCase(),

      extraCost: Number(option.extraCost || 0),

      quantity: Number(option.quantity || 1),
    }))
    .sort((a, b) => {
      const optionComparison = String(a.optionId ?? a.optionName).localeCompare(
        String(b.optionId ?? b.optionName),
      );

      if (optionComparison !== 0) return optionComparison;

      return String(a.itemId ?? a.name).localeCompare(
        String(b.itemId ?? b.name),
      );
    });
};

const areSameCartItems = (currentItem, incomingItem) => {
  const currentProductId = currentItem.productId || currentItem.id;

  const incomingProductId = incomingItem.productId || incomingItem.id;

  if (String(currentProductId) !== String(incomingProductId)) {
    return false;
  }

  const sameComment =
    normalizeProductComment(currentItem.productComment) ===
    normalizeProductComment(incomingItem.productComment);

  if (!sameComment) return false;

  const sameCustomOptions = _.isEqual(
    normalizeCustomOptions(currentItem.customOptions),
    normalizeCustomOptions(incomingItem.customOptions),
  );

  return sameCustomOptions;
};

const getClientId = () => {
  const pathParts = window.location.pathname.split("/");
  const menuIndex = pathParts.indexOf("menu");
  if (menuIndex !== -1 && pathParts.length > menuIndex + 1) {
    return pathParts[menuIndex + 1];
  }
  return "default"; // Fallback
};

const CLIENT_ID = getClientId();
const STORAGE_KEY = `cart_${CLIENT_ID}`;
const LAST_CLIENT_KEY = "last_client_id";

// Limpiar el carrito si cambia de cliente
const lastClientId = window.localStorage.getItem(LAST_CLIENT_KEY);
if (lastClientId && lastClientId !== CLIENT_ID) {
  localStorage.removeItem(`cart_${lastClientId}`);
}
localStorage.setItem(LAST_CLIENT_KEY, CLIENT_ID);
// ----------------------------------------

// Estado inicial del carrito
const initialState = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [];

const updateOrderLocalStorage = (state) =>
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const CART_ACTION_TYPES = {
  ADD_ITEM: "ADD_ITEM",
  DECREMENT_QUANTITY: "DECREMENT_QUANTITY",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_CART: "CLEAR_CART",
};

// Reducer para gestionar acciones
const cartReducer = (state, action) => {
  switch (action.type) {
    // SUMAR UN PRODUCTO AL CARRITO
    case CART_ACTION_TYPES.ADD_ITEM: {
      const existingItemIndex = state.findIndex((item) =>
        areSameCartItems(item, action.payload),
      );

      if (existingItemIndex >= 0) {
        const newState = structuredClone(state);

        newState[existingItemIndex].quantity =
          Number(newState[existingItemIndex].quantity || 1) + 1;

        updateOrderLocalStorage(newState);
        return newState;
      }

      // Calcular el precio total del producto unitario (incluyendo customOptions)
      const customOptionsCost = (action.payload.customOptions || []).reduce(
        (sum, option) =>
          sum + Number(option.extraCost || 0) * Number(option.quantity || 1),
        0,
      );

      const newItem = {
        ...action.payload,
        productId: action.payload.productId || action.payload.id,

        productComment: String(action.payload.productComment || "").trim(),

        customOptions: Array.isArray(action.payload.customOptions)
          ? action.payload.customOptions
          : [],

        quantity: 1,

        price: Number(action.payload.price || 0) + customOptionsCost,
      };

      const newState = [...state, newItem];
      updateOrderLocalStorage(newState);
      return newState;
    }

    // RESTAR UN PRODUCTO DEL CARRITO
    case CART_ACTION_TYPES.DECREMENT_QUANTITY: {
      const newState = state
        .map((item) =>
          areSameCartItems(item, action.payload)
            ? {
                ...item,
                quantity: Number(item.quantity || 1) - 1,
              }
            : item,
        )
        .filter((item) => Number(item.quantity) > 0);

      updateOrderLocalStorage(newState);
      return newState;
    }

    // REMOVER UN PRODUCTO DEL CARRITO
    case CART_ACTION_TYPES.REMOVE_ITEM: {
      const newState = state.filter(
        (item) => !areSameCartItems(item, action.payload),
      );

      updateOrderLocalStorage(newState);
      return newState;
    }

    case CART_ACTION_TYPES.CLEAR_CART: {
      updateOrderLocalStorage([]);
      return [];
    }

    default: {
      return state;
    }
  }
};

// Provider del carrito
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItemToCart = (item) => {
    dispatch({
      type: CART_ACTION_TYPES.ADD_ITEM,
      payload: item,
    });
  };

  const decrementItemToCart = (item) => {
    dispatch({
      type: CART_ACTION_TYPES.DECREMENT_QUANTITY,
      payload: item,
    });
  };

  const removeItemFromCart = (item) => {
    dispatch({
      type: CART_ACTION_TYPES.REMOVE_ITEM,
      payload: item,
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTION_TYPES.CLEAR_CART });
  };

  // FUNCIÓN PARA SUMAR EL TOTAL DEL PEDIDO
  const getTotalAmount = () =>
    state.reduce(
      (total, item) => total + (item.price || 0.0) * item.quantity,
      0,
    );

  // FUNCIÓN PARA SUMAR LOS PUNTOS EN EL PEDIDO
  const getTotalRewardPoints = () =>
    state.reduce(
      (total, item) => total + (item.rewardPoints || 0) * item.quantity,
      0,
    );

  // FUNCIÓN PARA SUMAR LOS PUNTOS DE CANJEO DEL PEDIDO
  const getTotalRedeemPoints = () =>
    state.reduce(
      (total, item) => total + (item.redeemPoints || 0) * item.quantity,
      0,
    );

  return (
    <CartContext.Provider
      value={{
        cartItems: state,
        addItemToCart,
        decrementItemToCart,
        removeItemFromCart,
        clearCart,
        totalOrderAmount: getTotalAmount(),
        totalRewardPoints: getTotalRewardPoints(),
        totalRedeemPoints: getTotalRedeemPoints(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar el contexto
export const useCart = () => {
  return useContext(CartContext);
};
