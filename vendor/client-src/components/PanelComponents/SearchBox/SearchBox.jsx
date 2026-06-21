import { useState, useMemo } from 'react';

// ---- MATERIAL UI ----
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- CONTEXT ----
import { useProducts } from '@/context/Products.jsx';
import { useUser } from '@/context/Users.jsx';
import { useOrders } from '@/context/Orders.jsx';
// -----------------

export const SearchBox = ({
  placeholder = 'Buscar...',
  isUsersPanel,
  isProductPanel,
  isOrderPanel,
  isAllInfoFromUser,
  isUserPointsPanel,
}) => {
  const [loading, setLoading] = useState(false);

  // PRODUCTS CONTEXT
  const { searchProductByName } = useProducts();

  // USERS CONTEXT
  const {
    userState,
    getUserByName,
    getUserInfo,
    filteredUserPointsByName,
    filteredUserPointsByPhone,
  } = useUser();
  const user = useMemo(() => userState.user || {}, [userState.user]);

  // ORDERS CONTEXT
  const { filterOrderByNamePhone } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (isUsersPanel) getUserByName(searchTerm);
      if (isProductPanel) searchProductByName(searchTerm);
      if (isOrderPanel) {
        const isNumeric = /^\d+$/.test(searchTerm); // detecta si es un número
        if (isNumeric) filterOrderByNamePhone('', searchTerm, user.id);
        else filterOrderByNamePhone(searchTerm, '', user.id);
      }
      if (isAllInfoFromUser) await getUserInfo(searchTerm);
      if (isUserPointsPanel) {
        const isNumeric = /^\d+$/.test(searchTerm); // detecta si es un número
        if (isNumeric) filteredUserPointsByPhone(searchTerm);
        else filteredUserPointsByName(searchTerm);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
      setSearchTerm('');
    }
  };

  if (loading) return <LoadingComponent />;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '40px',
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        sx={{
          fontFamily: 'fontFamily.terciary',
          minWidth: '310px',
          '& .MuiOutlinedInput-root': {
            color: 'text.primary',
            height: '40px',
            borderRadius: '4px',
            '& fieldset': {
              borderColor: 'primary.main',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end" size="small">
                <CloseIcon color="primary" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
    </Box>
  );
};
