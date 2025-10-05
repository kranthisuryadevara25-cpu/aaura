
export type Temple = {
  id: string;
  slug: string;
  name: string;
  deity: {
    name: string;
    significance: string;
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
    historical: string;
    mythological: string;
  };
  media: {
    images: { url: string; hint: string }[];
    videos: { url: string; hint: string }[];
  };
  visitingInfo: {
    timings: string;
    festivals: string;
    poojaGuidelines: string;
    dressCode: string;
  };
  nearbyInfo: {
    placesToVisit: string;
    accommodation: string;
    food: string;
    transport: string;
  };
};

export const temples: Temple[] = [
  {
    id: "1",
    slug: "ram-mandir-ayodhya",
    name: "Ram Mandir, Ayodhya",
    deity: {
      name: "Ram Lalla (infant Lord Rama)",
      significance: "Believed to be the birthplace (Ram Janmabhoomi) of Lord Rama, a major avatar of Vishnu.",
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
      historical: "Site of the historic Babri Masjid and a long-standing socio-religious dispute, culminating in the construction of the new temple inaugurated in 2024.",
      mythological: "The epic Ramayana centers around Ayodhya as the capital of the Kosala Kingdom and the divine realm of Lord Rama.",
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
      timings: "Darshan: 7:00 AM - 11:30 AM & 2:00 PM - 7:00 PM. Aarti times vary.",
      festivals: "Ram Navami, Deepavali, and Vivah Panchami are celebrated with grandeur.",
      poojaGuidelines: "Offerings of flowers and sweets are common. Follow temple instructions for specific poojas.",
      dressCode: "Modest attire is required. Shoulders and knees should be covered.",
    },
    nearbyInfo: {
      placesToVisit: "Hanuman Garhi, Kanak Bhawan, Sarayu River Ghats.",
      accommodation: "Various hotels, guesthouses, and dharamshalas are available in Ayodhya. Booking in advance is recommended.",
      food: "Local vegetarian cuisine is widely available. Temple trust provides 'Prasadam'.",
      transport: "Nearest Airport: Ayodhya (AYJ). Well-connected by rail (Ayodhya Dham Jn) and road.",
    },
  },
  {
    id: "2",
    slug: "kedarnath-temple",
    name: "Kedarnath Temple",
    deity: {
      name: "Lord Shiva (as Kedarnath)",
      significance: "One of the twelve Jyotirlingas of Lord Shiva. It is one of the most sacred pilgrimage sites for Hindus.",
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
      historical: "An ancient temple believed to have been built by the Pandavas and revived by Adi Shankaracharya in the 8th century.",
      mythological: "After the Kurukshetra war, the Pandavas sought Shiva's forgiveness. Shiva, avoiding them, took the form of a bull. The hump of the bull is worshipped at Kedarnath.",
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
      timings: "The temple is open only for six months (late April to early November) due to extreme weather conditions. Timings are generally 4:00 AM to 9:00 PM.",
      festivals: "The opening and closing ceremonies are major events. Maha Shivaratri is significant even when the temple is closed.",
      poojaGuidelines: "Devotees can perform various poojas. It's advisable to book them in advance online.",
      dressCode: "Warm clothing is essential. Traditional and modest dress is expected inside the temple.",
    },
    nearbyInfo: {
      placesToVisit: "Bhairavnath Temple, Vasuki Tal, Chorabari Tal (Gandhi Sarovar).",
      accommodation: "Guesthouses by GMVN, private lodges, and tents are available in Kedarnath. Booking is essential.",
      food: "Basic vegetarian food is available. It's advisable to carry some energy bars and snacks.",
      transport: "Nearest motorable road is Gaurikund. From there, it's a 16 km trek. Pony and helicopter services are available.",
    },
  },
];

export const getTempleBySlug = (slug: string) => {
    return temples.find(t => t.slug === slug);
}
