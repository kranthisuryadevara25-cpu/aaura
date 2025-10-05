
import { deities } from "./deities";

export type Character = {
    id: string;
    slug: string;
    name: {
        en: string;
        hi: string;
        te: string;
      };
    description: {
        en: string;
        hi: string;
        te: string;
      };
    role: {
        en: string;
        hi: string;
        te: string;
      };
    image: { url: string; hint: string };
    associatedStories: string[]; // story slugs
    attributes: string[];
};

export const characters: Character[] = [
    {
        id: "1",
        slug: "hanuman",
        name: {
            en: "Hanuman",
            hi: "हनुमान",
            te: "హనుమంతుడు"
        },
        description: {
            en: "An ardent devotee of Lord Rama, Hanuman is a central character in the Ramayana epic. He is a divine vanara (monkey-like humanoid) and is known for his immense strength, devotion, and courage.",
            hi: "भगवान राम के एक उत्साही भक्त, हनुमान रामायण महाकाव्य में एक केंद्रीय चरित्र हैं। वह एक दिव्य वानर (बंदर जैसा मानव) है और अपनी अपार शक्ति, भक्ति और साहस के लिए जाना जाता है।",
            te: "శ్రీరాముని తీవ్ర భక్తుడైన హనుమంతుడు రామాయణ ఇతిహాసంలో ఒక ప్రధాన పాత్ర. అతను ఒక దివ్య వానర (కోతిలాంటి మానవరూపం) మరియు అపారమైన బలం, భక్తి మరియు ధైర్యానికి ప్రసిద్ధి చెందాడు."
        },
        role: {
            en: "Hero / Devotee",
            hi: "नायक / भक्त",
            te: "వీరుడు / భక్తుడు"
        },
        image: { url: "https://picsum.photos/seed/hanuman1/600/400", hint: "Hanuman flying" },
        associatedStories: ["ramayana-summary", "sita-abduction"],
        attributes: ["Strength", "Devotion", "Courage", "Loyalty"],
    },
    {
        id: "2",
        slug: "arjuna",
        name: {
            en: "Arjuna",
            hi: "अर्जुन",
            te: "అర్జునుడు"
        },
        description: {
            en: "One of the five Pandava brothers and a central figure in the Mahabharata. He is a master archer and the recipient of the Bhagavad Gita's wisdom from Lord Krishna.",
            hi: "पांच पांडव भाइयों में से एक और महाभारत में एक केंद्रीय व्यक्ति। वह एक महान धनुर्धर है और भगवान कृष्ण से भगवद्गीता का ज्ञान प्राप्त करने वाला है।",
            te: "ఐదుగురు పాండవ సోదరులలో ఒకడు మరియు మహాభారతంలో ఒక ప్రధాన వ్యక్తి. అతను ఒక గొప్ప విలుకాడు మరియు శ్రీకృష్ణుడి నుండి భగవద్గీత జ్ఞానాన్ని పొందినవాడు."
        },
        role: {
            en: "Hero / Warrior",
            hi: "नायक / योद्धा",
            te: "వీరుడు / యోధుడు"
        },
        image: { url: "https://picsum.photos/seed/arjuna1/600/400", hint: "warrior archer" },
        associatedStories: ["mahabharata-summary", "kurukshetra-war"],
        attributes: ["Archery", "Dharma", "Bravery"],
    },
    {
        id: "3",
        slug: "sita",
        name: {
            en: "Sita",
            hi: "सीता",
            te: "సీత"
        },
        description: {
            en: "The consort of Lord Rama and an incarnation of the goddess Lakshmi. She is the female protagonist of the Ramayana and is esteemed as a paragon of spousal and feminine virtues.",
            hi: "भगवान राम की पत्नी और देवी लक्ष्मी का अवतार। वह रामायण की महिला नायक हैं और उन्हें पति-पत्नी और स्त्री गुणों के प्रतिमान के रूप में सम्मानित किया जाता है।",
            te: "శ్రీరాముని భార్య మరియు లక్ష్మీదేవి అవతారం. ఆమె రామాయణం యొక్క మహిళా కథానాయిక మరియు భార్య మరియు స్త్రీ ధర్మాల ప్రతిరూపంగా గౌరవించబడుతుంది."
        },
        role: {
            en: "Goddess / Queen",
            hi: "देवी / रानी",
            te: "దేవత / రాణి"
        },
        image: { url: "https://picsum.photos/seed/sita1/600/400", hint: "beautiful goddess" },
        associatedStories: ["ramayana-summary", "sita-abduction"],
        attributes: ["Purity", "Devotion", "Resilience"],
    },
    ...deities.map(deity => ({
        id: `deity-${deity.id}`,
        slug: deity.slug,
        name: deity.name,
        description: deity.description,
        role: { en: "Deity", hi: "देवता", te: "దేవత" },
        image: deity.images[0],
        associatedStories: [],
        attributes: ["Divine", "Powerful"]
    }))
];

export const getCharacterBySlug = (slug: string) => {
    return characters.find(c => c.slug === slug);
}
