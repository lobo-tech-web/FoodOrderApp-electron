import { useState } from 'react';

// ---- MATERIAL UI ----
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
// ---------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- STYLES ----
const selectStyle = {
  textAlign: 'center',
  color: 'primary.main',
  minWidth: 150,
  minHeight: 50,
};
// ----------------

export const FilterByActiveUsers = () => {
  const { filterUserByStatus } = useUser();
  const [status, setStatus] = useState('all');

  const handleInputChange = (event) => {
    const selectedStatus = event.target.value;
    setStatus(selectedStatus);
    const statusValue =
      selectedStatus === 'all' ? 'all' : selectedStatus === 'true';
    filterUserByStatus(statusValue);
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
          Activados
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
