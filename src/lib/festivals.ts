
export type Festival = {
    id: string;
    slug: string;
    name: { [key: string]: string };
    description: { [key: string]: string };
    date: Date;
    duration: string;
    significance: { [key: string]: string };
    rituals: { [key: string]: string[] };
    associatedDeities: string[]; // deity slugs
    image: { url: string; hint: string };
};

// Note: Dates are placeholders and should be managed dynamically in a real app.
export const festivals: Festival[] = [
    {
        id: "1",
        slug: "diwali",
        name: {
            en: "Diwali",
            hi: "दिवाली",
            te: "దీపావళి"
        },
        description: {
            en: "The festival of lights, one of the most popular festivals of Hinduism, symbolizing the spiritual victory of light over darkness, good over evil, and knowledge over ignorance.",
            hi: "रोशनी का त्योहार, हिंदू धर्म के सबसे लोकप्रिय त्योहारों में से एक है, जो अंधेरे पर प्रकाश, बुराई पर अच्छाई और अज्ञान पर ज्ञान की आध्यात्मिक जीत का प्रतीक है।",
            te: "దీపాల పండుగ, హిందూమతం యొక్క అత్యంత ప్రసిద్ధ పండుగలలో ఒకటి, ఇది చీకటిపై కాంతి, చెడుపై మంచి, మరియు అజ్ఞానంపై జ్ఞానం యొక్క ఆధ్యాత్మిక విజయాన్ని సూచిస్తుంది."
        },
        date: new Date(new Date().getFullYear(), 10, 1), // Approx. November 1
        duration: "5 days",
        significance: {
            en: "Diwali honors the return of Lord Rama, his wife Sita, and his brother Lakshmana from a 14-year exile and a war in which Rama defeated the demon king Ravana.",
            hi: "दिवाली भगवान राम, उनकी पत्नी सीता और उनके भाई लक्ष्मण की 14 साल के वनवास और एक युद्ध से वापसी का सम्मान करती है जिसमें राम ने राक्षस राजा रावण को हराया था।",
            te: "రాముడు, అతని భార్య సీత మరియు అతని సోదరుడు లక్ష్మణుడు 14 సంవత్సరాల వనవాసం మరియు రాముడు రాక్షస రాజు రావణుడిని ఓడించిన యుద్ధం నుండి తిరిగి రావడాన్ని దీపావళి గౌరవిస్తుంది."
        },
        rituals: {
            en: [
                "Cleaning and decorating homes with lights (diyas) and rangoli.",
                "Lakshmi Puja to welcome the Goddess of Wealth.",
                "Exchanging gifts and sweets with family and friends.",
                "Bursting firecrackers (though this is becoming less common due to environmental concerns)."
            ],
            hi: [
                "घरों को रोशनी (दीयों) और रंगोली से साफ करना और सजाना।",
                "धन की देवी का स्वागत करने के लिए लक्ष्मी पूजा।",
                "परिवार और दोस्तों के साथ उपहार और मिठाइयों का आदान-प्रदान।",
                "पटाखे फोड़ना (हालांकि पर्यावरणीय चिंताओं के कारण यह कम आम होता जा रहा है)।"
            ],
            te: [
                "ఇళ్లను శుభ్రపరచడం మరియు దీపాలు (దియాలు) మరియు రంగోలితో అలంకరించడం.",
                "సంపద దేవతను స్వాగతించడానికి లక్ష్మీ పూజ.",
                "కుటుంబం మరియు స్నేహితులతో బహుమతులు మరియు స్వీట్లు మార్పిడి చేసుకోవడం.",
                "బాణసంచా కాల్చడం (పర్యావరణ ఆందోళనల కారణంగా ఇది తక్కువగా జరుగుతోంది)."
            ]
        },
        associatedDeities: ["lakshmi", "ganesha", "rama"],
        image: { url: "https://picsum.photos/seed/diwali1/800/600", hint: "festival lights" }
    },
    {
        id: "2",
        slug: "holi",
        name: {
            en: "Holi",
            hi: "होली",
            te: "హోలీ"
        },
        description: {
            en: "The festival of colors, celebrating the arrival of spring, the end of winter, the blossoming of love, and for many, a festive day to meet others, play and laugh, forget and forgive, and repair broken relationships.",
            hi: "रंगों का त्योहार, वसंत के आगमन, सर्दियों के अंत, प्यार के खिलने का जश्न मनाता है, और कई लोगों के लिए, दूसरों से मिलने, खेलने और हंसने, भूलने और माफ करने और टूटे हुए रिश्तों को सुधारने का एक उत्सव का दिन है।",
            te: "రంగుల పండుగ, వసంతకాలం రాక, శీతాకాలం ముగింపు, ప్రేమ వికసించడం మరియు చాలా మందికి, ఇతరులను కలవడానికి, ఆడటానికి మరియు నవ్వడానికి, మరచిపోవడానికి మరియు క్షమించడానికి మరియు విరిగిన సంబంధాలను సరిచేసుకోవడానికి ఒక పండుగ రోజు."
        },
        date: new Date(new Date().getFullYear(), 2, 25), // Approx. March 25
        duration: "2 days",
        significance: {
            en: "Holi celebrates the eternal and divine love of Radha and Krishna. It also signifies the triumph of good over evil, commemorating the victory of Vishnu as Narasimha Narayana over Hiranyakashipu.",
            hi: "होली राधा और कृष्ण के शाश्वत और दिव्य प्रेम का जश्न मनाती है। यह बुराई पर अच्छाई की जीत का भी प्रतीक है, जो हिरण्यकश्यप पर नरसिंह नारायण के रूप में विष्णु की जीत की याद दिलाता है।",
            te: "హోలీ రాధ మరియు కృష్ణుల శాశ్వతమైన మరియు దైవిక ప్రేమను జరుపుకుంటుంది. ఇది చెడుపై మంచి సాధించిన విజయాన్ని కూడా సూచిస్తుంది, హిరణ్యకశిపునిపై నరసింహ నారాయణుడిగా విష్ణువు సాధించిన విజయాన్ని గుర్తుచేస్తుంది."
        },
        rituals: {
            en: [
                "Holika Dahan: A bonfire is lit the night before Holi, symbolizing the burning of the demoness Holika.",
                "Playing with colors: People playfully throw and apply colored powder (gulal) and colored water on each other.",
                "Singing and dancing to traditional Holi songs.",
                "Sharing special sweets like Gujiya."
            ],
            hi: [
                "होलिका दहन: होली से एक रात पहले एक अलाव जलाया जाता है, जो राक्षसी होलिका के जलने का प्रतीक है।",
                "रंगों से खेलना: लोग एक-दूसरे पर रंगीन पाउडर (गुलाल) और रंगीन पानी फेंकते और लगाते हैं।",
                "पारंपरिक होली गीतों पर गाना और नाचना।",
                "गुजिया जैसी विशेष मिठाइयाँ साझा करना।"
            ],
            te: [
                "హోలికా దహన్: హోలీకి ముందు రోజు రాత్రి భోగి మంటలు వేస్తారు, ఇది రాక్షసి హోలికను కాల్చడాన్ని సూచిస్తుంది.",
                "రంగులతో ఆడుకోవడం: ప్రజలు ఒకరిపై ఒకరు రంగు పొడి (గులాల్) మరియు రంగు నీటిని సరదాగా విసురుకుంటారు.",
                "సాంప్రదాయ హోలీ పాటలకు పాడటం మరియు నృత్యం చేయడం.",
                "గుజియా వంటి ప్రత్యేక స్వీట్లను పంచుకోవడం."
            ]
        },
        associatedDeities: ["krishna", "radha", "vishnu"],
        image: { url: "https://picsum.photos/seed/holi1/800/600", hint: "festival colors" }
    },
    {
        id: "3",
        slug: "ganga-dussehra",
        name: {
            en: "Ganga Dussehra",
            hi: "गंगा दशहरा",
            te: "గంగా దసరా"
        },
        description: {
            en: "This Hindu festival celebrates the avatarana (descent) of the Ganges (Ganga) to Earth from heaven.",
            hi: "यह हिंदू त्योहार स्वर्ग से पृथ्वी पर गंगा के अवतरण का जश्न मनाता है।",
            te: "ఈ హిందూ పండుగ గంగ స్వర్గం నుండి భూమికి అవతరించడాన్ని (అవతరణ) జరుపుకుంటుంది."
        },
        date: new Date(new Date().getFullYear(), 5, 16), // Approx. June 16
        duration: "1 day (rituals span 10 days)",
        significance: {
            en: "It is believed that on this day, the holy river Ganga descended from heaven to Earth. Devotees believe that taking a dip in the Ganges on this day can purify them of all sins.",
            hi: "माना जाता है कि इस दिन, पवित्र नदी गंगा स्वर्ग से पृथ्वी पर उतरी थी। भक्तों का मानना ​​है कि इस दिन गंगा में डुबकी लगाने से वे सभी पापों से मुक्त हो सकते हैं।",
            te: "ఈ రోజున, పవిత్ర గంగా నది స్వర్గం నుండి భూమికి దిగివచ్చిందని నమ్ముతారు. ఈ రోజున గంగానదిలో స్నానం చేయడం వల్ల అన్ని పాపాలు తొలగిపోతాయని భక్తులు నమ్ముతారు."
        },
        rituals: {
            en: [
                "Taking a holy dip in the river Ganga.",
                "Performing aarti on the banks of the river.",
                "Donating items like food, clothes, and money.",
                "Chanting mantras dedicated to Goddess Ganga."
            ],
            hi: [
                "गंगा नदी में पवित्र स्नान करना।",
                "नदी के किनारे आरती करना।",
                "भोजन, वस्त्र और धन जैसी वस्तुओं का दान करना।",
                "देवी गंगा को समर्पित मंत्रों का जाप करना।"
            ],
            te: [
                "గంగా నదిలో పవిత్ర స్నానం చేయడం.",
                "నది ఒడ్డున హారతి ప్రదర్శించడం.",
                "ఆహారం, బట్టలు మరియు డబ్బు వంటి వస్తువులను దానం చేయడం.",
                "గంగాదేవికి అంకితం చేసిన మంత్రాలను పఠించడం."
            ]
        },
        associatedDeities: ["ganga", "shiva"],
        image: { url: "https://picsum.photos/seed/ganga1/800/600", hint: "holy river worship" }
    }
];

export const getFestivalBySlug = (slug: string) => {
    return festivals.find(f => f.slug === slug);
}
