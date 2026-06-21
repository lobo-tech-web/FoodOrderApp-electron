import { useState } from 'react';

// ---- MATERIAL UI ----
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
// ---------------------

// ---- CONTEXT ----
import { useOrders } from '@/context/Orders.jsx';
// -----------------

// ---- STYLES ----
const selectStyle = {
  textAlign: 'center',
  color: 'primary.main',
  minWidth: 150,
  maxHeight: 50,
};
// ----------------

export const FilterByStatusOrders = () => {
  const [status, setStatus] = useState('all');
  const { filterByStatus } = useOrders();

  const handleInputChange = (event) => {
    const selectedStatus = event.target.value;
    setStatus(selectedStatus);
    filterByStatus(selectedStatus);
  };

  return (
    <FormControl
      sx={{
        fontFamily: 'fontFamily.terciary',
        color: 'text.primary',
        m: 1,
      }}
    >
      <InputLabel id="status-select-label">ESTADOS</InputLabel>
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
          value="PENDIENTE A CONFIRMAR"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          PENDIENTE A CONFIRMAR
        </MenuItem>
        <MenuItem
          value="EN PREPARACIÓN"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          EN PREPARACIÓN
        </MenuItem>
        <MenuItem
          value="EN ENVIO"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          EN ENVIO
        </MenuItem>
        <MenuItem
          value="FINALIZADO"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          FINALIZADO
        </MenuItem>
        <MenuItem
          value="CANCELADO"
          sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
        >
          CANCELADO
        </MenuItem>
      </Select>
    </FormControl>
  );
};
