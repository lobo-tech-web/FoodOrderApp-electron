import { useMemo, useState } from 'react';

// ---- MATERIAL UI ----
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
// ---------------------

// ---- CONTEXT ------>
import { useProducts } from '@/context/Products.jsx';
// <-------------------

// ---- STYLES ----
const selectStyle = {
  textAlign: 'center',
  color: 'primary.main',
  minWidth: 150,
  minHeight: 50,
};
// ----------------

export const FilterByCategory = () => {
  const [filter, setFilter] = useState('');
  const { productState, filterByCategory } = useProducts();

  const allCategories = useMemo(
    () => productState.categorys || [],
    [productState.categorys]
  );

  const handleInputChange = (event) => {
    const selectedCategory = event.target.value;
    setFilter(selectedCategory);
    filterByCategory(selectedCategory);
  };

  return (
    <FormControl
      sx={{
        fontFamily: 'fontFamily.terciary',
        color: 'text.primary',
        marginTop: 1,
        marginBottom: 2,
      }}
    >
      <InputLabel id="category-select-label">CATEGORIAS</InputLabel>
      <Select
        labelId="category-select-label"
        id="category-select"
        value={filter}
        label="CATEGORIAS"
        sx={selectStyle}
        onChange={handleInputChange}
      >
        <MenuItem
          value="all"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          TODOS
        </MenuItem>
        {allCategories.map((category) => (
          <MenuItem
            key={category.id}
            value={category.name}
            sx={{
              fontFamily: 'fontFamily.terciary',
              color: 'text.primary',
            }}
          >
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
