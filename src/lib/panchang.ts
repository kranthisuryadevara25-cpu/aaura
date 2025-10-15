
import { festivals } from "./festivals";
import { Ritual, rituals } from "./rituals";

export type Panchang = {
    date: string;
    tithi: { en: string, hi: string };
    nakshatra: { en: string, hi: string };
    yoga: { en: string, hi: string };
    karana: { en: string, hi: string };
    rahukalam: string;
    yamaGandam: string;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    festivals: { id: string, name: string }[];
    auspiciousActivities: string[];
    wellnessTips: string[];
    relatedRituals: string[]; // slugs
    zodiacInsights: { [key: string]: string };
};

// Mock data generation for any given date
export const getPanchangForDate = (date: Date): Panchang => {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const tithis = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"];
    const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
    const yogas = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];

    // Find festivals for the selected date
    const todaysFestivals = festivals
        .filter(f => {
            const festivalDate = new Date(f.date);
            return festivalDate.getUTCDate() === today.getUTCDate() &&
                   festivalDate.getUTCMonth() === today.getUTCMonth() &&
                   festivalDate.getUTCFullYear() === today.getUTCFullYear()
        })
        .map(f => ({ id: f.slug, name: f.name.en }));

    // Find related rituals
     const relatedRitualSlugs = rituals
        .filter(r => r.keywords.some(k => k === "daily")) // Example logic, can be more complex
        .map(r => r.slug);


    return {
        date: today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        tithi: { en: tithis[dayOfYear % tithis.length], hi: "कोई अनुवाद नहीं" },
        nakshatra: { en: nakshatras[dayOfYear % nakshatras.length], hi: "कोई अनुवाद नहीं" },
        yoga: { en: yogas[dayOfYear % yogas.length], hi: "कोई अनुवाद नहीं" },
        karana: { en: "Bava", hi: "कोई अनुवाद नहीं" },
        rahukalam: `${10 + (dayOfYear % 3)}:45 AM - ${12 + (dayOfYear % 2)}:10 PM`,
        yamaGandam: `03:00 PM - 04:25 PM`,
        sunrise: `06:${15 + (dayOfYear % 10)} AM`,
        sunset: `06:${35 + (dayOfYear % 10)} PM`,
        moonrise: `02:20 PM`,
        moonset: `01:50 AM (Next Day)`,
        festivals: todaysFestivals.length > 0 ? todaysFestivals : [],
        auspiciousActivities: ["Starting new projects", "Spiritual practices", "Meditation"],
        wellnessTips: ["Meditate during Brahma Muhurta (around 4 AM) for enhanced clarity.", "Drink warm water with lemon in the morning."],
        relatedRituals: relatedRitualSlugs,
        zodiacInsights: {
            aries: "A good day for leadership tasks. Channel your energy wisely.",
            taurus: "Focus on financial planning and grounding exercises.",
            gemini: "Communication is key today. Express your thoughts clearly.",
            cancer: "A day for home and family. Nurture your connections.",
            leo: "Creative projects are favored. Let your inner light shine.",
            virgo: "Pay attention to details and organize your tasks.",
            libra: "Focus on balance and harmony in relationships.",
            scorpio: "A transformative day. Embrace change and inner reflection.",
            sagittarius: "A day for learning and exploring new philosophies.",
            capricorn: "Career matters are in focus. Discipline will pay off.",
            aquarius: "Community and social connections are highlighted.",
            pisces: "A day for spiritual practices and trusting your intuition."
        }
    };
};

// Deprecated, use getPanchangForDate instead
export const getTodaysPanchang = (): Panchang => {
   return getPanchangForDate(new Date());
};
