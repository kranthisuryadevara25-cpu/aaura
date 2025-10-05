
export type Festival = {
    id: string;
    slug: string;
    name: string;
    description: string;
    date: Date;
    duration: string;
    significance: string;
    rituals: string[];
    associatedDeities: string[]; // deity slugs
    image: { url: string; hint: string };
};

// Note: Dates are placeholders and should be managed dynamically in a real app.
export const festivals: Festival[] = [
    {
        id: "1",
        slug: "diwali",
        name: "Diwali",
        description: "The festival of lights, one of the most popular festivals of Hinduism, symbolizing the spiritual victory of light over darkness, good over evil, and knowledge over ignorance.",
        date: new Date(new Date().getFullYear(), 10, 1), // Approx. November 1
        duration: "5 days",
        significance: "Diwali honors the return of Lord Rama, his wife Sita, and his brother Lakshmana from a 14-year exile and a war in which Rama defeated the demon king Ravana.",
        rituals: [
            "Cleaning and decorating homes with lights (diyas) and rangoli.",
            "Lakshmi Puja to welcome the Goddess of Wealth.",
            "Exchanging gifts and sweets with family and friends.",
            "Bursting firecrackers (though this is becoming less common due to environmental concerns)."
        ],
        associatedDeities: ["lakshmi", "ganesha", "rama"],
        image: { url: "https://picsum.photos/seed/diwali1/800/600", hint: "festival lights" }
    },
    {
        id: "2",
        slug: "holi",
        name: "Holi",
        description: "The festival of colors, celebrating the arrival of spring, the end of winter, the blossoming of love, and for many, a festive day to meet others, play and laugh, forget and forgive, and repair broken relationships.",
        date: new Date(new Date().getFullYear(), 2, 25), // Approx. March 25
        duration: "2 days",
        significance: "Holi celebrates the eternal and divine love of Radha and Krishna. It also signifies the triumph of good over evil, commemorating the victory of Vishnu as Narasimha Narayana over Hiranyakashipu.",
        rituals: [
            "Holika Dahan: A bonfire is lit the night before Holi, symbolizing the burning of the demoness Holika.",
            "Playing with colors: People playfully throw and apply colored powder (gulal) and colored water on each other.",
            "Singing and dancing to traditional Holi songs.",
            "Sharing special sweets like Gujiya."
        ],
        associatedDeities: ["krishna", "radha", "vishnu"],
        image: { url: "https://picsum.photos/seed/holi1/800/600", hint: "festival colors" }
    },
    {
        id: "3",
        slug: "ganga-dussehra",
        name: "Ganga Dussehra",
        description: "This Hindu festival celebrates the avatarana (descent) of the Ganges (Ganga) to Earth from heaven.",
        date: new Date(new Date().getFullYear(), 5, 16), // Approx. June 16
        duration: "1 day (rituals span 10 days)",
        significance: "It is believed that on this day, the holy river Ganga descended from heaven to Earth. Devotees believe that taking a dip in the Ganges on this day can purify them of all sins.",
        rituals: [
            "Taking a holy dip in the river Ganga.",
            "Performing aarti on the banks of the river.",
            "Donating items like food, clothes, and money.",
            "Chanting mantras dedicated to Goddess Ganga."
        ],
        associatedDeities: ["ganga", "shiva"],
        image: { url: "https://picsum.photos/seed/ganga1/800/600", hint: "holy river worship" }
    }
];

export const getFestivalBySlug = (slug: string) => {
    return festivals.find(f => f.slug === slug);
}

