// Merch catalog shown on the /shop order form.
// IMPORTANT: prices here are for DISPLAY only. The amount actually charged comes from
// the catalog in supabase/functions/create-merch-checkout/index.ts — keep the two in sync.

import hoodieImage from "@/assets/merch/hoodie.jpg";
import poloImage from "@/assets/merch/polo.jpg";
import tshirtImage from "@/assets/merch/tshirt.jpg";

export type MerchId = "polo" | "tshirt" | "hoodie";

export interface MerchSize {
  size: string;
  price: number; // dollars, per item
}

export interface MerchItem {
  id: MerchId;
  name: string;
  description: string;
  image?: string;
  sizes: MerchSize[];
}

export const MERCH_ITEMS: MerchItem[] = [
  {
    id: "polo",
    name: "Polo",
    description: "Gildan adult jersey polo (navy)",
    image: poloImage,
    sizes: [
      { size: "S", price: 31 },
      { size: "M", price: 31 },
      { size: "L", price: 31 },
      { size: "XL", price: 31 },
      { size: "2XL", price: 33 },
      { size: "4XL", price: 33 },
    ],
  },
  {
    id: "tshirt",
    name: "T-Shirt",
    description: "Tultex unisex fine jersey t-shirt (navy)",
    image: tshirtImage,
    sizes: [
      { size: "S", price: 12 },
      { size: "M", price: 12 },
      { size: "L", price: 12 },
      { size: "XL", price: 12 },
      { size: "2XL", price: 14 },
      { size: "4XL", price: 15 },
    ],
  },
  {
    id: "hoodie",
    name: "Hoodie",
    description: "Gildan Heavy Blend hooded sweatshirt (navy)",
    image: hoodieImage,
    sizes: [
      { size: "S", price: 27 },
      { size: "M", price: 27 },
      { size: "L", price: 27 },
      { size: "XL", price: 27 },
      { size: "2XL", price: 30 },
      { size: "4XL", price: 30 },
    ],
  },
];

export const MAX_QUANTITY_PER_LINE = 50;

export const getUnitPrice = (itemId: string, size: string): number | undefined =>
  MERCH_ITEMS.find((i) => i.id === itemId)?.sizes.find((s) => s.size === size)?.price;

export const getPriceRange = (item: MerchItem) => {
  const prices = item.sizes.map((s) => s.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};
