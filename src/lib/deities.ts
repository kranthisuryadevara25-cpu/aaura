
export type Deity = {
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
  images: { url: string; hint: string }[];
  mantras: {
    sanskrit: string;
    translation_en: string;
    translation_hi: string;
    translation_te: string;
  }[];
  stotras: {
    title: {
      en: string;
      hi: string;
      te: string;
    };
    sanskrit: string;
    translation_en: string;
    translation_hi: string;
    translation_te: string;
  }[];
};

export const deities: Deity[] = [
  {
    id: "1",
    slug: "ganesha",
    name: {
      en: "Ganesha",
      hi: "गणेश",
      te: "గణేశుడు"
    },
    description: {
      en: "Ganesha, also known as Ganapati and Vinayaka, is one of the best-known and most worshipped deities in the Hindu pantheon. He is the remover of obstacles, the patron of arts and sciences, and the deva of intellect and wisdom.",
      hi: "गणेश, जिन्हें गणपति और विनायक के नाम से भी जाना जाता है, हिंदू देवताओं में सबसे प्रसिद्ध और सबसे अधिक पूजे जाने वाले देवताओं में से एक हैं। वह बाधाओं को दूर करने वाले, कला और विज्ञान के संरक्षक और बुद्धि और ज्ञान के देवता हैं।",
      te: "గణేశుడు, గణపతి మరియు వినాయకుడు అని కూడా పిలుస్తారు, హిందూ దేవతలలో అత్యంత ప్రసిద్ధ మరియు అత్యంత పూజించబడిన దేవతలలో ఒకరు. అతను అడ్డంకులను తొలగించేవాడు, కళలు మరియు విజ్ఞాన శాస్త్రాల పోషకుడు మరియు తెలివితేటలు మరియు జ్ఞానం యొక్క దేవుడు."
    },
    images: [
      { url: "https://picsum.photos/seed/ganesha1/600/400", hint: "Ganesha statue" },
      { url: "https://picsum.photos/seed/ganesha2/600/400", hint: "Ganesha painting" },
      { url: "https://picsum.photos/seed/ganesha3/600/400", hint: "Ganesha worship" },
    ],
    mantras: [
      {
        sanskrit: "ॐ गं गणपतये नमः",
        translation_en: "Om Gam Ganapataye Namaha: 'I bow to the Lord of the Ganas (Ganesha).'",
        translation_hi: "ओम गं गणपतये नमः: 'मैं गणों के स्वामी (गणेश) को नमन करता हूं।'",
        translation_te: "ఓం గం గణపతయే నమః: 'గణాల అధిపతి అయిన గణేశునికి నేను నమస్కరిస్తున్నాను.'"
      },
      {
        sanskrit: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
        translation_en: "Vakratunda Mahakaya: 'O Lord with the curved trunk and mighty body, whose splendor is equal to a million suns, please make all my endeavors free of obstacles, always.'",
        translation_hi: "वक्रतुंड महाकाय: 'हे वक्र सूंड और विशाल शरीर वाले भगवान, जिनकी महिमा करोड़ों सूर्यों के समान है, कृपया मेरे सभी प्रयासों को हमेशा बाधाओं से मुक्त करें।'",
        translation_te: "వక్రతుండ మహాకాయ: 'వంగిన తొండం, బ్రహ్మాండమైన శరీరం గల ఓ ప్రభూ, నీ వైభవం కోటి సూర్యులతో సమానం, దయచేసి నా ప్రయత్నాలన్నీ అడ్డంకులు లేకుండా చేయి.'"
      }
    ],
    stotras: [
        {
            title: {
              en: "Sankata Nashanam Ganapati Stotram",
              hi: "संकट नाशनम गणपति स्तोत्रम",
              te: "సంకట నాశనం గణపతి స్తోత్రం"
            },
            sanskrit: "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम् । भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये ॥",
            translation_en: "Pranamya Shirasa Devam: 'Bowing my head to the divine son of Gauri, Vinayaka, I remember him who resides in the hearts of devotees, for the fulfillment of a long life, desires, and prosperity.'",
            translation_hi: "प्रणम्य शिरसा देवम: 'गौरी के दिव्य पुत्र विनायक को सिर झुकाकर प्रणाम करते हुए, मैं भक्तों के हृदय में निवास करने वाले उन्हें, लंबी आयु, इच्छाओं और समृद्धि की पूर्ति के लिए याद करता हूं।'",
            translation_te: "ప్రణమ్య శిరసా దేవం: 'గౌరీ దేవి దివ్య పుత్రుడైన వినాయకునికి శిరస్సు వంచి నమస్కరించి, భక్తుల హృదయాలలో నివసించే ఆయనను, దీర్ఘాయువు, కోరికలు మరియు శ్రేయస్సు కోసం స్మరించుకుంటాను.'"
        }
    ]
  },
  {
    id: "2",
    slug: "shiva",
    name: {
      en: "Shiva",
      hi: "शिव",
      te: "శివుడు"
    },
    description: {
      en: "Shiva is one of the principal deities of Hinduism, known as the 'destroyer' within the Trimurti, the Hindu trinity that includes Brahma and Vishnu. In the Shaivite tradition, Shiva is the Supreme Lord who creates, protects, and transforms the universe.",
      hi: "शिव हिंदू धर्म के प्रमुख देवताओं में से एक हैं, जिन्हें त्रिमूर्ति के भीतर 'विनाशक' के रूप में जाना जाता है, हिंदू त्रिमूर्ति जिसमें ब्रह्मा और विष्णु शामिल हैं। शैव परंपरा में, शिव सर्वोच्च भगवान हैं जो ब्रह्मांड का निर्माण, संरक्षण और परिवर्तन करते हैं।",
      te: "శివుడు హిందూమతం యొక్క ప్రధాన దేవతలలో ఒకడు, త్రిమూర్తులలో 'వినాశకుడు' అని పిలుస్తారు, బ్రహ్మ మరియు విష్ణువులతో కూడిన హిందూ త్రిమూర్తులు. శైవ సంప్రదాయంలో, శివుడు విశ్వాన్ని సృష్టించే, రక్షించే మరియు మార్చే పరమేశ్వరుడు."
    },
    images: [
        { url: "https://picsum.photos/seed/shiva1/600/400", hint: "Shiva statue" },
        { url: "https://picsum.photos/seed/shiva2/600/400", hint: "Mount Kailash" },
        { url: "https://picsum.photos/seed/shiva3/600/400", hint: "Shiva meditation" },
    ],
    mantras: [
      {
        sanskrit: "ॐ नमः शिवाय",
        translation_en: "Om Namah Shivaya: 'I bow to Shiva.' This mantra is one of the most important in Shaivism.",
        translation_hi: "ओम नमः शिवाय: 'मैं शिव को नमन करता हूं।' यह मंत्र शैव धर्म में सबसे महत्वपूर्ण मंत्रों में से एक है।",
        translation_te: "ఓం నమః శివాయ: 'శివునికి నేను నమస్కరిస్తున్నాను.' ఈ మంత్రం శైవమతంలో అత్యంత ముఖ్యమైన మంత్రాలలో ఒకటి."
      }
    ],
    stotras: [
        {
            title: {
              en: "Shiva Tandava Stotram",
              hi: "शिव तांडव स्तोत्रम",
              te: "శివ తాండవ స్తోత్రం"
            },
            sanskrit: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ।",
            translation_en: "Jatatavigalajjala: 'From the forest of his matted hair, the celestial Ganga flows, sanctifying the ground. On his neck, a high garland of a serpent hangs.'",
            translation_hi: "जटाटवीगलज्जल: 'उनकी जटाओं के वन से, दिव्य गंगा बहती है, भूमि को पवित्र करती है। उनके गले में, एक सर्प की ऊंची माला लटकी हुई है।'",
            translation_te: "జటాటవిగళజ్జల: 'అతని జటాజూట అడవి నుండి, దివ్య గంగా ప్రవహిస్తుంది, భూమిని పవిత్రం చేస్తుంది. అతని మెడలో, ఒక సర్పం యొక్క ఎత్తైన మాల వేలాడుతోంది.'"
        }
    ]
  },
  {
    id: "3",
    slug: "vishnu",
    name: {
      en: "Vishnu",
      hi: "विष्णु",
      te: "విష్ణువు"
    },
    description: {
      en: "Vishnu is the preserver god in the Hindu Trimurti. He is the supreme being in the Vaishnavite tradition and is conceived as 'the Preserver or the Protector' within the Trimurti. Vishnu is known for his ten avatars, or incarnations, who descend to Earth to restore cosmic order.",
      hi: "विष्णु हिंदू त्रिमूर्ति में संरक्षक देवता हैं। वह वैष्णव परंपरा में सर्वोच्च प्राणी हैं और त्रिमूर्ति के भीतर 'संरक्षक या रक्षक' के रूप में जाने जाते हैं। विष्णु अपने दस अवतारों के लिए जाने जाते हैं, जो ब्रह्मांडीय व्यवस्था को बहाल करने के लिए पृथ्वी पर अवतरित होते हैं।",
      te: "విష్ణువు హిందూ త్రిమూర్తులలో సంరక్షక దేవుడు. అతను వైష్ణవ సంప్రదాయంలో అత్యున్నత జీవి మరియు త్రిమూర్తులలో 'సంరక్షకుడు లేదా రక్షకుడు'గా భావించబడ్డాడు. విష్ణువు తన పది అవతారాలకు ప్రసిద్ధి చెందాడు, వారు విశ్వ క్రమాన్ని పునరుద్ధరించడానికి భూమిపైకి వస్తారు."
    },
    images: [
        { url: "https://picsum.photos/seed/vishnu1/600/400", hint: "Vishnu statue" },
        { url: "https://picsum.photos/seed/vishnu2/600/400", hint: "Vishnu avatar" },
        { url: "https://picsum.photos/seed/vishnu3/600/400", hint: "Ananta Shesha" },
    ],
    mantras: [
      {
        sanskrit: "ॐ नमो भगवते वासुदेवाय",
        translation_en: "Om Namo Bhagavate Vasudevaya: 'I bow to the Lord Vāsudeva (an epithet of Vishnu/Krishna).'",
        translation_hi: "ओम नमो भगवते वासुदेवाय: 'मैं भगवान वासुदेव (विष्णु/कृष्ण का एक विशेषण) को नमन करता हूं।'",
        translation_te: "ఓం నమో భగవతే వాసుదేవాయ: 'వాసుదేవునికి (విష్ణు/కృష్ణుడికి మరో పేరు) నేను నమస్కరిస్తున్నాను.'"
      }
    ],
    stotras: [
      {
        title: {
          en: "Vishnu Sahasranama",
          hi: "विष्णु सहस्रनाम",
          te: "విష్ణు సహస్రనామం"
        },
        sanskrit: "विश्वं विष्णुर्वषट्कारो भूतभव्यभवत्प्रभुः । भूतकृद्भूतभृद्भावो भूतात्मा भूतभावनः ॥",
        translation_en: "Vishvam Vishnur Vashatkaro: 'He is the universe, the pervader, the one for whom the sacred offering is made. He is the lord of the past, present, and future...'",
        translation_hi: "विश्वं विष्णुर्वषट्कारो: 'वह ब्रह्मांड है, सर्वव्यापी है, जिसके लिए पवित्र प्रसाद बनाया जाता है। वह भूत, वर्तमान और भविष्य का स्वामी है...'",
        translation_te: "విశ్వం విష్ణుర్వషట్కారో: 'అతను విశ్వం, సర్వవ్యాపి, పవిత్ర నైవేద్యం సమర్పించబడినవాడు. అతను గతం, వర్తమానం మరియు భవిష్యత్తుకు అధిపతి...'"
      }
    ]
  }
];

export const getDeityBySlug = (slug: string) => {
    return deities.find(d => d.slug === slug);
}
