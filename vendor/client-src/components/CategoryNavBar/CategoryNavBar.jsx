import { useState, useEffect, useRef } from 'react';

// ---- MATERIAL UI ----
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Fade,
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
// -------------------

// ---- STYLES ----
const menuItemStyle = {
  fontFamily: 'fontFamily.secondary',
  color: '#000',
  bgcolor: '#FFF',
  '&:hover': {
    bgcolor: '#FFF !important',
    color: '#000 !important',
  },
  '&.Mui-selected': {
    bgcolor: '#FFF !important',
    color: '#000 !important',
  },
  '&.Mui-selected:hover': {
    bgcolor: '#FFF !important',
    color: '#000 !important',
  },
};
// ----------------

export const CategoryNavBar = ({ categories }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollContainerRef = useRef(null);

  // Estado para la categoría activa
  const [activeCategory, setActiveCategory] = useState('');
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // HANDLE PARA HACER SCROLLING A LOS PRODUCTOS CON LA CATEGORIA SELECCIONADA
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 90;
      window.scrollTo({
        top: element.offsetTop - offset, // Desplazar hasta la parte superior de la sección y restamos el offset para que scrolle hasta el titulo
        behavior: 'smooth', // Desplazamiento suave
      });
    }
  };

  const handleChange = (event) => {
    const categoryId = event.target.value;
    setActiveCategory(categoryId);
    handleCategoryClick(categoryId);
  };

  // Funciones para scroll horizontal
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Verificar si se necesitan botones de scroll
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } =
        scrollContainerRef.current;
      setShowScrollButtons(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px de margen para evitar problemas de redondeo
    }
  };

  // Detectar categoría visible al hacer scroll en la página
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Ajuste para considerar la altura de la barra

      // Encontrar qué categoría está más visible
      let closestCategory = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      categories.forEach((category) => {
        const element = document.getElementById(`category-${category.id}`);
        if (element) {
          const distance = Math.abs(element.offsetTop - scrollPosition);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCategory = category.id;
          }
        }
      });

      if (closestCategory && closestCategory !== activeCategory) {
        setActiveCategory(closestCategory);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, activeCategory]);

  // Verificar botones de scroll al montar y cuando cambia el tamaño
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  // Verificar botones de scroll cuando el contenedor se desplaza
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  // Establecer la primera categoría como activa al cargar
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        borderRadius: { xs: 0, sm: '16px' },
        bgcolor: 'background.default',
        color: 'primary.main',
        top: 0,
        zIndex: 1000,
        mt: { xs: 0, sm: 2 },
        mx: { xs: 0, sm: 'auto' },
        width: { xs: '100%', sm: '95%' },
        maxWidth: { sm: 1200 },
      }}
    >
      <Toolbar
        sx={{
          p: { xs: 1, sm: 1 },
          minHeight: { xs: '48px', sm: '56px' },
        }}
      >
        {isMobile ? (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <RestaurantMenuIcon color="primary" />
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.primary',
                }}
              >
                Categorias
              </InputLabel>
              <Select
                value={activeCategory}
                onChange={handleChange}
                label="Categorias"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'text.primary',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'text.primary',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'text.primary',
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                    sx={menuItemStyle}
                  >
                    {category.name?.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Fade in={showScrollButtons && canScrollLeft}>
              <IconButton
                size="small"
                onClick={scrollLeft}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'background.default',
                  boxShadow: 1,
                  position: 'absolute',
                  left: 0,
                  zIndex: 2,
                }}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
            </Fade>

            <Box
              ref={scrollContainerRef}
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
                overflow: 'auto',
                scrollbarWidth: 'none', // Firefox
                '&::-webkit-scrollbar': {
                  display: 'none', // Chrome, Safari, Edge
                },
                px: showScrollButtons ? 4 : 0, // Espacio para los botones de scroll
              }}
              onScroll={checkScrollButtons}
            >
              {categories.map((category) => (
                <Button
                  key={category.id}
                  color="primary"
                  variant={
                    activeCategory === category.id ? 'contained' : 'text'
                  }
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color:
                      activeCategory === category.id
                        ? 'primary.secondary'
                        : 'primary.main',
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    mx: 0.5,
                    px: 2,
                    py: 0.75,
                    borderRadius: '20px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor:
                        activeCategory === category.id
                          ? 'text.primary'
                          : 'action.hover',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </Box>

            {/* Botón de scroll derecho */}
            <Fade in={showScrollButtons && canScrollRight}>
              <IconButton
                size="small"
                onClick={scrollRight}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'background.default',
                  boxShadow: 1,
                  position: 'absolute',
                  right: 0,
                  zIndex: 2,
                }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </Fade>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
