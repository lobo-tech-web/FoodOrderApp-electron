import { useState, useEffect, useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// ---------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
import { useOrders } from '@/context/Orders.jsx';
// -----------------

// ---- SERVICES ----
import { getDateForOrdersServices } from '@/services/dates.js';
// ------------------

// ---- STYLES ----
const selectStyle = {
  textAlign: 'center',
  color: 'primary.main',
  minWidth: 70,
  maxHeight: 50,
};
// ----------------

export const FilterByDateOrders = () => {
  const { userState } = useUser();
  const user = useMemo(() => userState.user || {}, [userState.user]);
  const { filterOrderByDate } = useOrders();

  // ESTADOS PARA DIA / MES / AÑO
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // FECHAS TRAIDAS DEL BACK PARA LAS ORDERS
  const [daysDate, setDaysDate] = useState([]);
  const [monthsDate, setMonthsDate] = useState([]);
  const [yearsDate, setYearsDate] = useState([]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'day') setDay(value);
    if (name === 'month') setMonth(value);
    if (name === 'year') setYear(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (day && month && year) filterOrderByDate(day, month, year, user.id);
  };

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const result = await getDateForOrdersServices();
        if (result) {
          setDaysDate(result.days);
          setMonthsDate(result.months);
          setYearsDate(result.years);
        }
      } catch (error) {
        console.log(error.message || 'Error fetching dates');
      }
    };
    fetchDates();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'center',
        alignContent: 'center',
        gap: 2,
      }}
    >
      {/* DIA */}
      <FormControl
        size="small"
        sx={{
          fontFamily: 'fontFamily.terciary',
          color: 'text.primary',
          minWidth: 70,
        }}
      >
        <InputLabel id="day-select-label">DIA</InputLabel>
        <Select
          labelId="day-select-label"
          id="day-select"
          name="day"
          value={day}
          label="DIA"
          sx={selectStyle}
          onChange={handleInputChange}
        >
          {daysDate?.map((day) => (
            <MenuItem
              key={day}
              value={day}
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'text.primary',
              }}
            >
              {day}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* MES */}
      <FormControl
        size="small"
        sx={{
          fontFamily: 'fontFamily.terciary',
          color: 'text.primary',
          minWidth: 70,
        }}
      >
        <InputLabel id="month-select-label">MES</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          name="month"
          value={month}
          label="MES"
          sx={selectStyle}
          onChange={handleInputChange}
        >
          {monthsDate?.map((month) => (
            <MenuItem
              key={month}
              value={month}
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'text.primary',
              }}
            >
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* AÑO */}
      <FormControl
        size="small"
        sx={{
          fontFamily: 'fontFamily.terciary',
          color: 'text.primary',
          minWidth: 70,
        }}
      >
        <InputLabel id="year-select-label">AÑO</InputLabel>
        <Select
          labelId="year-select-label"
          id="year-select"
          name="year"
          value={year}
          label="MES"
          sx={selectStyle}
          onChange={handleInputChange}
        >
          {yearsDate?.map((year) => (
            <MenuItem
              key={year}
              value={year}
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'text.primary',
              }}
            >
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        onClick={handleSubmit}
        sx={{
          borderRadius: '15px',
          padding: '6px 12px',
          m: '1px',
          height: '40px',
          minWidth: '40px',
        }}
      >
        <SearchIcon color="primary" />
      </Button>
    </Box>
  );
};
