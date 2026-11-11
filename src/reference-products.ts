const image = (name: string) => `/reference/${name}.webp`

export type ReferenceProduct = {
  id: number
  name: string
  cardName?: string
  category: string
  price: number
  original?: number
  image: string
  cartImage?: string
  gallery: string[]
  sizes: string[]
}

const sizes = ["S", "M", "L", "XL", "XXL", "3XL"]

// Visual-concept data transcribed from the supplied reference, not live inventory.
export const referenceProducts: ReferenceProduct[] = [
  {
    id: 1,
    name: "FELPA - OVUNQUE TU SARAI NERA",
    category: "Felpe",
    price: 54.99,
    original: 64.99,
    image: image("hoodie-black"),
    gallery: [image("hoodie-black")],
    sizes,
  },
  {
    id: 2,
    name: "FELPA - ULTRAS 1927 ROSSA",
    cardName: "FELPA - OVUNQUE TU SARAI ROSSA",
    category: "Felpe",
    price: 54.99,
    original: 64.99,
    image: image("hoodie-red"),
    cartImage: image("cart-hoodie"),
    gallery: [
      image("product-red"),
      image("product-back"),
      image("product-hood"),
      image("product-detail"),
    ],
    sizes,
  },
  {
    id: 3,
    name: "FELPA - TESCHIO 1927 BIANCA",
    category: "Felpe",
    price: 54.99,
    original: 70,
    image: image("hoodie-white"),
    gallery: [image("hoodie-white")],
    sizes,
  },
  {
    id: 4,
    name: "FELPA - ULTRAS 1927 NERA",
    category: "Felpe",
    price: 54.99,
    original: 64.99,
    image: image("hoodie-ultras"),
    gallery: [image("hoodie-ultras")],
    sizes,
  },
  {
    id: 6,
    name: "K-WAY - ULTRAS 1927 NERO",
    category: "K-Way",
    price: 64.99,
    image: image("cart-jacket"),
    gallery: [image("cart-jacket"), image("category-jacket")],
    sizes,
  },
  {
    id: 7,
    name: "CAPPELLO ROMA 1927",
    category: "Accessori",
    price: 24.99,
    image: image("cap"),
    gallery: [image("cap")],
    sizes: ["Unica"],
  },
  {
    id: 8,
    name: "T-SHIRT ASR VINTAGE",
    category: "T-Shirt",
    price: 34.99,
    image: image("shirt"),
    gallery: [image("shirt"), image("category-shirt")],
    sizes,
  },
  {
    id: 9,
    name: "SCIARPA ROMA SEMPRE",
    category: "Accessori",
    price: 19.99,
    image: image("scarf"),
    gallery: [image("scarf")],
    sizes: ["Unica"],
  },
]

export const referenceMoney = (value: number) =>
  `€${value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
