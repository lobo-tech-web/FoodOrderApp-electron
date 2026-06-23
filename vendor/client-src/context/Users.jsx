import {
  useEffect,
  useCallback,
  createContext,
  useContext,
  useReducer,
} from "react";

// ---- DECODIFICADOR DE TOKEN JWT ----
import { jwtDecode } from "jwt-decode";
// ------------------------------------

// ---- SERVICES ----
import {
  getAllUsersService,
  getUserByID,
  userLoginService,
  updateUserService,
} from "../services/users.js";
import { getAllUserPointsService } from "../services/userPoints.js";
// <-----------------

// CREACIÓN DEL CONTEXTO ------>
export const UserContext = createContext();
// <----------------------------

// ESTADO INICIAL -------->
const initialState = {
  user: JSON.parse(window.localStorage.getItem("user")) || {},
  allUsers: [],
  showUsers: [],
  userInfo: [],
  clientUserInfo: [],
  allUserPoints: [],
  userPoints: [],
};
// <-----------------------

// TIPOS DE ACCIÓN ------>
const ACTION_TYPES = {
  GET_ALL_USERS: "GET_ALL_USERS",
  GET_USER_BY_NAME: "GET_USER_BY_NAME",
  GET_CLIENT_INFO: "GET_CLIENT_INFO",
  GET_USER_INFO_BY_DEV: "GET_USER_INFO_BY_DEV",
  GET_ALL_USER_POINTS: "GET_ALL_USER_POINTS",
  REFRESH_USER_POINTS: "REFRESH_USER_POINTS",
  PUT_USER: "PUT_USER",
  UPDATE_USER_POINTS: "UPDATE_USER_POINTS",
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: "LOGOUT_USER",
  FILTER_BY_STATUS: "FILTER_BY_STATUS",
  FILTER_BY_ROLE: "FILTER_BY_ROLE",
  FILTER_USERPOINTS_BY_NAME: "FILTER_USERPOINTS_BY_NAME",
  FILTER_USERPOINTS_BY_PHONE: "FILTER_USERPOINTS_BY_PHONE",
  CLEAR_ALL_USER_INFO: "CLEAR_ALL_USER_INFO",
};
// <----------------------

const updateUserLocalStorage = (user) =>
  window.localStorage.setItem("user", JSON.stringify(user));

// ---- REDUCER ----
const userReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.GET_ALL_USERS: {
      return {
        ...state,
        allUsers: action.payload,
        showUsers: action.payload,
      };
    }

    case ACTION_TYPES.GET_USER_BY_NAME: {
      return {
        ...state,
        showUsers: action.payload,
      };
    }

    case ACTION_TYPES.GET_CLIENT_INFO: {
      return {
        ...state,
        clientUserInfo: action.payload,
      };
    }

    case ACTION_TYPES.GET_USER_INFO_BY_DEV: {
      return {
        ...state,
        userInfo: action.payload,
      };
    }

    case ACTION_TYPES.GET_ALL_USER_POINTS: {
      return {
        ...state,
        allUserPoints: action.payload,
        userPoints: action.payload,
      };
    }

    case ACTION_TYPES.REFRESH_USER_POINTS: {
      return {
        ...state,
        user: {
          ...state.user,
          points: action.payload,
        },
      };
    }

    case ACTION_TYPES.PUT_USER: {
      const updatedUser = action.payload;
      return {
        ...state,
        user: state.user.id === updatedUser.id ? updatedUser : state.user,
        allUsers: state.allUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
        showUsers: state.allUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      };
    }

    case ACTION_TYPES.UPDATE_USER_POINTS: {
      const { restaurantId, redeemPoints } = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          points: state.user?.points.map((elem) =>
            elem.restaurantId === restaurantId
              ? { ...elem, points: Math.max(elem.points - redeemPoints, 0) }
              : elem,
          ),
        },
      };
    }

    case ACTION_TYPES.LOGIN_USER: {
      return {
        ...state,
        user: action.payload,
      };
    }

    case ACTION_TYPES.LOGOUT_USER: {
      return {
        ...state,
        user: {},
      };
    }

    case ACTION_TYPES.FILTER_BY_STATUS: {
      let filteredSource =
        action.payload === "all"
          ? state.allUsers
          : state.allUsers.filter((user) => user.status === action.payload);

      return {
        ...state,
        showUsers: filteredSource,
      };
    }

    case ACTION_TYPES.FILTER_BY_ROLE: {
      let filteredSource;

      if (action.payload === "user")
        filteredSource = state.allUsers.filter((user) => user.role === "user");
      else if (action.payload === "admin")
        filteredSource = state.allUsers.filter((user) => user.role === "admin");
      else if (action.payload === "dev")
        filteredSource = state.allUsers.filter((user) => user.role === "dev");
      else filteredSource = state.allUsers;

      return {
        ...state,
        showUsers: filteredSource,
      };
    }

    case ACTION_TYPES.FILTER_USERPOINTS_BY_NAME: {
      let filtered = state.allUserPoints.filter((userPoints) =>
        userPoints?.user?.name
          ?.toLowerCase()
          .includes(action.payload.toLowerCase()),
      );
      return {
        ...state,
        userPoints: filtered,
      };
    }

    case ACTION_TYPES.FILTER_USERPOINTS_BY_PHONE: {
      let filtered = state.allUserPoints.filter((userPoints) =>
        userPoints?.user?.phone?.includes(action.payload),
      );
      return {
        ...state,
        userPoints: filtered,
      };
    }

    case ACTION_TYPES.CLEAR_ALL_USER_INFO: {
      return {
        ...state,
        userInfo: [],
      };
    }

    default: {
      return state;
    }
  }
};

export const UserProvider = ({ children }) => {
  const [userState, dispatch] = useReducer(userReducer, initialState);

  // ✅ FUNCIÓN PARA VERIFICAR SI EL TOKEN HA EXPIRADO
  const checkTokenExpiration = () => {
    const token = window.localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.log("El token ha expirado, cerrando sesión...");
          console.warn("El token ha expirado, cerrando sesión...");
          userLogOut();
        }
      } catch (error) {
        console.log("Error al decodificar el token:", error);
        console.error("Error al decodificar el token:", error);
        userLogOut();
      }
    }
  };
  // ✅ SE EJECUTA AL MONTAR EL CONTEXTO PARA VALIDAR EL TOKEN
  useEffect(() => {
    checkTokenExpiration();
  }, []);

  // ✅ SE EJECUTA AL MONTAR EL CONTEXTO PARA SI EXISTE UN USUARIO LOGUEADO Y VALIDA SI TIENE PUNTOS EL USUARIO
  useEffect(() => {
    if (userState.user && userState.user.id) {
      getUserPointsByUser();
    }
  }, []);

  // Efecto para actualizar el localStorage cuando el estado cambia
  useEffect(() => {
    updateUserLocalStorage(userState.user);
  }, [userState.user]);

  // OBTENEMOS TODOS LOS USUARIOS
  const getAllUsers = useCallback(async () => {
    try {
      const response = await getAllUsersService();
      dispatch({
        type: ACTION_TYPES.GET_ALL_USERS,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  // OBTENEMOS UN USUARIO POR EL NAME O EMAIL
  const getUserByName = async (name) => {
    try {
      const response = await getAllUsersService(name, null);
      dispatch({
        type: ACTION_TYPES.GET_USER_BY_NAME,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  // OBTENEMOS UN USUARIO POR EMAIL
  const getUserInfo = useCallback(async (email) => {
    try {
      const response = await getAllUsersService(null, email);
      dispatch({
        type: ACTION_TYPES.GET_USER_INFO_BY_DEV,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }, []);

  // OBTENEMOS LA INFORMACION DEL CLIENTE
  const getClientInfo = useCallback(async (clientId) => {
    try {
      const response = await getUserByID(clientId);
      dispatch({
        type: ACTION_TYPES.GET_CLIENT_INFO,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error?.message;
    }
  }, []);

  const getAllUserPoints = useCallback(async () => {
    try {
      const response = await getAllUserPointsService();
      dispatch({
        type: ACTION_TYPES.GET_ALL_USER_POINTS,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error?.message;
    }
  }, []);

  const getUserPointsByUser = useCallback(async () => {
    try {
      if (userState.user && userState.user.id) {
        const response = await getAllUserPointsService({
          userId: userState.user.id,
        });
        dispatch({
          type: ACTION_TYPES.REFRESH_USER_POINTS,
          payload: response,
        });
      }
    } catch (error) {
      throw error.response?.data?.message || error?.message;
    }
  }, [userState.user]);

  const getUserPointsByRestaurant = useCallback(
    async (restaurantId, filters = {}) => {
      try {
        const response = await getAllUserPointsService({
          restaurantId,
          ...filters,
        });

        dispatch({
          type: ACTION_TYPES.GET_ALL_USER_POINTS,
          payload: response,
        });
        return response;
      } catch (error) {
        throw error.response?.data?.message || error?.message;
      }
    },
    [],
  );

  const getClientByUserNumber = useCallback(
    async (restaurantId, userNumber) => {
      try {
        const response = await getAllUserPointsService({
          restaurantId,
          userNumber,
        });

        const userPointsRecord = Array.isArray(response) ? response[0] : null;
        return userPointsRecord?.user || null;
      } catch (error) {
        throw error.response?.data?.message || error?.message || error;
      }
    },
    [],
  );

  const userModifier = async (user) => {
    try {
      const response = await updateUserService(user);
      dispatch({
        type: ACTION_TYPES.PUT_USER,
        payload: response,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const updateUserPoints = (restaurantId, redeemPoints) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_USER_POINTS,
      payload: {
        restaurantId,
        redeemPoints,
      },
    });
  };

  // INICIO DE SESIÓN DEL USUARIO
  const userLogin = async (user) => {
    try {
      const { user: loggedInUser, token } = await userLoginService(user);
      window.localStorage.setItem("token", token);
      dispatch({
        type: ACTION_TYPES.LOGIN_USER,
        payload: loggedInUser,
      });
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  // CERRAR SESIÓN DEL USUARIO
  const userLogOut = () => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("token");
    dispatch({ type: ACTION_TYPES.LOGOUT_USER });
  };

  // FILTRO DE USUARIOS POR STATUS
  const filterUserByStatus = (status) => {
    dispatch({ type: ACTION_TYPES.FILTER_BY_STATUS, payload: status });
  };

  // FILTRO DE USUARIOS POR ROLE
  const filterUserByRole = (role) => {
    dispatch({ type: ACTION_TYPES.FILTER_BY_ROLE, payload: role });
  };

  // FILTRO DE USERPOINTS POR NOMBRE
  const filteredUserPointsByName = (name) => {
    dispatch({ type: ACTION_TYPES.FILTER_USERPOINTS_BY_NAME, payload: name });
  };

  // FILTRO DE USERPOINTS POR TELÉFONO
  const filteredUserPointsByPhone = (phone) => {
    dispatch({
      type: ACTION_TYPES.FILTER_USERPOINTS_BY_PHONE,
      payload: phone,
    });
  };

  // LIMPIAMOS TODA LA INFORMACION TRAIDA AL PANEL DE DEV DE UN USUARIO
  const clearAllUserInfo = () => {
    dispatch({
      type: ACTION_TYPES.CLEAR_ALL_USER_INFO,
    });
  };

  return (
    <UserContext.Provider
      value={{
        userState,
        getAllUsers,
        getUserByName,
        getUserInfo,
        getClientInfo,
        getAllUserPoints,
        getUserPointsByUser,
        getUserPointsByRestaurant,
        getClientByUserNumber,
        userModifier,
        updateUserPoints,
        userLogin,
        userLogOut,
        filterUserByStatus,
        filterUserByRole,
        filteredUserPointsByName,
        filteredUserPointsByPhone,
        clearAllUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
