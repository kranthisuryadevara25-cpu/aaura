
export type Story = {
    id: string;
    slug: string;
    title: {
      en: string;
      hi: string;
      te: string;
    };
    summary: {
      en: string;
      hi: string;
      te: string;
    };
    fullText: {
      en: string;
      hi: string;
      te: string;
    };
    image: { url: string; hint: string };
    tags: string[];
    relatedCharacters: string[]; // character slugs
    relatedTemples: string[]; // temple slugs
};

export const stories: Story[] = [
    {
        id: "1",
        slug: "ramayana-summary",
        title: {
            en: "The Ramayana: An Overview",
            hi: "रामायण: एक सिंहावलोकन",
            te: "రామాయణం: ఒక అవలోకనం"
        },
        summary: {
            en: "The Ramayana is an ancient Indian epic which narrates the struggle of the divine prince Rama to rescue his wife Sita from the demon king Ravana. Along with the Mahabharata, it forms the Hindu Itihasa.",
            hi: "रामायण एक प्राचीन भारतीय महाकाव्य है जो राक्षस राजा रावण से अपनी पत्नी सीता को बचाने के लिए दिव्य राजकुमार राम के संघर्ष का वर्णन करता है। महाभारत के साथ, यह हिंदू इतिहास का निर्माण करता है।",
            te: "రామాయణం ఒక ప్రాచీన భారతీయ ఇతిహాసం, ఇది రాక్షస రాజు రావణుడి నుండి తన భార్య సీతను రక్షించడానికి దివ్య యువరాజు రాముడి పోరాటాన్ని వివరిస్తుంది. మహాభారతంతో పాటు, ఇది హిందూ ఇతిహాసాన్ని ఏర్పరుస్తుంది."
        },
        fullText: {
            en: "The full story of the Ramayana is vast and profound, detailing Rama's exile, his alliance with the vanara army, the abduction of Sita, the great battle in Lanka, and his eventual triumphant return to Ayodhya. It is a cornerstone of Hindu literature and a guide to the principles of dharma.",
            hi: "रामायण की पूरी कहानी विशाल और गहन है, जिसमें राम के वनवास, वानर सेना के साथ उनके गठबंधन, सीता के अपहरण, लंका में महान युद्ध और अयोध्या में उनकी अंतिम विजयी वापसी का विवरण है। यह हिंदू साहित्य का एक आधारशिला है और धर्म के सिद्धांतों का मार्गदर्शक है।",
            te: "రామాయణం యొక్క పూర్తి కథ చాలా విస్తృతమైనది మరియు లోతైనది, ఇది రాముడి అరణ్యవాసం, వానర సైన్యంతో అతని పొత్తు, సీత అపహరణ, లంకలో గొప్ప యుద్ధం, మరియు చివరికి అతని విజయవంతమైన అయోధ్యకు తిరిగి రావడం గురించి వివరిస్తుంది. ఇది హిందూ సాహిత్యానికి ఒక మూలస్తంభం మరియు ధర్మ సూత్రాలకు మార్గదర్శకం."
        },
        image: { url: "https://picsum.photos/seed/ramayana1/800/600", hint: "epic battle" },
        tags: ["Ramayana", "Epic", "Dharma", "Rama", "Sita"],
        relatedCharacters: ["rama", "sita", "hanuman", "ravana"],
        relatedTemples: ["ram-mandir-ayodhya"],
    },
    {
        id: "2",
        slug: "mahabharata-summary",
        title: {
            en: "The Mahabharata: An Overview",
            hi: "महाभारत: एक सिंहावलोकन",
            te: "మహాభారతం: ఒక అవలోకనం"
        },
        summary: {
            en: "The Mahabharata is one of the two major Sanskrit epics of ancient India. It narrates the struggle between two groups of cousins in the Kurukshetra War and the fates of the Kaurava and the Pāṇḍava princes.",
            hi: "महाभारत प्राचीन भारत के दो प्रमुख संस्कृत महाकाव्यों में से एक है। यह कुरुक्षेत्र युद्ध में चचेरे भाइयों के दो समूहों के बीच संघर्ष और कौरव और पांडव राजकुमारों के भाग्य का वर्णन करता है।",
            te: "మహాభారతం ప్రాచీన భారతదేశంలోని రెండు ప్రధాన సంస్కృత ఇతిహాసాలలో ఒకటి. ఇది కురుక్షేత్ర యుద్ధంలో రెండు బంధువుల సమూహాల మధ్య పోరాటాన్ని మరియు కౌరవ మరియు పాండవ రాకుమారుల విధిని వివరిస్తుంది."
        },
        fullText: {
            en: "The Mahabharata is an epic narrative of the Kurukshetra War and the fates of the Kaurava and the Pandava princes. It also contains philosophical and devotional material, such as the Bhagavad Gita, a discourse on dharma, karma, and moksha.",
            hi: "महाभारत कुरुक्षेत्र युद्ध और कौरव और पांडव राजकुमारों के भाग्य का एक महाकाव्य है। इसमें भगवद्गीता जैसे दार्शनिक और भक्ति सामग्री भी शामिल है, जो धर्म, कर्म और मोक्ष पर एक प्रवचन है।",
            te: "మహాభారతం కురుక్షేత్ర యుద్ధం మరియు కౌరవ మరియు పాండవ రాకుమారుల విధి యొక్క ఇతిహాస కథనం. ఇందులో భగవద్గీత వంటి తాత్విక మరియు భక్తి సామగ్రి కూడా ఉంది, ఇది ధర్మం, కర్మ మరియు మోక్షంపై ఒక ఉపన్యాసం."
        },
        image: { url: "https://picsum.photos/seed/mahabharata1/800/600", hint: "chariot battlefield" },
        tags: ["Mahabharata", "Epic", "Dharma", "Krishna", "Arjuna"],
        relatedCharacters: ["arjuna", "krishna"],
        relatedTemples: [],
    },
    {
        id: "3",
        slug: "sita-abduction",
        title: {
            en: "The Abduction of Sita",
            hi: "सीता का अपहरण",
            te: "సీత అపహరణ"
        },
        summary: {
            en: "A pivotal event in the Ramayana, where Sita is deceptively abducted by the demon king Ravana from their forest abode, triggering Rama's quest to rescue her.",
            hi: "रामायण की एक महत्वपूर्ण घटना, जहाँ सीता को राक्षस राजा रावण द्वारा धोखे से उनके वन निवास से अपहरण कर लिया जाता है, जिससे राम को उसे बचाने की खोज शुरू हो जाती है।",
            te: "రామాయణంలో ఒక కీలక సంఘటన, ఇక్కడ సీతను రాక్షస రాజు రావణుడు మోసపూరితంగా వారి అటవీ నివాసం నుండి అపహరిస్తాడు, ఇది ఆమెను రక్షించడానికి రాముడి అన్వేషణను ప్రేరేపిస్తుంది."
        },
        fullText: {
            en: "While Rama was distracted chasing a magical golden deer (the demon Maricha in disguise), Ravana, the king of Lanka, appeared as a wandering ascetic and forcibly carried Sita away to his kingdom in Lanka. This act of adharma set the stage for the epic conflict between Rama and Ravana.",
            hi: "जब राम एक जादुई सुनहरे हिरण (राक्षस मारीच के वेश में) का पीछा करते हुए विचलित हो गए थे, तब लंका का राजा रावण एक भटकते हुए तपस्वी के रूप में प्रकट हुआ और सीता को जबरन लंका में अपने राज्य में ले गया। अधर्म के इस कार्य ने राम और रावण के बीच महाकाव्य संघर्ष का मंच तैयार किया।",
            te: "రాముడు మాయా బంగారు జింకను (రాక్షసుడు మారీచుడు మారువేషంలో) వెంబడిస్తూ పరధ్యానంలో ఉన్నప్పుడు, లంకా రాజు రావణుడు సంచరించే సన్యాసిగా కనిపించి, సీతను బలవంతంగా లంకలోని తన రాజ్యానికి తీసుకువెళ్లాడు. ఈ అధర్మ చర్య రాముడికి మరియు రావణుడికి మధ్య ఇతిహాస ఘర్షణకు వేదికగా నిలిచింది."
        },
        image: { url: "https://picsum.photos/seed/ravana1/800/600", hint: "demon king" },
        tags: ["Ramayana", "Sita", "Ravana", "Abduction"],
        relatedCharacters: ["sita", "rama", "ravana"],
        relatedTemples: [],
    },
];

export const getStoryBySlug = (slug: string) => {
    return stories.find(s => s.slug === slug);
}
