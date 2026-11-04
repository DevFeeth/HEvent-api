const TIME_ZONE = "Europe/Brussels";

export const today = () => new Date(new Intl.DateTimeFormat("en-CA", {timeZone: TIME_ZONE}).format(new Date()));
