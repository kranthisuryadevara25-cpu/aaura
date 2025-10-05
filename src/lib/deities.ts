
export type Deity = {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: { url: string; hint: string }[];
  mantras: {
    sanskrit: string;
    translation: string;
  }[];
  stotras: {
    title: string;
    sanskrit: string;
    translation: string;
  }[];
};

export const deities: Deity[] = [
  {
    id: "1",
    slug: "ganesha",
    name: "Ganesha",
    description: "Ganesha, also known as Ganapati and Vinayaka, is one of the best-known and most worshipped deities in the Hindu pantheon. He is the remover of obstacles, the patron of arts and sciences, and the deva of intellect and wisdom.",
    images: [
      { url: "https://picsum.photos/seed/ganesha1/600/400", hint: "Ganesha statue" },
      { url: "https://picsum.photos/seed/ganesha2/600/400", hint: "Ganesha painting" },
      { url: "https://picsum.photos/seed/ganesha3/600/400", hint: "Ganesha worship" },
    ],
    mantras: [
      {
        sanskrit: "ॐ गं गणपतये नमः",
        translation: "Om Gam Ganapataye Namaha: 'I bow to the Lord of the Ganas (Ganesha).'"
      },
      {
        sanskrit: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
        translation: "Vakratunda Mahakaya: 'O Lord with the curved trunk and mighty body, whose splendor is equal to a million suns, please make all my endeavors free of obstacles, always.'"
      }
    ],
    stotras: [
        {
            title: "Sankata Nashanam Ganapati Stotram",
            sanskrit: "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम् । भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये ॥",
            translation: "Pranamya Shirasa Devam: 'Bowing my head to the divine son of Gauri, Vinayaka, I remember him who resides in the hearts of devotees, for the fulfillment of a long life, desires, and prosperity.'"
        }
    ]
  },
  {
    id: "2",
    slug: "shiva",
    name: "Shiva",
    description: "Shiva is one of the principal deities of Hinduism, known as the 'destroyer' within the Trimurti, the Hindu trinity that includes Brahma and Vishnu. In the Shaivite tradition, Shiva is the Supreme Lord who creates, protects, and transforms the universe.",
    images: [
        { url: "https://picsum.photos/seed/shiva1/600/400", hint: "Shiva statue" },
        { url: "https://picsum.photos/seed/shiva2/600/400", hint: "Mount Kailash" },
        { url: "https://picsum.photos/seed/shiva3/600/400", hint: "Shiva meditation" },
    ],
    mantras: [
      {
        sanskrit: "ॐ नमः शिवाय",
        translation: "Om Namah Shivaya: 'I bow to Shiva.' This mantra is one of the most important in Shaivism."
      }
    ],
    stotras: [
        {
            title: "Shiva Tandava Stotram",
            sanskrit: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ।",
            translation: "Jatatavigalajjala: 'From the forest of his matted hair, the celestial Ganga flows, sanctifying the ground. On his neck, a high garland of a serpent hangs.'"
        }
    ]
  },
  {
    id: "3",
    slug: "vishnu",
    name: "Vishnu",
    description: "Vishnu is the preserver god in the Hindu Trimurti. He is the supreme being in the Vaishnavite tradition and is conceived as 'the Preserver or the Protector' within the Trimurti. Vishnu is known for his ten avatars, or incarnations, who descend to Earth to restore cosmic order.",
    images: [
        { url: "https://picsum.photos/seed/vishnu1/600/400", hint: "Vishnu statue" },
        { url: "https://picsum.photos/seed/vishnu2/600/400", hint: "Vishnu avatar" },
        { url: "https://picsum.photos/seed/vishnu3/600/400", hint: "Ananta Shesha" },
    ],
    mantras: [
      {
        sanskrit: "ॐ नमो भगवते वासुदेवाय",
        translation: "Om Namo Bhagavate Vasudevaya: 'I bow to the Lord Vāsudeva (an epithet of Vishnu/Krishna).'"
      }
    ],
    stotras: [
      {
        title: "Vishnu Sahasranama",
        sanskrit: "विश्वं विष्णुर्वषट्कारो भूतभव्यभवत्प्रभुः । भूतकृद्भूतभृद्भावो भूतात्मा भूतभावनः ॥",
        translation: "Vishvam Vishnur Vashatkaro: 'He is the universe, the pervader, the one for whom the sacred offering is made. He is the lord of the past, present, and future...'"
      }
    ]
  }
];

export const getDeityBySlug = (slug: string) => {
    return deities.find(d => d.slug === slug);
}
