
export type Plan = {
    id: "sub_annual_49" | "donate_cow_feed" | "donate_sadhu_meal";
    name: string;
    amount: number;
    currency: "INR";
    period: "year" | "one-time";
    description: string;
}

export const monetizationPlans: Plan[] = [
  {
    id: "sub_annual_49",
    name: "Aaura Annual Subscription",
    amount: 49,
    currency: "INR",
    period: "year",
    description: "Access premium features for 1 year."
  },
  {
    id: "donate_cow_feed",
    name: "Feed a Cow (1 day)",
    amount: 9,
    currency: "INR",
    period: "one-time",
    description: "Donate ₹9 to feed one cow for a day. You can choose multiple cows."
  },
  {
    id: "donate_sadhu_meal",
    name: "Feed a Sadhu (1 meal)",
    amount: 36,
    currency: "INR",
    period: "one-time",
    description: "Donate ₹36 to provide one meal to a Sadhu. You can choose multiple Sadhus."
  }
];
