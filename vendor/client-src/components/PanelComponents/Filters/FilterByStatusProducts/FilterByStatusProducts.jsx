import { useState } from 'react';

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

export const FilterByStatusProducts = () => {
  const [status, setStatus] = useState('all');
  const { filterByStatus } = useProducts();

  const handleInputChange = (event) => {
    const selectedStatus = event.target.value;
    setStatus(selectedStatus);

    const statusValue =
      selectedStatus === 'all' ? 'all' : selectedStatus === 'true';
    filterByStatus(statusValue);
  };

  return (
    <FormControl
      sx={{
        fontFamily: 'fontFamily.terciary',
        marginTop: 1,
        marginBottom: 2,
        color: 'text.primary',
      }}
    >
      <InputLabel id="status-select-label">ESTADO</InputLabel>
      <Select
        labelId="status-select-label"
        id="status-select"
        value={status}
        label="ESTADO"
        sx={selectStyle}
        onChange={handleInputChange}
      >
        <MenuItem
          value="all"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          TODOS
        </MenuItem>
        <MenuItem
          value="true"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          Activos
        </MenuItem>
        <MenuItem
          value="false"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          Desactivados
        </MenuItem>
      </Select>
    </FormControl>
  );
};
