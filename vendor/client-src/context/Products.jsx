import { createContext, useContext, useReducer, useCallback } from 'react';

// ---- SERVICES ----
import {
  getAllProductsService,
  addProductService,
  updateProductService,
  deleteProductService,
} from '../services/products.js';
import {
  getAllCategoryServices,
  addNewCategoryServices,
  updateCategoryServices,
} from '../services/categorys.js';
import {
  getCustomOptionByRestaurantServices,
  assignProductsToCustomOptionServices,
  deleteCustomOptionServices,
} from '../services/customOption.js';
// -------------------

// CREACIÓN DEL CONTEXTO
export const ProductContext = createContext();

// ESTADO INICIAL
const initialState = {
  allProducts: [],
  products: [],
  categorys: [],
  customOptions: [],
};

// TIPOS DE ACCION ---->
const ACTION_TYPES = {
  GET_ALL_PRODUCTS: 'GET_ALL_PRODUCTS',
  GET_PRODUCT_BY_NAME: 'GET_PRODUCT_BY_NAME',
  SEARCH_PRODUCT_BY_NAME: 'SEARCH_PRODUCT_BY_NAME',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  FILTER_BY_STATUS: 'FILTER_BY_STATUS',
  FILTER_BY_CATEGORY: 'FILTER_BY_CATEGORY',
  GET_ALL_CATEGORYS: 'GET_ALL_CATEGORYS',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  CLEAR_ALL_PRODUCT_CONTEXT: 'CLEAR_ALL_PRODUCT_CONTEXT',
  GET_ALL_CUSTOM_OPTIONS: 'GET_ALL_CUSTOM_OPTIONS',
  PUT_ASSIGN_PRODUCTS_TO_CUSTOM_OPTION: 'PUT_ASSIGN_PRODUCTS_TO_CUSTOM_OPTION',
  DELETE_CUSTOM_OPTION: 'DELETE_CUSTOM_OPTION',
};
// <----------------------------------

// REDUCER
const productReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.GET_ALL_PRODUCTS: {
      return {
        ...state,
        allProducts: action.payload,
        products: action.payload,
      };
    }

    case ACTION_TYPES.SEARCH_PRODUCT_BY_NAME: {
      const searchTerm = action.payload.toLowerCase();
      const filteredProducts = state.allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
      );

      return {
        ...state,
        products: filteredProducts,
      };
    }

    case ACTION_TYPES.GET_PRODUCT_BY_NAME: {
      return {
        ...state,
        products: action.payload,
      };
    }

    case ACTION_TYPES.ADD_PRODUCT: {
      const updatedProducts = [...state.allProducts, action.payload];
      return {
        ...state,
        allProducts: updatedProducts,
        products: updatedProducts,
      };
    }

    case ACTION_TYPES.UPDATE_PRODUCT: {
      const updatedProduct = action.payload;
      const updatedAllProducts = state.allProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      const updatedProducts = state.products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );

      return {
        ...state,
        allProducts: updatedAllProducts,
        products: updatedProducts,
      };
    }

    case ACTION_TYPES.DELETE_PRODUCT: {
      const productId = action.payload;

      const updatedAllProducts = state.allProducts.filter(
        (product) => product.id !== productId
      );
      const updatedProducts = state.products.filter(
        (product) => product.id !== productId
      );

      return {
        ...state,
        allProducts: updatedAllProducts,
        products: updatedProducts,
      };
    }

    case ACTION_TYPES.FILTER_BY_STATUS: {
      let filteredSource =
        action.payload === 'all'
          ? state.allProducts
          : state.allProducts.filter((elem) => elem.status === action.payload);

      return {
        ...state,
        products: filteredSource,
      };
    }

    case ACTION_TYPES.FILTER_BY_CATEGORY: {
      let filteredSource =
        action.payload === 'all'
          ? state.allProducts
          : state.allProducts.filter(
              (elem) =>
                elem.category.name.toLowerCase() ===
                action.payload.toLowerCase()
            );

      return {
        ...state,
        products: filteredSource,
      };
    }

    case ACTION_TYPES.GET_ALL_CATEGORYS: {
      return {
        ...state,
        categorys: action.payload,
      };
    }

    case ACTION_TYPES.ADD_CATEGORY: {
      return {
        ...state,
        categorys: [...state.categorys, action.payload],
      };
    }

    case ACTION_TYPES.UPDATE_CATEGORY: {
      const updatedCategory = action.payload;
      const updatedAllCategorys = state.categorys.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      );

      return {
        ...state,
        categorys: updatedAllCategorys,
      };
    }

    case ACTION_TYPES.CLEAR_ALL_PRODUCT_CONTEXT: {
      return {
        ...initialState,
      };
    }

    case ACTION_TYPES.GET_ALL_CUSTOM_OPTIONS: {
      return {
        ...state,
        customOptions: action.payload,
      };
    }

    case ACTION_TYPES.PUT_ASSIGN_PRODUCTS_TO_CUSTOM_OPTION: {
      const updated = action.payload;

      return {
        ...state,
        customOptions: state.customOptions.map((option) =>
          option.id === updated.id ? updated : option
        ),
      };
    }

    case ACTION_TYPES.DELETE_CUSTOM_OPTION: {
      const optionId = action.payload;

      const removeOptionFromProduct = (product) => {
        if (!Array.isArray(product.productCustomOptions)) return product;

        return {
          ...product,
          productCustomOptions: product.productCustomOptions.filter(
            (option) => option.id !== optionId
          ),
        };
      };

      return {
        ...state,
        customOptions: state.customOptions.filter(
          (option) => option.id !== optionId
        ),
        allProducts: state.allProducts.map(removeOptionFromProduct),
        products: state.products.map(removeOptionFromProduct),
      };
    }

    default:
      return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [productState, dispatch] = useReducer(productReducer, initialState);

  const getAllProducts = useCallback(async (userId) => {
    try {
      const response = await getAllProductsService(userId);
      dispatch({
        type: ACTION_TYPES.GET_ALL_PRODUCTS,
        payload: response,
      });
      return response;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const getProductByName = useCallback(async (userId, name) => {
    try {
      if (userId && name) {
        const response = await getAllProductsService(userId, name);
        if (!response || response.length === 0)
          throw new Error('Producto no encontrado');
        dispatch({
          type: ACTION_TYPES.GET_PRODUCT_BY_NAME,
          payload: response,
        });
      }
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const searchProductByName = (name) => {
    dispatch({
      type: ACTION_TYPES.SEARCH_PRODUCT_BY_NAME,
      payload: name,
    });
  };

  const addProduct = async (data) => {
    try {
      const response = await addProductService(data);
      dispatch({
        type: ACTION_TYPES.ADD_PRODUCT,
        payload: response,
      });
      return response;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const updateProduct = async (data) => {
    try {
      const response = await updateProductService(data);
      dispatch({
        type: ACTION_TYPES.UPDATE_PRODUCT,
        payload: response,
      });
      return response;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const deleteProduct = async (productId, userId) => {
    try {
      const deletedProduct = {
        productId: productId,
        userId: userId,
      };
      const response = await deleteProductService(deletedProduct);

      dispatch({
        type: ACTION_TYPES.DELETE_PRODUCT,
        payload: productId,
      });

      return response;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const filterByStatus = (status) => {
    dispatch({
      type: ACTION_TYPES.FILTER_BY_STATUS,
      payload: status,
    });
  };

  const filterByCategory = (filter) => {
    dispatch({
      type: ACTION_TYPES.FILTER_BY_CATEGORY,
      payload: filter,
    });
  };

  const getAllCategorys = useCallback(async (userId) => {
    try {
      const response = await getAllCategoryServices(userId);
      dispatch({
        type: ACTION_TYPES.GET_ALL_CATEGORYS,
        payload: response,
      });
      return response;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const updateCategory = async (categoryData) => {
    try {
      const response = await updateCategoryServices(categoryData);
      dispatch({
        type: ACTION_TYPES.UPDATE_CATEGORY,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const addNewCategory = useCallback(async (categoryData) => {
    try {
      const response = await addNewCategoryServices(categoryData);
      dispatch({
        type: ACTION_TYPES.ADD_CATEGORY,
        payload: response,
      });
      return response;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const clearAllProductContext = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.CLEAR_ALL_PRODUCT_CONTEXT,
    });
  }, []);

  const getAllCustomOptions = useCallback(async (userId) => {
    try {
      const response = await getCustomOptionByRestaurantServices(userId);
      dispatch({
        type: ACTION_TYPES.GET_ALL_CUSTOM_OPTIONS,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  const assignProductsToCustomOption = async (data) => {
    try {
      const response = await assignProductsToCustomOptionServices(data);
      dispatch({
        type: ACTION_TYPES.PUT_ASSIGN_PRODUCTS_TO_CUSTOM_OPTION,
        payload: response,
      });

      // HACEMOS EL LLAMADO PARA ACTUALIZAR LOS PRODUCTOS
      if (data.userId) await getAllProducts(data.userId);
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const deleteCustomOption = useCallback(
    async (id, userId) => {
      try {
        const response = await deleteCustomOptionServices(id, userId);

        dispatch({
          type: ACTION_TYPES.DELETE_CUSTOM_OPTION,
          payload: response.deletedId || id,
        });

        // Opcional pero recomendado si querés dejar productos 100% sincronizados con backend
        if (userId) await getAllProducts(userId);

        return response;
      } catch (error) {
        throw (
          error?.message ||
          error.response?.data?.message ||
          error.message ||
          'Error al eliminar la personalización'
        );
      }
    },
    [getAllProducts]
  );

  return (
    <ProductContext.Provider
      value={{
        productState,
        getAllProducts,
        getProductByName,
        searchProductByName,
        addProduct,
        updateProduct,
        deleteProduct,
        filterByStatus,
        filterByCategory,
        getAllCategorys,
        addNewCategory,
        updateCategory,
        clearAllProductContext,
        getAllCustomOptions,
        assignProductsToCustomOption,
        deleteCustomOption,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  return useContext(ProductContext);
};
