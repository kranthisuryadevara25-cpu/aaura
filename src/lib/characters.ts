
import { deities } from "./deities";

export type Character = {
    id: string;
    slug: string;
    name: {
        en: string;
        hi: string;
        te: string;
        mr: string;
        ta: string;
        kn: string;
        bn: string;
      };
    description: {
        en: string;
        hi: string;
        te: string;
        mr: string;
        ta: string;
        kn: string;
        bn: string;
      };
    role: {
        en: string;
        hi: string;
        te: string;
        mr: string;
        ta: string;
        kn: string;
        bn: string;
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
            te: "హనుమంతుడు",
            mr: "हनुमान",
            ta: "ஹனுமான்",
            kn: "ಹನುಮಾನ್",
            bn: "হনুমান",
        },
        description: {
            en: "An ardent devotee of Lord Rama, Hanuman is a central character in the Ramayana epic. He is a divine vanara (monkey-like humanoid) and is known for his immense strength, devotion, and courage.",
            hi: "भगवान राम के एक उत्साही भक्त, हनुमान रामायण महाकाव्य में एक केंद्रीय चरित्र हैं। वह एक दिव्य वानर (बंदर जैसा मानव) है और अपनी अपार शक्ति, भक्ति और साहस के लिए जाना जाता है।",
            te: "శ్రీరాముని తీవ్ర భక్తుడైన హనుమంతుడు రామాయణ ఇతిహాసంలో ఒక ప్రధాన పాత్ర. అతను ఒక దివ్య వానర (కోతిలాంటి మానవరూపం) మరియు అపారమైన బలం, భక్తి మరియు ధైర్యానికి ప్రసిద్ధి చెందాడు.",
            mr: "भगवान रामाचा एकनिष्ठ भक्त, हनुमान रामायण महाकाव्यातील एक मध्यवर्ती पात्र आहे. तो एक दिव्य वानर (माकडासारखा मानव) आहे आणि त्याच्या प्रचंड शक्ती, भक्ती आणि धैर्यासाठी ओळखला जातो.",
            ta: "ராமர் மீது தீவிர பக்தி கொண்ட அனுமன், ராமாயண காவியத்தில் ஒரு முக்கிய பாத்திரம். அவர் ஒரு தெய்வீக வானரம் (குரங்கு போன்ற மனிதர்) மற்றும் அவரது மகத்தான வலிமை, பக்தி மற்றும் தைரியத்திற்காக அறியப்படுகிறார்.",
            kn: "ಭಗವಾನ್ ರಾಮನ ನಿಷ್ಠಾವಂತ ಭಕ್ತನಾದ ಹನುಮಂತನು ರಾಮಾಯಣ ಮಹಾಕಾವ್ಯದ ಕೇಂದ್ರ ಪಾತ್ರ. ಅವನು ದೈವಿಕ ವಾನರ (ಕೋತಿಯಂತಹ ಮಾನವ) ಮತ್ತು ಅವನ ಅಪಾರ ಶಕ್ತಿ, ಭಕ್ತಿ ಮತ್ತು ಧೈರ್ಯಕ್ಕೆ ಹೆಸರುವಾಸಿಯಾಗಿದ್ದಾನೆ.",
            bn: "ভগবান রামের একনিষ্ঠ ভক্ত, হনুমান রামায়ণ মহাকাব্যের একটি কেন্দ্রীয় চরিত্র। তিনি একজন দিব্য বানর (বানরের মতো মানব) এবং তাঁর অপরিমেয় শক্তি, ভক্তি এবং সাহসের জন্য পরিচিত।",
        },
        role: {
            en: "Epic Hero / Devotee",
            hi: "महाकाव्य नायक / भक्त",
            te: "పురాణ వీరుడు / భక్తుడు",
            mr: "महाकाव्य नायक / भक्त",
            ta: "காவிய நாயகன் / பக்தர்",
            kn: "ಮಹಾಕಾವ್ಯದ ನಾಯಕ / ಭಕ್ತ",
            bn: "মহাকাব্যিক নায়ক / ভক্ত",
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
            te: "అర్జునుడు",
            mr: "अर्जुन",
            ta: "அர்ஜுனன்",
            kn: "ಅರ್ಜುನ",
            bn: "অর্জুন",
        },
        description: {
            en: "One of the five Pandava brothers and a central figure in the Mahabharata. He is a master archer and the recipient of the Bhagavad Gita's wisdom from Lord Krishna.",
            hi: "पांच पांडव भाइयों में से एक और महाभारत में एक केंद्रीय व्यक्ति। वह एक महान धनुर्धर है और भगवान कृष्ण से भगवद्गीता का ज्ञान प्राप्त करने वाला है।",
            te: "ఐదుగురు పాండవ సోదరులలో ఒకడు మరియు మహాభారతంలో ఒక ప్రధాన వ్యక్తి. అతను ఒక గొప్ప విలుకాడు మరియు శ్రీకృష్ణుడి నుండి భగవద్గీత జ్ఞానాన్ని పొందినవాడు.",
            mr: "पाच पांडव भावांपैकी एक आणि महाभारतातील एक मध्यवर्ती व्यक्ती. तो एक महान धनुर्धारी आहे आणि भगवान कृष्णाकडून भगवद्गीतेचे ज्ञान प्राप्त करणारा आहे.",
            ta: "ஐந்து பாண்டவ சகோதரர்களில் ஒருவர் மற்றும் மகாபாரதத்தில் ஒரு முக்கிய நபர். அவர் ஒரு தலைசிறந்த வில்லாளன் மற்றும் பகவான் கிருஷ்ணரிடமிருந்து பகவத் கீதையின் ஞானத்தைப் பெற்றவர்.",
            kn: "ಐದು ಪಾಂಡವ ಸಹೋದರರಲ್ಲಿ ಒಬ್ಬ ಮತ್ತು ಮಹಾಭಾರತದ ಕೇಂದ್ರ ವ್ಯಕ್ತಿ. ಅವನು ಬಿಲ್ಲುಗಾರಿಕೆಯಲ್ಲಿ ನಿಪುಣ ಮತ್ತು ಭಗವಾನ್ ಕೃಷ್ಣನಿಂದ ಭಗವದ್ಗೀತೆಯ ಜ್ಞಾನವನ್ನು ಪಡೆದವನು.",
            bn: "পাঁচ পাণ্ডব ভাইদের মধ্যে একজন এবং মহাভারতের একজন কেন্দ্রীয় ব্যক্তিত্ব। তিনি একজন দক্ষ তীরন্দাজ এবং ভগবান কৃষ্ণের কাছ থেকে ভগবদ্গীতার জ্ঞান লাভ করেন।",
        },
        role: {
            en: "Epic Hero / Warrior",
            hi: "महाकाव्य नायक / योद्धा",
            te: "పురాణ వీరుడు / యోధుడు",
            mr: "महाकाव्य नायक / योद्धा",
            ta: "காவிய நாயகன் / போர்வீரன்",
            kn: "ಮಹಾಕಾವ್ಯದ ನಾಯಕ / ಯೋಧ",
            bn: "মহাকাব্যিক নায়ক / যোদ্ধা",
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
            te: "సీత",
            mr: "सीता",
            ta: "சீதை",
            kn: "ಸೀತೆ",
            bn: "সীতা",
        },
        description: {
            en: "The consort of Lord Rama and an incarnation of the goddess Lakshmi. She is the female protagonist of the Ramayana and is esteemed as a paragon of spousal and feminine virtues.",
            hi: "भगवान राम की पत्नी और देवी लक्ष्मी का अवतार। वह रामायण की महिला नायक हैं और उन्हें पति-पत्नी और स्त्री गुणों के प्रतिमान के रूप में सम्मानित किया जाता है।",
            te: "శ్రీరాముని భార్య మరియు లక్ష్మీదేవి అవతారం. ఆమె రామాయణం యొక్క మహిళా కథానాయిక మరియు భార్య మరియు స్త్రీ ధర్మాల ప్రతిరూపంగా గౌరవించబడుతుంది.",
            mr: "भगवान रामाची पत्नी आणि देवी लक्ष्मीचा अवतार. ती रामायणाची नायिका आहे आणि तिला पत्नी आणि स्त्री गुणांचा आदर्श म्हणून गौरवले जाते.",
            ta: "ராமர் மனைவி மற்றும் லட்சுமி தேவியின் அவதாரம். அவர் ராமாயணத்தின் பெண் கதாநாயகி மற்றும் கணவன்-மனைவி மற்றும் பெண் நற்பண்புகளின் முன்மாதிரியாக மதிக்கப்படுகிறார்.",
            kn: "ಭಗವಾನ್ ರಾಮನ ಪತ್ನಿ ಮತ್ತು ಲಕ್ಷ್ಮಿ ದೇವಿಯ ಅವತಾರ. ಅವಳು ರಾಮಾಯಣದ ನಾಯಕಿ ಮತ್ತು ಪತಿ-ಪತ್ನಿ ಮತ್ತು ಸ್ತ್ರೀ ಗುಣಗಳ ಪ್ರತಿರೂಪವಾಗಿ ಗೌರವಿಸಲ್ಪಡುತ್ತಾಳೆ.",
            bn: "ভগবান রামের স্ত্রী এবং দেবী লক্ষ্মীর অবতার। তিনি রামায়ণের নায়িকা এবং স্বামী-স্ত্রী ও নারী গুণের প্রতিমূর্তি হিসাবে সম্মানিত হন।",
        },
        role: {
            en: "Goddess / Queen",
            hi: "देवी / रानी",
            te: "దేవత / రాణి",
            mr: "देवी / राणी",
            ta: "தெய்வம் / ராணி",
            kn: "ದೇವಿ / ರಾಣಿ",
            bn: "দেবী / রানী",
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
        role: { en: "Deity", hi: "देवता", te: "దేవత", mr: "देवता", ta: "தெய்வம்", kn: "ದೇವತೆ", bn: "দেবতা" },
        image: deity.images[0],
        associatedStories: [],
        attributes: ["Divine", "Powerful"]
    }))
];

export const getCharacterBySlug = (slug: string) => {
    return characters.find(c => c.slug === slug);
}
