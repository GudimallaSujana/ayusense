import herbsData from "./herbs.data.json";

export type Herb = {
  name: string;
  link?: string;
  preview?: string;
  pacify?: string[];
  aggravate?: string[];
  tridosha?: boolean;
  rasa?: string[];
  guna?: string[];
  virya?: string;
  vipaka?: string;
  prabhav?: string[];
};

const herbs = herbsData as Herb[];

export async function getHerbs(): Promise<Herb[]> {
  return herbs;
}

export function findHerbByName(list: Herb[], name: string): Herb | undefined {
  const n = name.toLowerCase().trim();
  return (
    list.find((h) => h.name.toLowerCase() === n) ||
    list.find((h) => h.name.toLowerCase().includes(n) || n.includes(h.name.toLowerCase()))
  );
}
