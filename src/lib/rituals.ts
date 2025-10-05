
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
};

export const rituals: Ritual[] = [
    {
        id: "1",
        slug: "daily-surya-puja",
        name: {
            en: "Daily Surya Puja (Sun Worship)",
            hi: "दैनिक सूर्य पूजा",
            te: "రోజువారీ సూర్య పూజ"
        },
        deity: {
            en: "Surya (The Sun God)",
            hi: "सूर्य (सूर्य देव)",
            te: "సూర్యుడు (సూర్య దేవుడు)"
        },
        description: {
            en: "A simple daily ritual to honor the Sun God, Surya, for health, vitality, and success. Best performed at sunrise.",
            hi: "स्वास्थ्य, जीवन शक्ति और सफलता के लिए सूर्य देव, सूर्य का सम्मान करने के लिए एक सरल दैनिक अनुष्ठान। सूर्योदय के समय सर्वश्रेष्ठ प्रदर्शन किया जाता है।",
            te: "ఆరోగ్యం, జీవశక్తి మరియు విజయం కోసం సూర్య భగవానుడైన సూర్యుడిని గౌరవించడానికి ఒక సాధారణ రోజువారీ ఆచారం. సూర్యోదయం సమయంలో చేయడం ఉత్తమం."
        },
        procedure: {
            en: [
                "Wake up before sunrise and take a bath.",
                "Wear clean clothes.",
                "Take a copper vessel (lota) filled with clean water. You can add red sandalwood paste, red flowers, and rice grains.",
                "Face the rising sun and offer the water by slowly pouring it, keeping your hands raised.",
                "While offering water, chant the Surya mantra: 'Om Suryaya Namah'.",
                "After the offering, bow down to the Sun God and pray for well-being."
            ],
            hi: [
                "सूर्योदय से पहले उठकर स्नान करें।",
                "साफ कपड़े पहनें।",
                "साफ पानी से भरा एक तांबे का बर्तन (लोटा) लें। आप लाल चंदन का लेप, लाल फूल और चावल के दाने मिला सकते हैं।",
                "उगते सूरज का सामना करें और अपने हाथों को ऊपर उठाकर धीरे-धीरे पानी चढ़ाएं।",
                "जल चढ़ाते समय सूर्य मंत्र का जाप करें: 'ओम सूर्याय नमः'।",
                "अर्पण के बाद, सूर्य देव को नमन करें और कल्याण के लिए प्रार्थना करें।"
            ],
            te: [
                "సూర్యోదయానికి ముందే లేచి స్నానం చేయండి.",
                "శుభ్రమైన బట్టలు ధరించండి.",
                "శుభ్రమైన నీటితో నిండిన రాగి పాత్ర (లోటా) తీసుకోండి. మీరు ఎర్ర గంధం పేస్ట్, ఎర్రని పువ్వులు మరియు బియ్యం గింజలను జోడించవచ్చు.",
                "ఉదయిస్తున్న సూర్యుడికి ఎదురుగా నిలబడి, చేతులు పైకెత్తి నెమ్మదిగా నీటిని సమర్పించండి.",
                "నీరు సమర్పిస్తున్నప్పుడు, సూర్య మంత్రాన్ని జపించండి: 'ఓం సూర్యాయ నమః'.",
                "సమర్పణ తర్వాత, సూర్య భగవానుడికి నమస్కరించి, శ్రేయస్సు కోసం ప్రార్థించండి."
            ]
        },
        itemsRequired: {
           en: ["Copper vessel (lota)", "Water", "Red flower (optional)", "Rice grains (optional)"],
           hi: ["तांबे का बर्तन (लोटा)", "पानी", "लाल फूल (वैकल्पिक)", "चावल के दाने (वैकल्पिक)"],
           te: ["రాగి పాత్ర (లోటా)", "నీరు", "ఎర్ర పువ్వు (ఐచ్ఛికం)", "బియ్యం గింజలు (ఐచ్ఛికం)"]
        },
        auspiciousTime: {
            en: "At sunrise",
            hi: "सूर्योदय के समय",
            te: "సూర్యోదయం సమయంలో"
        },
        image: { url: "https://picsum.photos/seed/suryapuja/600/400", hint: "sun worship sunrise" }
    },
    {
        id: "2",
        slug: "ganesha-puja-for-new-beginnings",
        name: {
            en: "Ganesha Puja for New Beginnings",
            hi: "नई शुरुआत के लिए गणेश पूजा",
            te: "కొత్త ప్రారంభాల కోసం గణేశ పూజ"
        },
        deity: {
            en: "Lord Ganesha",
            hi: "भगवान गणेश",
            te: "గణేశుడు"
        },
        description: {
            en: "Perform this puja before starting any new venture, such as a new job, business, or moving into a new home, to remove obstacles and ensure success.",
            hi: "किसी भी नए उद्यम, जैसे नई नौकरी, व्यवसाय, या नए घर में जाने से पहले बाधाओं को दूर करने और सफलता सुनिश्चित करने के लिए इस पूजा को करें।",
            te: "కొత్త ఉద్యోగం, వ్యాపారం లేదా కొత్త ఇంట్లోకి మారడం వంటి ఏదైనా కొత్త పనిని ప్రారంభించే ముందు అడ్డంకులను తొలగించడానికి మరియు విజయాన్ని నిర్ధారించడానికి ఈ పూజను చేయండి."
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
            hi: [
                "उस क्षेत्र को साफ करें जहां पूजा की जाएगी।",
                "भगवान गणेश की एक छोटी मूर्ति या तस्वीर रखें।",
                "एक दीया (दीपक) और अगरबत्ती जलाएं।",
                "एक ताजा फूल चढ़ाएं, अधिमानतः एक लाल गुड़हल।",
                "फल का एक टुकड़ा या मोदक या लड्डू जैसी मिठाई चढ़ाएं।",
                "गणेश मंत्र का 11, 21, या 108 बार जाप करें: 'ओम गं गणपतये नमः'।",
                "हाथ जोड़कर और अपने नए उद्यम के लिए आशीर्वाद मांगकर निष्कर्ष निकालें।"
            ],
            te: [
                "పూజ చేసే ప్రాంతాన్ని శుభ్రం చేయండి.",
                "గణేశుడి చిన్న విగ్రహం లేదా చిత్రాన్ని ఉంచండి.",
                "ఒక దీపం మరియు అగరుబత్తీలను వెలిగించండి.",
                "ఒక తాజా పువ్వును, ప్రాధాన్యంగా ఎర్ర మందార పువ్వును సమర్పించండి.",
                "మోదక్ లేదా లడ్డూ వంటి పండు లేదా స్వీట్ ముక్కను సమర్పించండి.",
                "గణేశ మంత్రాన్ని 11, 21, లేదా 108 సార్లు జపించండి: 'ఓం గం గణపతయే నమః'.",
                "చేతులు జోడించి, మీ కొత్త ప్రయత్నానికి ఆశీర్వాదం కోరుతూ ముగించండి."
            ]
        },
        itemsRequired: {
            en: ["Ganesha idol/photo", "Diya (lamp) with ghee or oil", "Incense sticks", "Flowers", "Fruit or sweet offering"],
            hi: ["गणेश मूर्ति/फोटो", "घी या तेल के साथ दीया (दीपक)", "अगरबत्ती", "फूल", "फल या मीठा प्रसाद"],
            te: ["గణేశ విగ్రహం/ఫోటో", "నెయ్యి లేదా నూనెతో దీపం", "అగరుబత్తీలు", "పువ్వులు", "పండు లేదా తీపి నైవేద్యం"]
        },
        auspiciousTime: {
            en: "Beginning of a new venture",
            hi: "एक नए उद्यम की शुरुआत",
            te: "కొత్త వెంచర్ ప్రారంభం"
        },
        image: { url: "https://picsum.photos/seed/ganeshapuja/600/400", hint: "Ganesha idol worship" }
    }
];

export const getRitualBySlug = (slug: string) => {
    return rituals.find(r => r.slug === slug);
}
