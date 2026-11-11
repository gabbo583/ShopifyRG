import DepthSlider from "./DepthSlider"
import products from "./products.json"

const covers = [
  {
    title: "IL FUTURO.",
    second: "HA DUE",
    accent: "COLORI.",
    description: "Le radici nella città eterna. Lo sguardo, oltre.",
    action: "ENTRA NELLA NUOVA ERA",
    category: "Tutti i prodotti",
    image: "/images/hero.jpg",
    alt: "T-shirt Teschio 1927 e cappello giallorosso indossati a Roma",
    caption: "COLLEZIONE 1927",
    product: products[0],
  },
  {
    title: "LA STRADA.",
    second: "IL NOSTRO",
    accent: "STADIO.",
    description: "Fuori dagli schemi. Dentro, sempre gli stessi colori.",
    action: "ESPLORA I CAPPELLI",
    category: "Cappelli",
    image: products[3].images[2],
    alt: "Cappello Old School Roma indossato",
    caption: "OLD SCHOOL / NEW ATTITUDE",
    product: products[3],
  },
  {
    title: "NUOVA ERA.",
    second: "ETERNA",
    accent: "FEDE.",
    description: "Non seguiamo le tendenze. Portiamo un’appartenenza.",
    action: "SCOPRI LE NOVITÀ",
    category: "Novità",
    image: products[1].images[2],
    alt: "T-shirt Teschio 1927 rossa indossata a Roma",
    caption: "I NUOVI ESSENTIAL",
    product: products[1],
  },
]

export default function HomeCover({
  onCollection,
  onProduct,
}: {
  onCollection: (category: string) => void
  onProduct: (product: typeof products[number]) => void
}) {
  return (
    <section className="home-cover" aria-label="Le collezioni in copertina">
      <div className="era-status">
        <span>
          <i /> ROMA GIALLOROSSA / NEXT ERA
        </span>
        <span>RADICI ETERNE. NUOVE VISIONI.</span>
      </div>
      <DepthSlider label="Copertine Roma Giallorossa" variant="hero">
        {covers.map((cover, index) => {
          const Heading = index === 0 ? "h1" : "h2"
          return (
            <article
              className={`cover-slide cover-slide-${index + 1}`}
              key={cover.title}
              aria-label={`${index + 1} di 3: ${cover.caption}`}
            >
              <div className="cover-art">
                <img
                  className="cover-photo"
                  src={cover.image}
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = cover.product.image
                  }}
                  alt={cover.alt}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
                <div className="orbit orbit-one" aria-hidden="true" />
                <div className="orbit orbit-two" aria-hidden="true" />
                <span className="art-coordinate">
                  41°53′24″N
                  <br />
                  12°29′32″E
                </span>
                <span className="art-year" aria-hidden="true">
                  1927
                </span>
                <span className="art-label">
                  <i /> FATTO DI APPARTENENZA.
                </span>
              </div>
              <div className="cover-copy">
                <span className="cover-tag">
                  <span /> {cover.caption} <b>— VOL. 01</b>
                </span>
                <Heading>
                  {cover.title}
                  <br />
                  {cover.second}
                  <br />
                  <span>{cover.accent}</span>
                </Heading>
                <p>
                  {cover.description}
                  <br />
                  Non è solo passione. È il tuo codice.
                </p>
                <button
                  className="button cover-cta"
                  onClick={() => onCollection(cover.category)}
                >
                  {cover.action}
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M5 19 19 5M5 5h14v14" />
                  </svg>
                </button>
                <button
                  className="cover-secondary"
                  onClick={() =>
                    document.getElementById("best-sellers")?.scrollIntoView({
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "instant"
                        : "smooth",
                    })
                  }
                >
                  ESPLORA L’UNIVERSO <span>↓</span>
                </button>
              </div>
              <button
                className="hero-product-chip"
                onClick={() => onProduct(cover.product)}
              >
                <img src={cover.product.image} alt="" />
                <span>
                  <small>IN PRIMO PIANO</small>
                  <b>{cover.product.name}</b>
                  <em>
                    {cover.product.price.toLocaleString("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </em>
                </span>
                <span className="chip-arrow">↗</span>
              </button>
              <span className="cover-edition">
                EST. 1927 <span /> DESIGNED FOR BELONGING
              </span>
            </article>
          )
        })}
      </DepthSlider>
    </section>
  )
}
