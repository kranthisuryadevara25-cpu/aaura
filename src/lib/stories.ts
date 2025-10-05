export type Story = {
    id: string;
    slug: string;
    title: string;
    summary: string;
    fullText: string;
    image: { url: string; hint: string };
    tags: string[];
    relatedCharacters: string[]; // character slugs
    relatedTemples: string[]; // temple slugs
};

export const stories: Story[] = [
    {
        id: "1",
        slug: "ramayana-summary",
        title: "The Ramayana: An Overview",
        summary: "The Ramayana is an ancient Indian epic which narrates the struggle of the divine prince Rama to rescue his wife Sita from the demon king Ravana. Along with the Mahabharata, it forms the Hindu Itihasa.",
        fullText: "The full story of the Ramayana is vast and profound, detailing Rama's exile, his alliance with the vanara army, the abduction of Sita, the great battle in Lanka, and his eventual triumphant return to Ayodhya. It is a cornerstone of Hindu literature and a guide to the principles of dharma.",
        image: { url: "https://picsum.photos/seed/ramayana1/800/600", hint: "epic battle" },
        tags: ["Ramayana", "Epic", "Dharma", "Rama", "Sita"],
        relatedCharacters: ["rama", "sita", "hanuman", "ravana"],
        relatedTemples: ["ram-mandir-ayodhya"],
    },
    {
        id: "2",
        slug: "mahabharata-summary",
        title: "The Mahabharata: An Overview",
        summary: "The Mahabharata is one of the two major Sanskrit epics of ancient India. It narrates the struggle between two groups of cousins in the Kurukshetra War and the fates of the Kaurava and the Pāṇḍava princes.",
        fullText: "The Mahabharata is an epic narrative of the Kurukshetra War and the fates of the Kaurava and the Pandava princes. It also contains philosophical and devotional material, such as the Bhagavad Gita, a discourse on dharma, karma, and moksha.",
        image: { url: "https://picsum.photos/seed/mahabharata1/800/600", hint: "chariot battlefield" },
        tags: ["Mahabharata", "Epic", "Dharma", "Krishna", "Arjuna"],
        relatedCharacters: ["arjuna", "krishna"],
        relatedTemples: [],
    },
    {
        id: "3",
        slug: "sita-abduction",
        title: "The Abduction of Sita",
        summary: "A pivotal event in the Ramayana, where Sita is deceptively abducted by the demon king Ravana from their forest abode, triggering Rama's quest to rescue her.",
        fullText: "While Rama was distracted chasing a magical golden deer (the demon Maricha in disguise), Ravana, the king of Lanka, appeared as a wandering ascetic and forcibly carried Sita away to his kingdom in Lanka. This act of adharma set the stage for the epic conflict between Rama and Ravana.",
        image: { url: "https://picsum.photos/seed/ravana1/800/600", hint: "demon king" },
        tags: ["Ramayana", "Sita", "Ravana", "Abduction"],
        relatedCharacters: ["sita", "rama", "ravana"],
        relatedTemples: [],
    },
];

export const getStoryBySlug = (slug: string) => {
    return stories.find(s => s.slug === slug);
}
