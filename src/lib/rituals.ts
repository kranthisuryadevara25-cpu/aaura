export type Ritual = {
    id: string;
    slug: string;
    name: string;
    deity: string;
    description: string;
    procedure: string[];
    itemsRequired: string[];
    auspiciousTime: string;
    image: { url: string; hint: string };
};

export const rituals: Ritual[] = [
    {
        id: "1",
        slug: "daily-surya-puja",
        name: "Daily Surya Puja (Sun Worship)",
        deity: "Surya (The Sun God)",
        description: "A simple daily ritual to honor the Sun God, Surya, for health, vitality, and success. Best performed at sunrise.",
        procedure: [
            "Wake up before sunrise and take a bath.",
            "Wear clean clothes.",
            "Take a copper vessel (lota) filled with clean water. You can add red sandalwood paste, red flowers, and rice grains.",
            "Face the rising sun and offer the water by slowly pouring it, keeping your hands raised.",
            "While offering water, chant the Surya mantra: 'Om Suryaya Namah'.",
            "After the offering, bow down to the Sun God and pray for well-being."
        ],
        itemsRequired: ["Copper vessel (lota)", "Water", "Red flower (optional)", "Rice grains (optional)"],
        auspiciousTime: "At sunrise",
        image: { url: "https://picsum.photos/seed/suryapuja/600/400", hint: "sun worship sunrise" }
    },
    {
        id: "2",
        slug: "ganesha-puja-for-new-beginnings",
        name: "Ganesha Puja for New Beginnings",
        deity: "Lord Ganesha",
        description: "Perform this puja before starting any new venture, such as a new job, business, or moving into a new home, to remove obstacles and ensure success.",
        procedure: [
            "Clean the area where the puja will be performed.",
            "Place a small idol or picture of Lord Ganesha.",
            "Light a diya (lamp) and incense sticks.",
            "Offer a fresh flower, preferably a red hibiscus.",
            "Offer a piece of fruit or a sweet, like modak or ladoo.",
            "Chant the Ganesha mantra: 'Om Gam Ganapataye Namah' 11, 21, or 108 times.",
            "Conclude by folding your hands and seeking blessings for your new venture."
        ],
        itemsRequired: ["Ganesha idol/photo", "Diya (lamp) with ghee or oil", "Incense sticks", "Flowers", "Fruit or sweet offering"],
        auspiciousTime: "Beginning of a new venture",
        image: { url: "https://picsum.photos/seed/ganeshapuja/600/400", hint: "Ganesha idol worship" }
    }
];

export const getRitualBySlug = (slug: string) => {
    return rituals.find(r => r.slug === slug);
}
