import { LINKS } from "./site";
export const STUDIO_APPS = [
  { name: "물타기 계산기", href: "https://twinklelabs.kr/app/stock-calculator/" },
  { name: "Pocket PDF", href: "https://twinklelabs.kr/app/pocket-pdf/" },
];
export const STUDIO_SOCIALS = [
  { name: "Instagram", url: "https://www.instagram.com/twinkle.ai.labs/" },
  { name: "X (Twitter)", url: "https://x.com/twinkle_ai_labs" },
  ...LINKS.filter((link) => link.name !== "gmail"),
];
