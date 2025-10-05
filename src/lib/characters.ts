import { deities } from "./deities";

export type Character = {
    id: string;
    slug: string;
    name: string;
    description: string;
    role: string;
    image: { url: string; hint: string };
    associatedStories: string[]; // story slugs
    attributes: string[];
};

export const characters: Character[] = [
    {
        id: "1",
        slug: "hanuman",
        name: "Hanuman",
        description: "An ardent devotee of Lord Rama, Hanuman is a central character in the Ramayana epic. He is a divine vanara (monkey-like humanoid) and is known for his immense strength, devotion, and courage.",
        role: "Hero / Devotee",
        image: { url: "https://picsum.photos/seed/hanuman1/600/400", hint: "Hanuman flying" },
        associatedStories: ["ramayana-summary", "sita-abduction"],
        attributes: ["Strength", "Devotion", "Courage", "Loyalty"],
    },
    {
        id: "2",
        slug: "arjuna",
        name: "Arjuna",
        description: "One of the five Pandava brothers and a central figure in the Mahabharata. He is a master archer and the recipient of the Bhagavad Gita's wisdom from Lord Krishna.",
        role: "Hero / Warrior",
        image: { url: "https://picsum.photos/seed/arjuna1/600/400", hint: "warrior archer" },
        associatedStories: ["mahabharata-summary", "kurukshetra-war"],
        attributes: ["Archery", "Dharma", "Bravery"],
    },
    {
        id: "3",
        slug: "sita",
        name: "Sita",
        description: "The consort of Lord Rama and an incarnation of the goddess Lakshmi. She is the female protagonist of the Ramayana and is esteemed as a paragon of spousal and feminine virtues.",
        role: "Goddess / Queen",
        image: { url: "https://picsum.photos/seed/sita1/600/400", hint: "beautiful goddess" },
        associatedStories: ["ramayana-summary", "sita-abduction"],
        attributes: ["Purity", "Devotion", "Resilience"],
    },
    ...deities.map(deity => ({
        id: `deity-${deity.id}`,
        slug: deity.slug,
        name: deity.name,
        description: deity.description,
        role: "Deity",
        image: deity.images[0],
        associatedStories: [],
        attributes: ["Divine", "Powerful"]
    }))
];

export const getCharacterBySlug = (slug: string) => {
    return characters.find(c => c.slug === slug);
}
