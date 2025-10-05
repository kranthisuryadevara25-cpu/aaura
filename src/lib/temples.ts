
export type Temple = {
  id: string;
  slug: string;
  name: {
    en: string;
    hi: string;
    te: string;
  };
  deity: {
    name: {
      en: string;
      hi: string;
      te: string;
    };
    significance: {
      en: string;
      hi: string;
      te: string;
    };
  };
  location: {
    address: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    geo: {
      lat: number;
      lng: number;
    };
  };
  importance: {
    historical: {
      en: string;
      hi: string;
      te: string;
    };
    mythological: {
      en: string;
      hi: string;
      te: string;
    };
  };
  media: {
    images: { url: string; hint: string }[];
    videos: { url: string; hint: string }[];
  };
  visitingInfo: {
    timings: {
      en: string;
      hi: string;
      te: string;
    };
    festivals: {
      en: string;
      hi: string;
      te: string;
    };
    poojaGuidelines: {
      en: string;
      hi: string;
      te: string;
    };
    dressCode: {
      en: string;
      hi: string;
      te: string;
    };
  };
  nearbyInfo: {
    placesToVisit: {
      en: string;
      hi: string;
      te: string;
    };
    accommodation: {
      en: string;
      hi: string;
      te: string;
    };
    food: {
      en: string;
      hi: string;
      te: string;
    };
    transport: {
      en: string;
      hi: string;
      te: string;
    };
  };
};

export const temples: Temple[] = [
  {
    id: "1",
    slug: "ram-mandir-ayodhya",
    name: {
      en: "Ram Mandir, Ayodhya",
      hi: "राम मंदिर, अयोध्या",
      te: "రామ మందిరం, అయోధ్య"
    },
    deity: {
      name: {
        en: "Ram Lalla (infant Lord Rama)",
        hi: "राम लल्ला (बालक भगवान राम)",
        te: "రామ్ లల్లా (బాల రాముడు)"
      },
      significance: {
        en: "Believed to be the birthplace (Ram Janmabhoomi) of Lord Rama, a major avatar of Vishnu.",
        hi: "माना जाता है कि यह भगवान राम, विष्णु के एक प्रमुख अवतार का जन्मस्थान (राम जन्मभूमि) है।",
        te: "విష్ణువు యొక్క ప్రధాన అవతారమైన శ్రీరాముని జన్మస్థలం (రామ జన్మభూమి) అని నమ్ముతారు."
      },
    },
    location: {
      address: "Ram Path, Ramkot",
      city: "Ayodhya",
      district: "Ayodhya",
      state: "Uttar Pradesh",
      pincode: "224123",
      geo: { lat: 26.7957, lng: 82.1943 },
    },
    importance: {
      historical: {
        en: "Site of the historic Babri Masjid and a long-standing socio-religious dispute, culminating in the construction of the new temple inaugurated in 2024.",
        hi: "ऐतिहासिक बाबरी मस्जिद का स्थल और एक लंबे समय से चला आ रहा सामाजिक-धार्मिक विवाद, जिसका समापन 2024 में उद्घाटन किए गए नए मंदिर के निर्माण में हुआ।",
        te: "చారిత్రాత్మక బాబ్రీ మసీదు మరియు దీర్ఘకాలంగా ఉన్న సామాజిక-మత వివాదానికి ప్రదేశం, ఇది 2024లో ప్రారంభించబడిన కొత్త ఆలయ నిర్మాణంతో ముగిసింది."
      },
      mythological: {
        en: "The epic Ramayana centers around Ayodhya as the capital of the Kosala Kingdom and the divine realm of Lord Rama.",
        hi: "महाकाव्य रामायण अयोध्या को कोशल साम्राज्य की राजधानी और भगवान राम के दिव्य क्षेत्र के रूप में केंद्रित करता है।",
        te: "రామాయణ ఇతిహాసం కోసల రాజ్యానికి రాజధానిగా మరియు శ్రీరాముని దివ్య రాజ్యంగా అయోధ్య చుట్టూ కేంద్రీకృతమై ఉంది."
      },
    },
    media: {
      images: [
        { url: "https://picsum.photos/seed/rammandir1/800/600", hint: "grand temple" },
        { url: "https://picsum.photos/seed/rammandir2/800/600", hint: "temple carvings" },
        { url: "https://picsum.photos/seed/rammandir3/800/600", hint: "devotees praying" },
      ],
      videos: [],
    },
    visitingInfo: {
      timings: {
        en: "Darshan: 7:00 AM - 11:30 AM & 2:00 PM - 7:00 PM. Aarti times vary.",
        hi: "दर्शन: सुबह 7:00 बजे - 11:30 बजे और दोपहर 2:00 बजे - शाम 7:00 बजे। आरती का समय बदलता रहता है।",
        te: "దర్శనం: ఉదయం 7:00 - 11:30 మరియు మధ్యాహ్నం 2:00 - 7:00. హారతి సమయాలు మారుతూ ఉంటాయి."
      },
      festivals: {
        en: "Ram Navami, Deepavali, and Vivah Panchami are celebrated with grandeur.",
        hi: "राम नवमी, दीपावली और विवाह पंचमी भव्यता के साथ मनाई जाती हैं।",
        te: "శ్రీరామనవమి, దీపావళి, మరియు వివాహ పంచమి వైభవంగా జరుపుకుంటారు."
      },
      poojaGuidelines: {
        en: "Offerings of flowers and sweets are common. Follow temple instructions for specific poojas.",
        hi: "फूलों और मिठाइयों का प्रसाद चढ़ाना आम बात है। विशिष्ट पूजा के लिए मंदिर के निर्देशों का पालन करें।",
        te: "పువ్వులు మరియు స్వీట్ల నైవేద్యాలు సాధారణం. నిర్దిష్ట పూజల కోసం ఆలయ సూచనలను అనుసరించండి."
      },
      dressCode: {
        en: "Modest attire is required. Shoulders and knees should be covered.",
        hi: "शिष्ट पोशाक आवश्यक है। कंधे और घुटने ढके होने चाहिए।",
        te: "సాధారణ దుస్తులు అవసరం. భుజాలు మరియు మోకాళ్లు కప్పి ఉండాలి."
      },
    },
    nearbyInfo: {
      placesToVisit: {
        en: "Hanuman Garhi, Kanak Bhawan, Sarayu River Ghats.",
        hi: "हनुमान गढ़ी, कनक भवन, सरयू नदी के घाट।",
        te: "హనుమాన్ గర్హి, కనక్ భవన్, సరయు నది ఘాట్లు."
      },
      accommodation: {
        en: "Various hotels, guesthouses, and dharamshalas are available in Ayodhya. Booking in advance is recommended.",
        hi: "अयोध्या में विभिन्न होटल, गेस्टहाउस और धर्मशालाएं उपलब्ध हैं। अग्रिम बुकिंग की सिफारिश की जाती है।",
        te: "అయోధ్యలో వివిధ హోటళ్లు, అతిథి గృహాలు మరియు ధర్మశాలలు అందుబాటులో ఉన్నాయి. ముందుగా బుక్ చేసుకోవడం మంచిది."
      },
      food: {
        en: "Local vegetarian cuisine is widely available. Temple trust provides 'Prasadam'.",
        hi: "स्थानीय शाकाहारी भोजन व्यापक रूप से उपलब्ध है। मंदिर ट्रस्ट 'प्रसादम' प्रदान करता है।",
        te: "స్థానిక శాకాహార వంటకాలు విస్తృతంగా అందుబాటులో ఉన్నాయి. ఆలయ ట్రస్ట్ 'ప్రసాదం' అందిస్తుంది."
      },
      transport: {
        en: "Nearest Airport: Ayodhya (AYJ). Well-connected by rail (Ayodhya Dham Jn) and road.",
        hi: "निकटतम हवाई अड्डा: अयोध्या (AYJ)। रेल (अयोध्या धाम जंक्शन) और सड़क मार्ग से अच्छी तरह जुड़ा हुआ है।",
        te: "సమీప విమానాశ్రయం: అయోధ్య (AYJ). రైలు (అయోధ్య ధామ్ జం) మరియు రోడ్డు మార్గం ద్వారా బాగా అనుసంధానించబడింది."
      },
    },
  },
  {
    id: "2",
    slug: "kedarnath-temple",
    name: {
      en: "Kedarnath Temple",
      hi: "केदारनाथ मंदिर",
      te: "కేదార్‌నాథ్ ఆలయం"
    },
    deity: {
      name: {
        en: "Lord Shiva (as Kedarnath)",
        hi: "भगवान शिव (केदारनाथ के रूप में)",
        te: "శివుడు (కేదార్‌నాథ్‌గా)"
      },
      significance: {
        en: "One of the twelve Jyotirlingas of Lord Shiva. It is one of the most sacred pilgrimage sites for Hindus.",
        hi: "भगवान शिव के बारह ज्योतिर्लिंगों में से एक। यह हिंदुओं के लिए सबसे पवित्र तीर्थ स्थलों में से एक है।",
        te: "శివుని పన్నెండు జ్యోతిర్లింగాలలో ఒకటి. ఇది హిందువులకు అత్యంత పవిత్రమైన పుణ్యక్షేత్రాలలో ఒకటి."
      },
    },
    location: {
      address: "Kedarnath",
      city: "Kedarnath",
      district: "Rudraprayag",
      state: "Uttarakhand",
      pincode: "246445",
      geo: { lat: 30.7352, lng: 79.0669 },
    },
    importance: {
      historical: {
        en: "An ancient temple believed to have been built by the Pandavas and revived by Adi Shankaracharya in the 8th century.",
        hi: "माना जाता है कि यह एक प्राचीन मंदिर है जिसे पांडवों ने बनवाया था और 8वीं शताब्दी में आदि शंकराचार्य ने इसका पुनरुद्धार किया था।",
        te: "పాండవులు నిర్మించారని మరియు 8వ శతాబ్దంలో ఆదిశంకరాచార్యులచే పునరుద్ధరించబడిందని నమ్మబడే ఒక పురాతన ఆలయం."
      },
      mythological: {
        en: "After the Kurukshetra war, the Pandavas sought Shiva's forgiveness. Shiva, avoiding them, took the form of a bull. The hump of the bull is worshipped at Kedarnath.",
        hi: "कुरुक्षेत्र युद्ध के बाद, पांडवों ने शिव से क्षमा मांगी। शिव ने उनसे बचते हुए एक बैल का रूप धारण किया। केदारनाथ में बैल के कूबड़ की पूजा की जाती है।",
        te: "కురుక్షేత్ర యుద్ధం తరువాత, పాండవులు శివుని క్షమ కోరారు. శివుడు వారిని తప్పించుకుని, ఒక ఎద్దు రూపాన్ని తీసుకున్నాడు. కేదార్‌నాథ్‌లో ఎద్దు యొక్క మూపురం పూజించబడుతుంది."
      },
    },
    media: {
      images: [
        { url: "https://picsum.photos/seed/kedarnath1/800/600", hint: "temple snow" },
        { url: "https://picsum.photos/seed/kedarnath2/800/600", hint: "himalayan mountains" },
        { url: "https://picsum.photos/seed/kedarnath3/800/600", hint: "pilgrims trekking" },
      ],
      videos: [],
    },
    visitingInfo: {
      timings: {
        en: "The temple is open only for six months (late April to early November) due to extreme weather conditions. Timings are generally 4:00 AM to 9:00 PM.",
        hi: "अत्यधिक मौसम की स्थिति के कारण मंदिर केवल छह महीने (अप्रैल के अंत से नवंबर की शुरुआत तक) के लिए खुला रहता है। समय आमतौर पर सुबह 4:00 बजे से रात 9:00 बजे तक होता है।",
        te: "తీవ్రమైన వాతావరణ పరిస్థితుల కారణంగా ఆలయం కేవలం ఆరు నెలలు (ఏప్రిల్ చివరి నుండి నవంబర్ ప్రారంభం వరకు) మాత్రమే తెరిచి ఉంటుంది. సమయాలు సాధారణంగా ఉదయం 4:00 నుండి రాత్రి 9:00 వరకు ఉంటాయి."
      },
      festivals: {
        en: "The opening and closing ceremonies are major events. Maha Shivaratri is significant even when the temple is closed.",
        hi: "उद्घाटन और समापन समारोह प्रमुख कार्यक्रम हैं। मंदिर बंद होने पर भी महा शिवरात्रि महत्वपूर्ण है।",
        te: "ప్రారంభ మరియు ముగింపు వేడుకలు ప్రధాన కార్యక్రమాలు. ఆలయం మూసి ఉన్నప్పటికీ మహా శివరాత్రి ముఖ్యమైనది."
      },
      poojaGuidelines: {
        en: "Devotees can perform various poojas. It's advisable to book them in advance online.",
        hi: "भक्त विभिन्न पूजा कर सकते हैं। उन्हें ऑनलाइन अग्रिम रूप से बुक करने की सलाह दी जाती है।",
        te: "భక్తులు వివిధ పూజలు చేయవచ్చు. వాటిని ముందుగానే ఆన్‌లైన్‌లో బుక్ చేసుకోవడం మంచిది."
      },
      dressCode: {
        en: "Warm clothing is essential. Traditional and modest dress is expected inside the temple.",
        hi: "गर्म कपड़े आवश्यक हैं। मंदिर के अंदर पारंपरिक और मामूली पोशाक की उम्मीद की जाती है।",
        te: "వెచ్చని దుస్తులు అవసరం. ఆలయం లోపల సాంప్రదాయ మరియు సాధారణ దుస్తులు ధరించాలి."
      },
    },
    nearbyInfo: {
      placesToVisit: {
        en: "Bhairavnath Temple, Vasuki Tal, Chorabari Tal (Gandhi Sarovar).",
        hi: "भैरवनाथ मंदिर, वासुकी ताल, चोराबारी ताल (गांधी सरोवर)।",
        te: "భైరవనాథ్ ఆలయం, వాసుకి తాల్, చోరాబరి తాల్ (గాంధీ సరోవర్)."
      },
      accommodation: {
        en: "Guesthouses by GMVN, private lodges, and tents are available in Kedarnath. Booking is essential.",
        hi: "केदारनाथ में जीएमवीएन द्वारा गेस्टहाउस, निजी लॉज और टेंट उपलब्ध हैं। बुकिंग आवश्यक है।",
        te: "కేదార్‌నాథ్‌లో జిఎంవిఎన్ ద్వారా గెస్ట్‌హౌస్‌లు, ప్రైవేట్ లాడ్జీలు మరియు టెంట్లు అందుబాటులో ఉన్నాయి. బుకింగ్ అవసరం."
      },
      food: {
        en: "Basic vegetarian food is available. It's advisable to carry some energy bars and snacks.",
        hi: "बुनियादी शाकाहारी भोजन उपलब्ध है। कुछ एनर्जी बार और स्नैक्स ले जाने की सलाह दी जाती है।",
        te: "ప్రాథమిక శాకాహార భోజనం అందుబాటులో ఉంది. కొన్ని ఎనర్జీ బార్‌లు మరియు స్నాక్స్ తీసుకువెళ్లడం మంచిది."
      },
      transport: {
        en: "Nearest motorable road is Gaurikund. From there, it's a 16 km trek. Pony and helicopter services are available.",
        hi: "निकटतम मोटर योग्य सड़क गौरीकुंड है। वहां से, यह 16 किमी का ट्रेक है। पोनी और हेलीकॉप्टर सेवाएं उपलब्ध हैं।",
        te: "సమీప మోటారు రహదారి గౌరికుండ్. అక్కడ నుండి, ఇది 16 కిలోమీటర్ల ట్రెక్. పోనీ మరియు హెలికాప్టర్ సేవలు అందుబాటులో ఉన్నాయి."
      },
    },
  },
];

export const getTempleBySlug = (slug: string) => {
    return temples.find(t => t.slug === slug);
}
