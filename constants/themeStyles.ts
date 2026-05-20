import { Colors } from "./theme";

const ACCENT = Colors.dark.accent;

export const FillStyles = {
    // Sekcje i duże panele — glassmorphism
    section: "bg-white/[0.03] border border-white/[0.08] rounded-[36px] w-full",
    subsection: "bg-white/[0.03] border border-white/[0.08] rounded-[20px]",
    miniSection: "bg-white/[0.03] border border-white/[0.08] rounded-[20px]",

    // Karty (np. ekran powitalny)
    cardBase: "rounded-[32px] border border-white/[0.08]",
    cardInactive: "bg-white/[0.03]",
    cardActive: `bg-white/[0.08] border-accent/30`,
    cardIcon: "w-[48px] h-[48px] rounded-full bg-white/[0.06] border border-white/[0.1] items-center justify-center",

    // Grupy i większe przyciski wyboru
    groupItemBase: "border rounded-2xl p-4",
    groupItemInactive: "border-white/[0.08] bg-white/[0.03]",
    groupItemActive: `bg-accent/10 border-accent/30`,

    // Bąbelki z tagami, kategoriami (pills)
    pillBase: "py-2 px-3.5 rounded-[14px] border border-white/[0.08]",
    pillInactive: "bg-white/[0.03]",
    pillActive: `bg-accent/10 border-accent/25`,
    pillFirst: "rounded-t-[24px]",
    pillLast: "rounded-b-[24px]",
    pillMiddle: "",

    // Inputy
    inputLarge: "bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 h-[52px] font-outfit",
    inputInline: "flex-1 bg-white/[0.04] border border-white/[0.08] rounded-[14px] px-3.5 h-[44px] font-outfit",
    inputIconBtn: `w-[44px] h-[44px] bg-accent rounded-[14px] justify-center items-center`,

    // Przyciski akcji
    actionBtnBase: "flex-row gap-x-2 items-center py-3.5 px-6 rounded-full",
    actionBtnPrimary: `bg-accent`,
    actionBtnSecondary: "bg-white/[0.06] border border-white/[0.08]",
};

