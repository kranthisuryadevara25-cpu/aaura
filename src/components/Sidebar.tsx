"use client";
import React from "react";
import { useLanguage } from "@/hooks/use-language";

const MENU = ["home","deities","stories","characters","temples","rituals","panchang","festivals","forum","channels","media","shop","upload","settings"];

export const Sidebar = () => {
  const { t } = useLanguage();

  return (
    <aside className="w-60 hidden md:block border-r p-4">
      <nav className="space-y-2">
        {MENU.map((m) => (
          <div key={m} className="py-2 px-3 rounded hover:bg-muted cursor-pointer">
            {t.sidebar[m as keyof typeof t.sidebar] || m.charAt(0).toUpperCase() + m.slice(1)}
          </div>
        ))}
      </nav>
    </aside>
  );
};
