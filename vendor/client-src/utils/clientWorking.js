// ---- DAYJS ----
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importa español para dayjs
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// ---------------
dayjs.locale('es'); // Configura dayjs en español
dayjs.extend(utc);
dayjs.extend(timezone);


// FUNCIÓN PARA VERIFICAR SI ESTA ABIERTO EL COMERCIO
export const isOpenNow = (clientWorkingHours) => {
    if (!clientWorkingHours) return false;

    const nowArgentina = dayjs().tz('America/Argentina/Buenos_Aires');
    const today = nowArgentina.format('dddd').toUpperCase(); // Obtiene el día en español
    const now = nowArgentina.format('HH:mm'); // Hora actual en formato 24h

    const todayHours = clientWorkingHours[today]; // Busca el horario del día actual

    if (!todayHours || todayHours.length === 0) return false; // Si está vacío, está cerrado

    return todayHours.some(range => {
        const [open, close] = range.split('-'); // Divide el string en apertura y cierre
        if (!open || !close) return false;
        if (open <= close) return now >= open && now <= close;

        // Horario que cruza medianoche: 20:00-01:00
        return now >= open || now <= close;
    });
};

export const getDateNowDayjs = () => {
    const nowArgentina = dayjs().tz('America/Argentina/Buenos_Aires');

    const day = nowArgentina.format('DD');   // "01"
    const month = nowArgentina.format('MM'); // "05"
    const year = nowArgentina.format('YYYY'); // "2025"

    return { day, month, year };
};

export const getNextDateNowDayjs = () => {
    const tomorrowArgentina = dayjs().tz("America/Argentina/Buenos_Aires").add(1, "day");

    const day = tomorrowArgentina.format("DD");
    const month = tomorrowArgentina.format("MM");
    const year = tomorrowArgentina.format("YYYY");

    const dayName = tomorrowArgentina.format('dddd');
    const monthName = tomorrowArgentina.format('MMMM');

    return { day, month, year, dayName, monthName };
};

export const getTimeNowDayjs = () => {
    const nowArgentina = dayjs().tz('America/Argentina/Buenos_Aires');
    return nowArgentina.format('HH:mm:ss'); // Hora actual en formato 24h
};