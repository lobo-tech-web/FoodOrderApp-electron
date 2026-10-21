export const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(parsedDate);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return (
    `Hora: ${values.hour}:${values.minute} · ` +
    `Fecha: ${values.day}-${values.month}-${values.year}`
  );
};

