export type CatalogProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
  featured?: boolean;
};

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "wr-tee-001",
    title: "Wild Rose Script Tee",
    category: "Apparel",
    price: 24,
    image: "/assets/img/product-tee.svg",
    description: "Soft cotton tee with signature Wild Rose script design.",
    featured: true,
  },
  {
    id: "wr-hood-003",
    title: "School Spirit Hoodie",
    category: "School",
    price: 38,
    image: "/assets/img/product-hoodie.svg",
    description: "Cozy hoodie customizable for school mascots and names.",
    featured: true,
  },
  {
    id: "wr-mug-002",
    title: "Seasonal Mug",
    category: "Seasonal",
    price: 16,
    image: "/assets/img/product-mug.svg",
    description: "Ceramic mug with seasonal designs for gifting or home.",
    featured: true,
  },
  {
    id: "wr-tee-004",
    title: "Team Practice Tee",
    category: "Sports",
    price: 22,
    image: "/assets/img/product-tee.svg",
    description: "Lightweight team tee with optional number personalization.",
  },
  {
    id: "wr-hood-005",
    title: "Booster Club Hoodie",
    category: "School",
    price: 42,
    image: "/assets/img/product-hoodie.svg",
    description: "Fundraiser-ready hoodie for schools, clubs, and organizations.",
  },
  {
    id: "wr-mug-006",
    title: "Holiday Gift Mug",
    category: "Seasonal",
    price: 18,
    image: "/assets/img/product-mug.svg",
    description: "Personalized holiday mugs for families, teams, and staff gifts.",
  },
  {
    id: "wr-tee-007",
    title: "Business Logo Tee",
    category: "Custom",
    price: 27,
    image: "/assets/img/product-tee.svg",
    description: "Branded shirt option for local businesses and events.",
  },
  {
    id: "wr-hood-008",
    title: "Lifestyle Pullover",
    category: "Lifestyle",
    price: 40,
    image: "/assets/img/product-hoodie.svg",
    description: "Everyday pullover style with clean print placement options.",
  },
];

export const PRODUCT_CATEGORIES = Array.from(
  new Set(CATALOG_PRODUCTS.map((product) => product.category)),
).sort((a, b) => a.localeCompare(b));

