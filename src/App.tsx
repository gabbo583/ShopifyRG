import { useEffect, useRef, useState } from "react"
import products from "./products.json"
import useStoreMotion from "./useStoreMotion"
import DepthSlider from "./DepthSlider"
import HomeCover from "./HomeCover"

type Product = typeof products[number]
type CartItem = {
  product: Product
  size: string
  qty: number
}
type IconProps = {
  name: string
  size?: number
}
type ProductCardProps = {
  p: Product
  index?: number
}
function Icon({ name, size = 20 }: IconProps) {
  const paths: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      </>
    ),
    collection: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21v-3a7 7 0 0 1 14 0v3" />
      </>
    ),
    arrow: (
      <>
        <path d="M3 12h17m-6-6 6 6-6 6" />
      </>
    ),
    heart: (
      <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 4 0 8 8 15 8-7 12-11 8-15Z" />
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    truck: (
      <>
        <path d="M2 5h13v12H2zM15 9h4l3 4v4h-7" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    return: (
      <>
        <path d="M4 9h10a6 6 0 0 1 0 12h-3M8 4 3 9l5 5" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    filter: (
      <>
        <path d="M3 6h18M3 12h18M3 18h18" />
        <circle cx="8" cy="6" r="2" />
        <circle cx="16" cy="12" r="2" />
        <circle cx="9" cy="18" r="2" />
      </>
    ),
    check: <path d="m5 12 4 4L20 5" />,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  )
}
const money = (v: number) =>
  v.toLocaleString("it-IT", { style: "currency", currency: "EUR" })
function Logo({
  light = false,
  onClick,
}: {
  light?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`logo ${light ? "light" : ""}`}
      onClick={onClick}
      aria-label="Roma Giallorossa, homepage"
    >
      <span className="logo-emblem">
        <svg viewBox="0 0 40 44" fill="none" aria-hidden="true">
          <path
            d="m20 2 17 9-3 22-14 9L6 33 3 11 20 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="m11 29 7-15h8l3 6-5 5 5 5h-7l-6-8m3-2h6"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </span>
      <span className="logo-roma">
        ROMA<span>GIALLOROSSA</span>
      </span>
      <span className="logo-divider" />
      <span className="logo-caption">
        EST. 1927
        <br />
        ROMA, ITALIA
      </span>
    </button>
  )
}

export default function App() {
  const [page, setPage] = useState("home")
  const [category, setCategory] = useState("Tutti i prodotti")
  const [selected, setSelected] = useState<Product>(products[0])
  const [size, setSize] = useState("M")
  const [qty, setQty] = useState(1)
  const [gallery, setGallery] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [panel, setPanel] = useState("")
  const [search, setSearch] = useState("")
  const [wish, setWish] = useState<number[]>([])
  const [sort, setSort] = useState("featured")
  const [filter, setFilter] = useState(false)
  const [priceFilter, setPriceFilter] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [checkoutDone, setCheckoutDone] = useState(false)
  const [zoom, setZoom] = useState(false)
  const dialog = useRef<HTMLElement>(null)
  useStoreMotion(page)
  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  const count = cart.reduce((sum, i) => sum + i.qty, 0)
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel("")
        setZoom(false)
      }
    }
    window.addEventListener("keydown", close)
    document.body.style.overflow = panel || zoom ? "hidden" : ""
    return () => {
      window.removeEventListener("keydown", close)
      document.body.style.overflow = ""
    }
  }, [panel, zoom])
  useEffect(() => {
    if (!panel) return
    const previous = document.activeElement as HTMLElement | null
    const element = dialog.current
    const focusable = () =>
      Array.from(
        element?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, a[href], [tabindex="0"]',
        ) || [],
      ).filter((item) => item.offsetParent !== null)
    const initial =
      element?.querySelector<HTMLElement>(".search-input input") ||
      focusable()[0]
    initial?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    element?.addEventListener("keydown", trap)
    return () => {
      element?.removeEventListener("keydown", trap)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [panel])
  function navigate(next: string, cat = "Tutti i prodotti") {
    setPage(next)
    setCategory(cat)
    setPanel("")
    window.scrollTo({ top: 0, behavior: "instant" })
  }
  function openProduct(p: Product) {
    setSelected(p)
    setGallery(0)
    setSize(
      p.sizes.length === 1
        ? "Unica"
        : p.sizes.includes("M")
          ? "M"
          : p.sizes[0] || "Unica",
    )
    setQty(1)
    navigate("product")
  }
  function add(p: Product, s = size, quantity = 1) {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === p.id && i.size === s)
      return exists
        ? prev.map((i) => (i === exists ? { ...i, qty: i.qty + quantity } : i))
        : [...prev, { product: p, size: s, qty: quantity }]
    })
    setPanel("cart")
  }
  function changeQty(index: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i, n) => (n === index ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    )
  }
  function ProductCard({ p, index = 0 }: ProductCardProps) {
    return (
      <article className="product-card">
        <div className="product-image">
          <button className="image-link" onClick={() => openProduct(p)}>
            <img src={p.image} alt={p.name} loading="lazy" />
          </button>
          <span className={`badge ${index === 0 ? "burgundy" : ""}`}>
            {index === 0
              ? "BEST SELLER"
              : index === 1
                ? "NUOVO"
                : index === 2
                  ? "ESSENTIAL"
                  : "ROMA STYLE"}
          </span>
          <button
            className={`wish ${wish.includes(p.id) ? "wished" : ""}`}
            aria-label={`Salva ${p.name}`}
            onClick={() =>
              setWish(
                wish.includes(p.id)
                  ? wish.filter((id) => id !== p.id)
                  : [...wish, p.id],
              )
            }
          >
            <Icon name="heart" size={18} />
          </button>
          <button className="quick-add" onClick={() => openProduct(p)}>
            Scegli la tua taglia <span>+</span>
          </button>
        </div>
        <div className="product-meta">
          <span>{p.category} · Collezione 1927</span>
          <span className="swatches">
            <i />
            <i />
            <i />
          </span>
        </div>
        <button className="product-name" onClick={() => openProduct(p)}>
          {p.name}
        </button>
        <div className="price">
          {money(p.price)}
          {p.id === 31 && <del>€ 30,00</del>}
        </div>
      </article>
    )
  }
  const filtered = products
    .filter(
      (p) =>
        (category === "Tutti i prodotti" ||
          category === "Novità" ||
          category === "Best seller" ||
          (category === "Wishlist" && wish.includes(p.id)) ||
          p.category === category) &&
        (!priceFilter || p.price < 30),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    )
  const bottomTab =
    panel === "search"
      ? 2
      : panel === "cart"
        ? 4
        : page === "collection" && category === "Wishlist"
          ? 3
          : page === "collection" || page === "product"
            ? 1
            : 0
  return (
    <>
      <div className="announcement">
        <span>UNA CITTÀ. UN CODICE. UN’APPARTENENZA.</span>
        <span>
          NUOVA COLLEZIONE 1927 — LA PASSIONE EVOLVE.{" "}
          <Icon name="arrow" size={14} />
        </span>
        <span>ITALIA · EUR €</span>
      </div>
      <header className="header">
        <button
          className="icon-button mobile-menu"
          aria-label="Apri menu"
          onClick={() => setPanel("menu")}
        >
          <Icon name="menu" />
        </button>
        <Logo onClick={() => navigate("home")} />
        <nav aria-label="Navigazione principale">
          {[
            "Novità",
            "Tutti i prodotti",
            "T-shirt",
            "Felpe",
            "Giacche",
            "Cappelli",
            "Bandiere",
          ].map((c) => (
            <button
              className={
                page === "collection" && category === c ? "active" : ""
              }
              key={c}
              onClick={() => navigate("collection", c)}
            >
              {c === "Tutti i prodotti" ? "Collezione 1927" : c}
            </button>
          ))}
          <button
            className="nav-story"
            onClick={() => {
              navigate("home")
              setTimeout(
                () =>
                  document
                    .getElementById("story")
                    ?.scrollIntoView({ behavior: "smooth" }),
                50,
              )
            }}
          >
            Il nostro mondo
          </button>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Cerca"
            onClick={() => setPanel("search")}
          >
            <Icon name="search" />
          </button>
          <button
            className="icon-button desktop-only"
            aria-label="Account"
            onClick={() => setPanel("account")}
          >
            <Icon name="user" />
          </button>
          <button
            className="icon-button bag-button"
            aria-label={`Carrello, ${count} prodotti`}
            onClick={() => setPanel("cart")}
          >
            <Icon name="bag" />
            <span>{count}</span>
          </button>
        </div>
      </header>
      <main>
        {page === "home" && (
          <>
            <HomeCover
              onCollection={(cat) => navigate("collection", cat)}
              onProduct={openProduct}
            />
            <div className="identity-strip" aria-hidden="true">
              <span>ETERNA PASSIONE</span>
              <i />
              <span>NUOVA DIMENSIONE</span>
              <i />
              <span>ROMA NEL DNA</span>
              <i />
              <span>ETERNA PASSIONE</span>
              <i />
              <span>NUOVA DIMENSIONE</span>
              <i />
            </div>
            <nav className="universe-nav" aria-label="Esplora le categorie">
              <span>IL TUO UNIVERSO</span>
              {[
                "Tutti i prodotti",
                "T-shirt",
                "Felpe",
                "Giacche",
                "Cappelli",
                "Bandiere",
              ].map((cat, i) => (
                <button onClick={() => navigate("collection", cat)} key={cat}>
                  <sup>0{i + 1}</sup>
                  {cat === "Tutti i prodotti" ? "Tutto" : cat}
                  <Icon name="arrow" size={14} />
                </button>
              ))}
            </nav>
            <div className="benefits">
              <div>
                <Icon name="truck" />
                <span>Spedizioni in tutta Italia</span>
              </div>
              <div>
                <Icon name="shield" />
                <span>Pagamenti sicuri</span>
              </div>
              <div>
                <Icon name="return" />
                <span>Acquista con tranquillità</span>
              </div>
              <div>
                <span className="mini-r">R</span>
                <span>Passione autentica, stile unico</span>
              </div>
            </div>
            <section className="section best-section" id="best-sellers">
              <div className="section-heading">
                <div>
                  <span className="eyebrow red">01 / THE ICONS</span>
                  <h2>
                    NON PASSANO.
                    <br />
                    <span>RESTANO.</span>
                  </h2>
                  <p className="section-description">
                    I più amati. Non per caso.
                  </p>
                </div>
                <button
                  className="text-link"
                  onClick={() => navigate("collection", "Best seller")}
                >
                  Esplora i best seller <Icon name="arrow" size={18} />
                </button>
              </div>
              <DepthSlider label="I preferiti dei romanisti" autoplay>
                {products.map((p, i) => (
                  <ProductCard key={p.id} p={p} index={i} />
                ))}
              </DepthSlider>
            </section>
            <section className="section categories">
              <div className="section-heading">
                <div>
                  <span className="eyebrow red">02 / SCEGLI IL TUO MONDO</span>
                  <h2>
                    STESSO DNA.
                    <br />
                    <span>NUOVE FORME.</span>
                  </h2>
                </div>
              </div>
              <DepthSlider label="Le nostre categorie" variant="categories">
                {[
                  {
                    title: "T-shirt",
                    img: products[0].images[3],
                    sub: "La tua seconda pelle",
                  },
                  {
                    title: "Felpe",
                    img: products[2].image,
                    sub: "Appartenenza, in ogni stagione",
                  },
                  {
                    title: "Cappelli",
                    img: products[3].images[2],
                    sub: "Il dettaglio che ti distingue",
                  },
                  {
                    title: "Giacche",
                    img: products[5].image,
                    sub: "La passione non teme il freddo",
                  },
                  {
                    title: "Bandiere",
                    img: products[4].image,
                    sub: "I tuoi colori. Sempre più in alto.",
                  },
                ].map((c) => (
                  <button
                    className="category-card"
                    key={c.title}
                    onClick={() => navigate("collection", c.title)}
                  >
                    <img
                      src={c.img}
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src =
                          products.find((p) => p.category === c.title)?.image ||
                          products[0].image
                      }}
                      alt={c.title}
                      loading="lazy"
                    />
                    <div>
                      <span>{c.sub}</span>
                      <h3>{c.title}</h3>
                    </div>
                    <Icon name="arrow" size={26} />
                  </button>
                ))}
              </DepthSlider>
            </section>
            <section className="new-banner">
              <span>IL PASSATO È NEL DNA. IL FUTURO È ADDOSSO.</span>
              <h2>
                NEXT ERA.
                <br />
                SAME SOUL.
              </h2>
              <p>
                Nuovi dettagli, la stessa identità.
                <br />
                Il prossimo pezzo della tua storia è qui.
              </p>
              <button
                className="button cream"
                onClick={() => navigate("collection", "Novità")}
              >
                ESPLORA LE NOVITÀ <Icon name="arrow" />
              </button>
              <span className="banner-year">1927</span>
            </section>
            <section className="section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow red">03 / NEW IN THE CITY</span>
                  <h2>
                    IL PROSSIMO
                    <br />
                    <span>CAPITOLO.</span>
                  </h2>
                </div>
                <button
                  className="text-link"
                  onClick={() => navigate("collection", "Novità")}
                >
                  Scopri le novità <Icon name="arrow" />
                </button>
              </div>
              <DepthSlider label="Novità giallorosse" autoplay>
                {[
                  products[5],
                  products[6],
                  products[4],
                  products[1],
                  products[2],
                  products[3],
                  products[0],
                ].map((p, i) => (
                  <ProductCard key={p.id} p={p} index={i + 1} />
                ))}
              </DepthSlider>
            </section>
            <section className="story" id="story">
              <div className="story-image">
                <img
                  src="https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=1000&q=80"
                  alt="Il Colosseo nella luce calda di Roma, fotografia di Dario Veronesi"
                  loading="lazy"
                />
                <span>ROMA. LA NOSTRA ORIGINE.</span>
              </div>
              <div className="story-copy">
                <span className="eyebrow red">04 / IL NOSTRO MANIFESTO</span>
                <h2>
                  ETERNI.
                  <br />
                  MAI UGUALI.
                </h2>
                <p>
                  Roma non è una squadra che scegli. È una storia che ti porti
                  dentro. Nei giorni di festa, nelle trasferte, nella vita di
                  tutti i giorni.
                </p>
                <p>
                  Roma Giallorossa nasce per dare forma a questo legame. Capi e
                  accessori per chi quei due colori non li lascia mai.
                </p>
                <button className="text-link" onClick={() => setPanel("story")}>
                  La nostra storia <Icon name="arrow" />
                </button>
              </div>
            </section>
            <section className="community section">
              <span className="eyebrow red">UNA PASSIONE CHE CI UNISCE</span>
              <h2>Da romanisti. Per romanisti.</h2>
              <p>Più di uno store. Un modo di sentirsi a casa.</p>
              <div className="community-grid">
                <div>
                  <span>01</span>
                  <h3>Identità, non tendenze.</h3>
                  <p>
                    Design che raccontano Roma, pensati per accompagnarti ogni
                    giorno.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <h3>I dettagli fanno la differenza.</h3>
                  <p>
                    Scopri materiali, vestibilità e dettagli nelle schede dei
                    nostri prodotti.
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <h3>Sempre dalla tua parte.</h3>
                  <p>
                    Hai un dubbio? Ti aiutiamo a scegliere il prodotto giusto
                    per te.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
        {page === "collection" && (
          <section className="section collection">
            <div className="breadcrumb">
              <button onClick={() => navigate("home")}>Home</button> /{" "}
              {category}
            </div>
            <div className="collection-intro">
              <span className="eyebrow red">IL TUO MONDO GIALLOROSSO</span>
              <h1>{category}.</h1>
              <p>
                Non è solo quello che indossi. È quello che sei.
                <br />
                Scopri i tuoi prossimi essential giallorossi.
              </p>
            </div>
            <div className="category-tabs">
              {[
                "Tutti i prodotti",
                "T-shirt",
                "Felpe",
                "Giacche",
                "Cappelli",
                "Bandiere",
              ].map((c) => (
                <button
                  className={category === c ? "selected" : ""}
                  onClick={() => setCategory(c)}
                  key={c}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="filter-bar">
              <button className="text-link" onClick={() => setFilter(!filter)}>
                <Icon name="filter" /> Filtri {priceFilter ? "(1)" : ""}
              </button>
              <span>{filtered.length} prodotti</span>
              <select
                aria-label="Ordina prodotti"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Ordina: In evidenza</option>
                <option value="low">Prezzo: crescente</option>
                <option value="high">Prezzo: decrescente</option>
              </select>
            </div>
            {filter && (
              <div className="filters">
                <label>
                  <input
                    type="checkbox"
                    checked={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.checked)}
                  />{" "}
                  Prezzo inferiore a € 30
                </label>
                <button
                  onClick={() => {
                    setPriceFilter(false)
                    setFilter(false)
                  }}
                >
                  Azzera filtri
                </button>
              </div>
            )}
            <div className="product-grid">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
            {!filtered.length && (
              <p className="empty">
                Nessun prodotto. Prova a modificare i filtri o salva i tuoi
                preferiti.
              </p>
            )}
          </section>
        )}
        {page === "product" && (
          <section className="section product-page">
            <div className="breadcrumb">
              <button onClick={() => navigate("home")}>Home</button> /{" "}
              <button onClick={() => navigate("collection", selected.category)}>
                {selected.category}
              </button>{" "}
              / {selected.name}
            </div>
            <div className="product-layout">
              <div className="gallery">
                <button
                  className="main-product-image"
                  onClick={() => setZoom(true)}
                  aria-label="Ingrandisci immagine"
                >
                  <img
                    src={selected.images[gallery] || selected.image}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = selected.image
                    }}
                    alt={selected.name}
                  />
                  <span>
                    <Icon name="search" /> Ingrandisci
                  </span>
                </button>
                <div className="thumbnails">
                  {selected.images.map((img, i) => (
                    <button
                      className={gallery === i ? "selected" : ""}
                      key={img}
                      onClick={() => setGallery(i)}
                    >
                      <img
                        src={img}
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = selected.image
                        }}
                        alt={`Vista ${i + 1} di ${selected.name}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="product-details">
                <span className="eyebrow red">
                  COLLEZIONE 1927 · {selected.category}
                </span>
                <h1>{selected.name}</h1>
                <div className="product-price">
                  {money(selected.price)}
                  {selected.id === 31 && <del>€ 30,00</del>}
                </div>
                <p className="product-description">
                  Due colori, una sola appartenenza. Un capo dal carattere
                  autentico, per portare la tua passione oltre i novanta minuti.
                </p>
                <div className="size-heading">
                  <b>Taglia: {size}</b>
                  <button onClick={() => setPanel("sizes")}>
                    Guida alle taglie
                  </button>
                </div>
                <div className="sizes">
                  {(selected.sizes.length > 1 ? selected.sizes : ["Unica"]).map(
                    (s) => (
                      <button
                        className={size === s ? "selected" : ""}
                        onClick={() => setSize(s)}
                        key={s}
                      >
                        {s}
                      </button>
                    ),
                  )}
                </div>
                <div className="add-row">
                  <div className="quantity">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      aria-label="Riduci quantità"
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      aria-label="Aumenta quantità"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="button primary"
                    onClick={() => add(selected, size, qty)}
                  >
                    AGGIUNGI AL CARRELLO <Icon name="bag" />
                  </button>
                </div>
                <button
                  className="button fast-buy"
                  onClick={() => {
                    add(selected, size, qty)
                    navigate("checkout")
                  }}
                >
                  ACQUISTA ORA <Icon name="arrow" />
                </button>
                <div className="product-trust">
                  <span>
                    <Icon name="shield" size={17} /> Pagamento sicuro
                  </span>
                  <span>
                    <Icon name="truck" size={17} /> Spedizione tracciata
                  </span>
                </div>
                {[
                  {
                    title: "Descrizione e dettagli",
                    content:
                      "Un design dedicato al mondo romanista. Scopri le diverse viste nella galleria per osservare stampa, colori e finiture. Per composizione e istruzioni di cura, consulta l’etichetta del capo.",
                  },
                  {
                    title: "Spedizioni e resi",
                    content:
                      "La spedizione e i relativi costi sono calcolati al checkout. Per disponibilità, tempi di consegna e condizioni di reso contatta lo store prima dell’acquisto.",
                  },
                  {
                    title: "Hai bisogno di aiuto?",
                    content:
                      "Scrivici a info@romagiallorossa.shop. Ti aiuteremo a scegliere il tuo prossimo capo giallorosso.",
                  },
                ].map((d) => (
                  <details key={d.title}>
                    <summary>
                      {d.title}
                      <span>+</span>
                    </summary>
                    <p>{d.content}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="section-heading related">
              <div>
                <span className="eyebrow red">COMPLETA IL TUO STILE</span>
                <h2>Potrebbe piacerti anche.</h2>
              </div>
            </div>
            <DepthSlider label="Potrebbe piacerti anche">
              {products
                .filter((p) => p.id !== selected.id)
                .slice(0, 4)
                .map((p, i) => (
                  <ProductCard p={p} index={i} key={p.id} />
                ))}
            </DepthSlider>
            <div className="mobile-sticky">
              <span>
                {money(selected.price)} · {size}
              </span>
              <button
                className="button primary"
                onClick={() => add(selected, size, qty)}
              >
                AGGIUNGI <Icon name="bag" />
              </button>
            </div>
          </section>
        )}
        {page === "checkout" && (
          <section className="section checkout">
            <div className="breadcrumb">
              <button onClick={() => navigate("home")}>Home</button> / Checkout
            </div>
            <div className="checkout-title">
              <span className="eyebrow red">UN ULTIMO PASSO. POI È TUA.</span>
              <h1>La tua passione, a casa.</h1>
              <p>
                Anteprima del checkout · Nessun pagamento reale viene elaborato.
              </p>
            </div>
            {checkoutDone ? (
              <div className="order-success">
                <Icon name="check" size={40} />
                <h2>Tutto pronto!</h2>
                <p>
                  Hai completato il percorso dimostrativo. Il checkout reale
                  sarà gestito in sicurezza da Shopify.
                </p>
                <button
                  className="button primary"
                  onClick={() => navigate("home")}
                >
                  TORNA ALLO STORE
                </button>
              </div>
            ) : (
              <div className="checkout-grid">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setCheckoutDone(true)
                  }}
                >
                  <h2>Contatti</h2>
                  <label>
                    Email
                    <input type="email" placeholder="La tua email" required />
                  </label>
                  <h2>Indirizzo di spedizione</h2>
                  <div className="form-row">
                    <label>
                      Nome
                      <input autoComplete="given-name" required />
                    </label>
                    <label>
                      Cognome
                      <input autoComplete="family-name" required />
                    </label>
                  </div>
                  <label>
                    Indirizzo
                    <input
                      autoComplete="street-address"
                      placeholder="Via e numero civico"
                      required
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      CAP
                      <input
                        autoComplete="postal-code"
                        pattern="[0-9]{5}"
                        required
                      />
                    </label>
                    <label>
                      Città
                      <input autoComplete="address-level2" required />
                    </label>
                  </div>
                  <label>
                    Paese
                    <select>
                      <option>Italia</option>
                    </select>
                  </label>
                  <h2>Pagamento</h2>
                  <div className="payment-note">
                    <Icon name="shield" />
                    <p>
                      Nel negozio Shopify potrai scegliere carta, PayPal o altri
                      metodi abilitati dal venditore.
                    </p>
                  </div>
                  <button className="button primary" disabled={!cart.length}>
                    COMPLETA L’ANTEPRIMA <Icon name="arrow" />
                  </button>
                </form>
                <aside className="order-summary">
                  <h2>Il tuo ordine</h2>
                  {cart.map((i, n) => (
                    <div className="cart-item" key={n}>
                      <img src={i.product.image} alt={i.product.name} />
                      <div>
                        <b>{i.product.name}</b>
                        <p>
                          Taglia {i.size} · Quantità {i.qty}
                        </p>
                      </div>
                      <span>{money(i.product.price * i.qty)}</span>
                    </div>
                  ))}
                  {!cart.length && (
                    <p>
                      Il carrello è vuoto.{" "}
                      <button
                        className="text-link"
                        onClick={() => navigate("collection")}
                      >
                        Scopri la collezione
                      </button>
                    </p>
                  )}
                  <div className="total-line">
                    <span>Subtotale</span>
                    <b>{money(total)}</b>
                  </div>
                  <div className="total-line">
                    <span>Spedizione</span>
                    <span>Al checkout Shopify</span>
                  </div>
                  <div className="total-line grand-total">
                    <b>Totale prodotti</b>
                    <b>{money(total)}</b>
                  </div>
                  <small>
                    IVA inclusa dove applicabile. Checkout dimostrativo.
                  </small>
                </aside>
              </div>
            )}
          </section>
        )}
      </main>
      <section className="newsletter">
        <div>
          <span className="eyebrow">RESTA DENTRO AL NOSTRO MONDO</span>
          <h2>La Roma non si perde di vista.</h2>
          <p>Nuove collezioni, storie e novità. Solo quello che conta.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setNewsletter(true)
          }}
        >
          <label className="email-field">
            <input
              type="email"
              aria-label="La tua email per la newsletter"
              placeholder="Il tuo indirizzo email"
              required
              disabled={newsletter}
            />
            <button
              type="submit"
              aria-label="Iscriviti alla newsletter"
              disabled={newsletter}
            >
              <Icon name={newsletter ? "check" : "arrow"} />
            </button>
          </label>
          <small>
            {newsletter
              ? "Grazie! Iscrizione registrata in questa anteprima."
              : "Iscrivendoti accetti la privacy policy. Niente spam, promesso."}
          </small>
        </form>
      </section>
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <Logo light onClick={() => navigate("home")} />
            <p>
              Una città. Due colori. Un’appartenenza.
              <br />
              Portala sempre con te.
            </p>
            <span className="footer-social">INSTAGRAM ↗ &nbsp; FACEBOOK ↗</span>
          </div>
          <div>
            <h3>ESPLORA</h3>
            {["T-shirt", "Felpe", "Cappelli", "Bandiere"].map((c) => (
              <button key={c} onClick={() => navigate("collection", c)}>
                {c}
              </button>
            ))}
          </div>
          <div>
            <h3>SIAMO QUI PER TE</h3>
            {[
              "Spedizioni e resi",
              "Guida alle taglie",
              "Contatti",
              "Domande frequenti",
            ].map((c) => (
              <button
                key={c}
                onClick={() =>
                  setPanel(c === "Guida alle taglie" ? "sizes" : "help")
                }
              >
                {c}
              </button>
            ))}
          </div>
          <div>
            <h3>IL NOSTRO MONDO</h3>
            <button onClick={() => setPanel("story")}>La nostra storia</button>
            <button onClick={() => setPanel("help")}>Privacy policy</button>
            <button onClick={() => setPanel("help")}>
              Termini e condizioni
            </button>
            <span className="payment-logos">
              VISA &nbsp; Mastercard &nbsp; PayPal
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Roma Giallorossa · Concept indipendente
          </span>
          <span>FATTO DI PASSIONE. NATO A ROMA.</span>
          <span>Italia · EUR €</span>
        </div>
      </footer>
      {page !== "checkout" && (
        <nav
          className={`app-bottom-bar ${panel || zoom ? "is-obscured" : ""}`}
          aria-label="Navigazione app"
          inert={Boolean(panel || zoom)}
        >
          <span
            className="app-tab-indicator"
            style={{ transform: `translateX(${bottomTab * 100}%)` }}
            aria-hidden="true"
          />
          {[
            { label: "Home", icon: "home", action: () => navigate("home") },
            {
              label: "Esplora",
              icon: "collection",
              action: () => navigate("collection"),
            },
            {
              label: "Cerca",
              icon: "search",
              action: () => setPanel("search"),
            },
            {
              label: "Preferiti",
              icon: "heart",
              action: () => navigate("collection", "Wishlist"),
            },
            { label: "Carrello", icon: "bag", action: () => setPanel("cart") },
          ].map((tab, index) => (
            <button
              key={tab.icon}
              className={`app-tab ${bottomTab === index ? "is-active" : ""}`}
              aria-current={bottomTab === index && !panel ? "page" : undefined}
              aria-label={
                tab.icon === "bag" ? `Carrello, ${count} prodotti` : tab.label
              }
              aria-haspopup={index === 2 || index === 4 ? "dialog" : undefined}
              onClick={tab.action}
            >
              <span className="app-tab-icon">
                <Icon name={tab.icon} size={21} />
                {tab.icon === "bag" && count > 0 && (
                  <span className="app-tab-badge" aria-hidden="true">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
                {tab.icon === "heart" && wish.length > 0 && (
                  <span className="app-tab-saved" aria-hidden="true" />
                )}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
      {panel && (
        <div className="overlay" onClick={() => setPanel("")}>
          <aside
            ref={dialog}
            className={`drawer ${panel === "search" ? "search-drawer" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={panel === "cart" ? "Il tuo carrello" : "Pannello"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-heading">
              <h2>
                {panel === "cart"
                  ? `Il tuo carrello (${count})`
                  : panel === "search"
                    ? "Cosa stai cercando?"
                    : panel === "menu"
                      ? "Il tuo mondo giallorosso"
                      : panel === "sizes"
                        ? "Guida alle taglie"
                        : panel === "account"
                          ? "Benvenuto, romanista."
                          : panel === "story"
                            ? "Una città. Una passione."
                            : "Siamo qui per te."}
              </h2>
              <button
                className="icon-button"
                aria-label="Chiudi"
                onClick={() => setPanel("")}
              >
                <Icon name="close" />
              </button>
            </div>
            {panel === "cart" && (
              <>
                <p className="drawer-intro">
                  La tua appartenenza, a un passo da te.
                </p>
                <div className="cart-items">
                  {cart.map((i, n) => (
                    <div
                      className="cart-item"
                      key={`${i.product.id}-${i.size}`}
                    >
                      <img src={i.product.image} alt={i.product.name} />
                      <div>
                        <button
                          className="product-name"
                          onClick={() => openProduct(i.product)}
                        >
                          {i.product.name}
                        </button>
                        <p>Taglia: {i.size}</p>
                        <b>{money(i.product.price)}</b>
                        <div className="quantity">
                          <button
                            aria-label="Riduci quantità"
                            onClick={() => changeQty(n, -1)}
                          >
                            −
                          </button>
                          <span>{i.qty}</span>
                          <button
                            aria-label="Aumenta quantità"
                            onClick={() => changeQty(n, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="icon-button"
                        aria-label="Rimuovi prodotto"
                        onClick={() =>
                          setCart(cart.filter((_, index) => index !== n))
                        }
                      >
                        <Icon name="close" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                {!cart.length ? (
                  <div className="empty">
                    <Icon name="bag" size={40} />
                    <h3>La tua prossima passione è qui.</h3>
                    <p>Il carrello è ancora vuoto.</p>
                    <button
                      className="button primary"
                      onClick={() => navigate("collection")}
                    >
                      SCOPRI LA COLLEZIONE
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cross-sell">
                      <span className="eyebrow red">IL DETTAGLIO IN PIÙ</span>
                      <div className="cart-item">
                        <img src={products[3].image} alt={products[3].name} />
                        <div>
                          <b>Cappello Old School Roma</b>
                          <p>{money(products[3].price)}</p>
                        </div>
                        <button
                          className="icon-button"
                          aria-label="Aggiungi cappello"
                          onClick={() => add(products[3], "Unica")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-bottom">
                      <div className="total-line">
                        <b>Subtotale</b>
                        <b>{money(total)}</b>
                      </div>
                      <p>Spedizione calcolata al checkout.</p>
                      <button
                        className="button primary"
                        onClick={() => {
                          setCheckoutDone(false)
                          navigate("checkout")
                        }}
                      >
                        VAI AL CHECKOUT <Icon name="arrow" />
                      </button>
                      <span>
                        <Icon name="shield" size={15} /> Acquisti sicuri ·
                        Anteprima dimostrativa
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
            {panel === "search" && (
              <>
                <div className="search-input">
                  <Icon name="search" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca t-shirt, felpe, cappelli..."
                    aria-label="Cerca prodotti"
                  />
                </div>
                <div className="search-categories">
                  {["T-shirt", "Felpe", "Cappelli"].map((c) => (
                    <button key={c} onClick={() => navigate("collection", c)}>
                      {c} <Icon name="arrow" size={14} />
                    </button>
                  ))}
                </div>
                <span className="eyebrow red">
                  {search ? "RISULTATI" : "I PIÙ CERCATI"}
                </span>
                {products
                  .filter(
                    (p) =>
                      !search ||
                      p.name.toLowerCase().includes(search.toLowerCase()) ||
                      p.category.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <button
                      className="search-result"
                      key={p.id}
                      onClick={() => openProduct(p)}
                    >
                      <img src={p.image} alt={p.name} />
                      <span>
                        <b>{p.name}</b>
                        <small>{p.category}</small>
                      </span>
                      <b>{money(p.price)}</b>
                      <Icon name="arrow" size={18} />
                    </button>
                  ))}
                {search &&
                  !products.some((p) =>
                    `${p.name} ${p.category}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  ) && <p>Nessun risultato. Prova “T-shirt” o “Roma”.</p>}
              </>
            )}
            {panel === "menu" && (
              <div className="mobile-nav">
                {[
                  "Tutti i prodotti",
                  "Novità",
                  "T-shirt",
                  "Felpe",
                  "Giacche",
                  "Cappelli",
                  "Bandiere",
                  "Wishlist",
                ].map((c) => (
                  <button key={c} onClick={() => navigate("collection", c)}>
                    {c}
                    <Icon name="arrow" />
                  </button>
                ))}
              </div>
            )}
            {panel === "sizes" && (
              <div className="info-panel">
                <p>
                  Misure indicative del corpo in centimetri. La vestibilità
                  varia per modello: contattaci per confermare le misure del
                  capo.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Taglia</th>
                      <th>Torace</th>
                      <th>Vita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["S", "88–94", "76–82"],
                      ["M", "94–100", "82–88"],
                      ["L", "100–106", "88–94"],
                      ["XL", "106–112", "94–100"],
                      ["XXL", "112–118", "100–106"],
                    ].map((r) => (
                      <tr key={r[0]}>
                        {r.map((c) => (
                          <td key={c}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>Tra due taglie? Scrivici per trovare quella giusta.</p>
              </div>
            )}
            {panel === "account" && (
              <div className="info-panel">
                <p>
                  Questo è un concept navigabile. L’accesso cliente sarà
                  collegato all’account Shopify nel negozio definitivo.
                </p>
                <button
                  className="button primary"
                  onClick={() => navigate("collection", "Wishlist")}
                >
                  I TUOI PREFERITI <Icon name="heart" />
                </button>
              </div>
            )}
            {panel === "story" && (
              <div className="info-panel">
                <span className="eyebrow red">ROMA, OGNI GIORNO.</span>
                <h2>Non è solo una passione.</h2>
                <p>
                  È il rumore dello stadio. È una città che ti riconosce. È un
                  legame che non ha bisogno di spiegazioni.
                </p>
                <p>
                  Roma Giallorossa dà forma a questa appartenenza, con una
                  collezione di abbigliamento e accessori dedicata a chi vive
                  questi colori ogni giorno.
                </p>
                <button
                  className="button primary"
                  onClick={() => navigate("collection")}
                >
                  ENTRA NEL NOSTRO MONDO <Icon name="arrow" />
                </button>
              </div>
            )}
            {panel === "help" && (
              <div className="info-panel">
                <p>Per informazioni su ordini, spedizioni, resi e prodotti:</p>
                <a
                  className="text-link"
                  href="mailto:info@romagiallorossa.shop"
                >
                  info@romagiallorossa.shop <Icon name="arrow" />
                </a>
                <p>
                  In questo concept, le condizioni commerciali e i documenti
                  legali sono da confermare con il venditore prima della
                  pubblicazione.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
      {zoom && (
        <div
          className="zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Immagine ingrandita"
          onClick={() => setZoom(false)}
        >
          <button
            className="icon-button"
            aria-label="Chiudi zoom"
            onClick={() => setZoom(false)}
          >
            <Icon name="close" />
          </button>
          <img
            src={selected.images[gallery] || selected.image}
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = selected.image
            }}
            alt={selected.name}
          />
        </div>
      )}
    </>
  )
}
