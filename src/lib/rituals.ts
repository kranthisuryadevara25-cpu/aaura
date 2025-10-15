
export type Ritual = {
    id: string;
    slug: string;
    name: { [key: string]: string };
    deity: { [key: string]: string };
    description: { [key: string]: string };
    procedure: { [key: string]: string[] };
    itemsRequired: { [key: string]: string[] };
    auspiciousTime: { [key: string]: string };
    image: { url: string; hint: string };
    significance: { [key: string]: string };
    benefits: { [key: string]: string[] };
    variations: { [key: string]: string[] };
    commonMistakes: { [key: string]: string[] };
    reflections: { [key: string]: string[] };
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    keywords: string[];
    popularity: number;
};

export const rituals: Ritual[] = [
    {
        id: "1",
        slug: "daily-surya-puja",
        name: {
            en: "Daily Surya Puja (Sun Worship)",
            hi: "दैनिक सूर्य पूजा",
            te: "రోజువారీ సూర్య పూజ",
        },
        deity: {
            en: "Surya (The Sun God)",
            hi: "सूर्य (सूर्य देव)",
            te: "సూర్యుడు (సూర్య దేవుడు)",
        },
        description: {
            en: "A simple daily ritual to honor the Sun God, Surya, for health, vitality, and success. Best performed at sunrise.",
            hi: "स्वास्थ्य, जीवन शक्ति और सफलता के लिए सूर्य देव, सूर्य का सम्मान करने के लिए एक सरल दैनिक अनुष्ठान। सूर्योदय के समय सर्वश्रेष्ठ प्रदर्शन किया जाता है।",
            te: "ఆరోగ్యం, జీవశక్తి మరియు విజయం కోసం సూర్య భగవానుడైన సూర్యుడిని గౌరవించడానికి ఒక సాధారణ రోజువారీ ఆచారం. సూర్యోదయం సమయంలో చేయడం ఉత్తమం.",
        },
        procedure: {
            en: [
                "Wake up before sunrise and take a bath.",
                "Wear clean clothes.",
                "Take a copper vessel (lota) filled with clean water. You can add red sandalwood paste, red flowers, and rice grains.",
                "Face the rising sun and offer the water by slowly pouring it, keeping your hands raised.",
                "While offering water, chant the Surya mantra: 'Om Suryaya Namah' 11 times.",
                "After the offering, bow down to the Sun God and pray for well-being."
            ],
            hi: [], te: []
        },
        itemsRequired: {
           en: ["Copper vessel (lota)", "Water", "Red flower (optional)", "Rice grains (optional)"],
           hi: [], te: []
        },
        auspiciousTime: {
            en: "At sunrise",
            hi: "सूर्योदय के समय",
            te: "సూర్యోదయం సమయంలో",
        },
        image: { url: "https://picsum.photos/seed/suryapuja/600/400", hint: "sun worship sunrise" },
        significance: {
            en: "Honoring the sun, the source of all life and energy on Earth. It is believed to instill discipline, boost confidence, and improve health.",
            hi: "पृथ्वी पर सभी जीवन और ऊर्जा के स्रोत सूर्य का सम्मान करना। यह अनुशासन पैदा करने, आत्मविश्वास बढ़ाने और स्वास्थ्य में सुधार करने वाला माना जाता है।",
            te: "భూమిపై ఉన్న అన్ని జీవ మరియు శక్తికి మూలమైన సూర్యుడిని గౌరవించడం. ఇది క్రమశిక్షణను నింపుతుందని, ఆత్మవిశ్వాసాన్ని పెంచుతుందని మరియు ఆరోగ్యాన్ని మెరుగుపరుస్తుందని నమ్ముతారు.",
        },
        benefits: {
            en: ["Improves mental clarity and focus", "Boosts vitality and energy levels", "Strengthens bones and improves eyesight"],
            hi: [], te: []
        },
        variations: {
            en: ["Some traditions recommend adding a pinch of turmeric to the water.", "Can be performed from a clean balcony or window if direct ground access is not possible."],
            hi: [], te: []
        },
        commonMistakes: {
            en: ["Offering water after the sun has risen high in the sky.", "Pouring the water too quickly.", "Letting the offered water touch your feet."],
            hi: [], te: []
        },
        reflections: {
            en: ["How did you feel after the offering?", "Did you feel a connection with the morning sun's energy?", "What is one thing you are grateful for today?"],
            hi: [], te: []
        },
        difficulty: "Beginner",
        keywords: ["daily", "surya", "sun", "puja", "morning"],
        popularity: 150
    },
    {
        id: "2",
        slug: "ganesha-puja-for-new-beginnings",
        name: {
            en: "Ganesha Puja for New Beginnings",
            hi: "नई शुरुआत के लिए गणेश पूजा",
            te: "కొత్త ప్రారంభాల కోసం గణేశ పూజ",
        },
        deity: {
            en: "Lord Ganesha",
            hi: "भगवान गणेश",
            te: "గణేశుడు",
        },
        description: {
            en: "Perform this puja before starting any new venture, such as a new job, business, or moving into a new home, to remove obstacles and ensure success.",
            hi: "किसी भी नए उद्यम, जैसे नई नौकरी, व्यवसाय, या नए घर में जाने से पहले बाधाओं को दूर करने और सफलता सुनिश्चित करने के लिए इस पूजा को करें।",
            te: "కొత్త ఉద్యోగం, వ్యాపారం లేదా కొత్త ఇంట్లోకి మారడం వంటి ఏదైనా కొత్త పనిని ప్రారంభించే ముందు అడ్డంకులను తొలగించడానికి మరియు విజయాన్ని నిర్ధారించడానికి ఈ పూజను చేయండి.",
        },
        procedure: {
            en: [
                "Clean the area where the puja will be performed.",
                "Place a small idol or picture of Lord Ganesha.",
                "Light a diya (lamp) and incense sticks.",
                "Offer a fresh flower, preferably a red hibiscus.",
                "Offer a piece of fruit or a sweet, like modak or ladoo.",
                "Chant the Ganesha mantra: 'Om Gam Ganapataye Namah' 11, 21, or 108 times.",
                "Conclude by folding your hands and seeking blessings for your new venture."
            ],
            hi: [], te: []
        },
        itemsRequired: {
            en: ["Ganesha idol/photo", "Diya (lamp) with ghee or oil", "Incense sticks", "Flowers", "Fruit or sweet offering"],
            hi: [], te: []
        },
        auspiciousTime: {
            en: "Beginning of a new venture",
            hi: "एक नए उद्यम की शुरुआत",
            te: "కొత్త వెంచర్ ప్రారంభం",
        },
        image: { url: "https://picsum.photos/seed/ganeshapuja/600/400", hint: "Ganesha idol worship" },
        significance: {
            en: "Lord Ganesha is the remover of obstacles (Vighnaharta). Seeking his blessings ensures a smooth path ahead for any new endeavor.",
            hi: "भगवान गणेश विघ्नहर्ता हैं। उनका आशीर्वाद लेने से किसी भी नए प्रयास के लिए आगे का मार्ग सुगम हो जाता है।",
            te: "గణేశుడు విఘ్నహర్త. ఆయన ఆశీస్సులు తీసుకోవడం వల్ల ఏ కొత్త ప్రయత్నానికైనా ముందున్న మార్గం సుగమం అవుతుంది.",
        },
        benefits: {
            en: ["Removes potential obstacles", "Brings good fortune and success", "Provides a sense of confidence and positive energy"],
            hi: [], te: []
        },
        variations: {
            en: ["Can be performed virtually by visualizing the offerings.", "Some people offer Durva grass along with the flower."],
            hi: [], te: []
        },
        commonMistakes: {
            en: ["Performing the puja with a distracted mind.", "Not cleaning the space properly beforehand."],
            hi: [], te: []
        },
        reflections: {
            en: ["What is your biggest hope for this new beginning?", "What obstacle are you asking Lord Ganesha to help you overcome?"],
            hi: [], te: []
        },
        difficulty: "Beginner",
        keywords: ["ganesha", "new beginning", "puja", "success"],
        popularity: 200
    }
];

export const getRitualBySlug = (slug: string) => {
    return rituals.find(r => r.slug === slug);
}
