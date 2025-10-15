
import { festivals } from "./festivals";

export type Panchang = {
    date: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    rahukalam: string;
    yamaGandam: string;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    festivals: string[];
};

export const getTodaysPanchang = (): Panchang => {
    // In a real application, this data would be fetched from an API
    // based on the user's location and the current date.
    const today = new Date();
    
    // Find festivals that fall on today's date (ignoring time)
    const todaysFestivals = festivals
        .filter(f => {
            const festivalDate = new Date(f.date);
            return festivalDate.getUTCDate() === today.getUTCDate() &&
                   festivalDate.getUTCMonth() === today.getUTCMonth() &&
                   festivalDate.getUTCFullYear() === today.getUTCFullYear()
        })
        .map(f => f.name.en); // Using English name as the identifier

    // Mock data for today
    return {
        date: today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        tithi: "Shukla Paksha, Dashami",
        nakshatra: "Hasta",
        yoga: "Dhruva",
        karana: "Garija",
        rahukalam: "10:45 AM - 12:10 PM",
        yamaGandam: "03:00 PM - 04:25 PM",
        sunrise: "06:15 AM",
        sunset: "06:35 PM",
        moonrise: "02:20 PM",
        moonset: "01:50 AM (Next Day)",
        festivals: todaysFestivals.length > 0 ? todaysFestivals : []
    };
};
