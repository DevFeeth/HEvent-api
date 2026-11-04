const TIME_ZONE = "Europe/Brussels";

// Same format as the DATE columns (midnight UTC), so that it can be compared with start_date and end_date
export const today = () => new Date(new Intl.DateTimeFormat("en-CA", {timeZone: TIME_ZONE}).format(new Date()));
