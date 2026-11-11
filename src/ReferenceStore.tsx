import { useEffect, useRef, useState } from "react"
import Icon from "./ReferenceIcon"
import {
  referenceProducts as products,
  referenceMoney as money,
  type ReferenceProduct as Product,
} from "./reference-products"

type CartItem = {
  product: Product
  size: string
  quantity: number
}
type BrandProps = {
  onClick: () => void
}
function Brand({ onClick }: BrandProps) {
  return (
    <button
      className="rg-brand"
      onClick={onClick}
      aria-label="Roma Giallorossa, homepage"
    >
      <img src="/reference/skull.webp" alt="" />
      <span className="rg-brand-roma">ROMA</span>
      <span className="rg-brand-colors">
        <span>GIALLO</span>
        <span>ROSSA</span>
      </span>
    </button>
  )
}
type BottomProps = {
  active: string
  home: () => void
  shop: () => void
  menu: () => void
  favorites: () => void
  account: () => void
}
function BottomNav({
  active,
  home,
  shop,
  menu,
  favorites,
  account,
}: BottomProps) {
  return (
    <nav className="rg-bottom" aria-label="Navigazione app">
      {[
        { id: "home", text: "Home", icon: "home", action: home },
        { id: "shop", text: "Shop", icon: "bag", action: shop },
      ].map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          className={active === item.id ? "is-active" : ""}
          aria-current={active === item.id ? "page" : undefined}
        >
          <Icon name={item.icon} size={21} />
          <span>{item.text}</span>
        </button>
      ))}
      <button
        className="rg-bottom-crest"
        onClick={menu}
        aria-label="Apri il mondo giallorosso"
        aria-haspopup="dialog"
      >
        <span>
          <img src="/reference/skull.webp" alt="" />
        </span>
      </button>
      <button
        onClick={favorites}
        className={active === "favorites" ? "is-active" : ""}
        aria-current={active === "favorites" ? "page" : undefined}
      >
        <Icon name="heart" size={21} />
        <span>Preferiti</span>
      </button>
      <button onClick={account} aria-haspopup="dialog">
        <Icon name="user" size={21} />
        <span>Account</span>
      </button>
    </nav>
  )
}

export default function ReferenceStore() {
  const [page, setPage] = useState("home")
  const [category, setCategory] = useState("Felpe")
  const [product, setProduct] = useState(products[1])
  const [gallery, setGallery] = useState(0)
  const [size, setSize] = useState("M")
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [panel, setPanel] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("popular")
  const [filters, setFilters] = useState(false)
  const [filterSize, setFilterSize] = useState("")
  const [maxPrice, setMaxPrice] = useState(false)
  const [slide, setSlide] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  useEffect(() => {
    if (!panel) return
    const previous = document.activeElement as HTMLElement | null
    const element = dialogRef.current
    const controls = () =>
      Array.from(
        element?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input, select, a[href], [tabindex='0']",
        ) || [],
      ).filter((item) => item.offsetParent !== null)
    const initial =
      element?.querySelector<HTMLElement>("input[type='search']") ||
      controls()[0]
    initial?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel("")
      if (event.key !== "Tab") return
      const items = controls()
      const first = items[0]
      const last = items[items.length - 1]
      if (!element?.contains(document.activeElement)) {
        event.preventDefault()
        first?.focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKey)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [panel])

  function navigate(next: string, cat = "Felpe") {
    setPage(next)
    setCategory(cat)
    setPanel("")
    setFilters(false)
    setFilterSize("")
    setMaxPrice(false)
    window.scrollTo({ top: 0, behavior: "instant" })
  }
  function openProduct(next: Product) {
    setProduct(next)
    setGallery(0)
    setSize(next.sizes.includes("M") ? "M" : next.sizes[0])
    setQuantity(1)
    navigate("product", next.category)
  }
  function favorite(id: number) {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    )
  }
  function add(
    next: Product,
    selectedSize = next.sizes.includes("M") ? "M" : next.sizes[0],
    amount = 1,
  ) {
    setCart((previous) => {
      const index = previous.findIndex(
        (item) => item.product.id === next.id && item.size === selectedSize,
      )
      return index < 0
        ? [...previous, { product: next, size: selectedSize, quantity: amount }]
        : previous.map((item, i) =>
            i === index ? { ...item, quantity: item.quantity + amount } : item,
          )
    })
    setPanel("cart")
  }
  function changeQuantity(index: number, delta: number) {
    setCart((previous) =>
      previous
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }
  const filtered = products
    .filter(
      (item) =>
        (category === "Tutti i prodotti" ||
          (category === "Preferiti" && favorites.includes(item.id)) ||
          item.category === category) &&
        (!maxPrice || item.price <= 55) &&
        (!filterSize || item.sizes.includes(filterSize)),
    )
    .sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : 0,
    )
  const navProps: BottomProps = {
    active:
      page === "home"
        ? "home"
        : category === "Preferiti"
          ? "favorites"
          : "shop",
    home: () => navigate("home"),
    shop: () => navigate("catalog"),
    menu: () => setPanel(panel === "menu" ? "" : "menu"),
    favorites: () => navigate("catalog", "Preferiti"),
    account: () => setPanel("account"),
  }

  function card(item: Product) {
    return (
      <article className="rg-card" key={item.id}>
        <div className="rg-card-photo">
          <button
            className="rg-card-image-button"
            onClick={() => openProduct(item)}
            aria-label={`Scopri ${item.name}`}
          >
            <img src={item.image} alt={item.name} loading="lazy" />
          </button>
          {item.original && <span className="rg-sale">-16%</span>}
          <button
            className={`rg-heart ${
              favorites.includes(item.id) ? "is-saved" : ""
            }`}
            onClick={() => favorite(item.id)}
            aria-label={`${
              favorites.includes(item.id) ? "Rimuovi dai" : "Aggiungi ai"
            } preferiti: ${item.name}`}
            aria-pressed={favorites.includes(item.id)}
          >
            <Icon name="heart" size={18} />
          </button>
        </div>
        <button className="rg-card-name" onClick={() => openProduct(item)}>
          {item.cardName || item.name}
        </button>
        <div className="rg-card-price">
          {item.original && <del>{money(item.original)}</del>}
          <span>{money(item.price)}</span>
        </div>
        <button
          className="rg-card-add"
          onClick={() => openProduct(item)}
          aria-label={`Scegli taglia e acquista ${item.name}`}
        >
          <Icon name="cart" size={21} />
        </button>
      </article>
    )
  }

  return (
    <div className="reference-store">
      <header
        className={`rg-header ${page === "catalog" ? "rg-header-catalog" : ""}`}
      >
        <div className="rg-header-inner">
          <button
            className="rg-icon-button rg-menu-trigger"
            aria-label={page === "catalog" ? "Torna alla home" : "Apri menu"}
            onClick={() =>
              page === "catalog" ? navigate("home") : setPanel("menu")
            }
          >
            <Icon name={page === "catalog" ? "back" : "menu"} />
          </button>
          <div className="rg-header-brand">
            <Brand onClick={() => navigate("home")} />
          </div>
          {page === "catalog" && (
            <span className="rg-mobile-page-title">{category}</span>
          )}
          <nav className="rg-desktop-nav" aria-label="Navigazione principale">
            {["Felpe", "K-Way", "T-Shirt", "Accessori"].map((cat) => (
              <button
                key={cat}
                className={
                  page === "catalog" && category === cat ? "is-active" : ""
                }
                onClick={() => navigate("catalog", cat)}
              >
                {cat}
              </button>
            ))}
            <button onClick={() => setPanel("story")}>Chi siamo</button>
          </nav>
          <div className="rg-header-actions">
            <button
              className="rg-icon-button"
              aria-label="Cerca"
              onClick={() => setPanel("search")}
            >
              <Icon name="search" size={21} />
            </button>
            <button
              className="rg-icon-button rg-cart-trigger"
              aria-label={`Carrello, ${count} prodotti`}
              onClick={() => setPanel("cart")}
            >
              <Icon name="cart" size={25} />
              <span>{count}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="rg-main">
        {page === "home" && (
          <>
            <section
              className="rg-hero"
              aria-label="La collezione Roma Giallorossa"
              onTouchStart={(event) => {
                touchStart.current = event.touches[0].clientX
              }}
              onTouchEnd={(event) => {
                if (touchStart.current !== null) {
                  const delta =
                    event.changedTouches[0].clientX - touchStart.current
                  if (Math.abs(delta) > 45)
                    setSlide((previous) => (previous + (delta < 0 ? 1 : 3)) % 4)
                }
                touchStart.current = null
              }}
            >
              {slide === 0 && (
                <img
                  className="rg-hero-body"
                  src="/reference/hero-body.webp"
                  alt=""
                  aria-hidden="true"
                />
              )}
              <img
                className={`rg-hero-photo ${slide ? "rg-hero-alternate" : ""}`}
                src={
                  [
                    "/reference/hero.webp",
                    "/reference/product-red.webp",
                    "/reference/hoodie-black.webp",
                    "/reference/hoodie-white.webp",
                  ][slide]
                }
                alt={
                  slide
                    ? "La collezione di felpe giallorosse"
                    : "Romanista con felpa bordeaux e cappello davanti al Colosseo e alla bandiera ASR"
                }
                fetchPriority="high"
              />
              <div className="rg-hero-content">
                <p className="rg-hero-eyebrow">PIÙ DI UNA SQUADRA</p>
                <h1>
                  UNA FEDE
                  <br />
                  CHE TI
                  <br className="rg-desktop-break" />
                  <em>ACCOMPAGNA</em>
                </h1>
                <p className="rg-hero-description">
                  I nostri colori. La nostra storia.
                  <br />
                  Ovunque tu sia.
                </p>
                <button
                  className="rg-gold-button"
                  onClick={() => navigate("catalog")}
                >
                  SCOPRI LA COLLEZIONE <Icon name="arrow" size={19} />
                </button>
              </div>
              <div
                className="rg-cover-dots"
                aria-label="Copertine della collezione"
              >
                {[0, 1, 2, 3].map((index) => (
                  <button
                    key={index}
                    onClick={() => setSlide(index)}
                    className={slide === index ? "is-active" : ""}
                    aria-label={`Mostra copertina ${index + 1}`}
                    aria-current={slide === index ? "true" : undefined}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </section>
            <section className="rg-trust" aria-label="Servizi dello shop">
              <div>
                <Icon name="truck" size={29} />
                <p>
                  24/48H
                  <br />
                  TUTTA ITALIA
                </p>
              </div>
              <div>
                <Icon name="shield" size={29} />
                <p>
                  PAGAMENTO
                  <br />
                  ALLA CONSEGNA
                </p>
              </div>
              <div>
                <Icon name="box" size={29} />
                <p>
                  RESI FACILI
                  <br />
                  14 GIORNI
                </p>
              </div>
            </section>
            <section className="rg-home-collections">
              <div className="rg-section-heading">
                <div>
                  <h2>LE NOSTRE COLLEZIONI</h2>
                  <p>Vesti la tua appartenenza.</p>
                </div>
                <button onClick={() => navigate("catalog", "Tutti i prodotti")}>
                  Vedi tutte <span>→</span>
                </button>
              </div>
              <div className="rg-category-grid">
                {[
                  { name: "Felpe", image: "category-hoodie" },
                  { name: "K-Way", image: "category-jacket" },
                  { name: "T-Shirt", image: "category-shirt" },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate("catalog", item.name)}
                  >
                    <img
                      src={`/reference/${item.image}.webp`}
                      alt={`Collezione ${item.name}`}
                      loading="lazy"
                    />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="rg-home-featured">
              <div className="rg-section-heading">
                <div>
                  <h2>I PIÙ AMATI DAI ROMANISTI</h2>
                  <p>La passione si indossa.</p>
                </div>
              </div>
              <div className="rg-product-grid">
                {[products[1], products[4], products[0], products[2]].map(card)}
              </div>
            </section>
            <section className="rg-manifesto">
              <img
                src="/reference/rome.webp"
                alt="Il Colosseo nella luce del tramonto"
                loading="lazy"
              />
              <p>
                “ROMA NON SI SPIEGA.
                <br />
                <strong>SI VIVE.”</strong>
              </p>
              <button
                className="rg-outline-button"
                onClick={() => setPanel("story")}
              >
                La nostra storia <Icon name="arrow" size={17} />
              </button>
            </section>
          </>
        )}

        {page === "catalog" && (
          <section className="rg-catalog">
            <div className="rg-catalog-banner">
              <img
                src="/reference/collection.webp"
                alt="La collezione di felpe ricamate davanti al Colosseo"
              />
              <div>
                <h1>
                  {category === "Felpe"
                    ? "FELPE RICAMATE"
                    : category === "Preferiti"
                      ? "I TUOI PREFERITI"
                      : category.toUpperCase()}
                </h1>
                <p>
                  {category === "Preferiti"
                    ? "I tuoi colori, scelti da te."
                    : "Colori che uniscono."}
                  <br />
                  Storie che restano.
                </p>
              </div>
            </div>
            <div className="rg-catalog-tools">
              <button
                className={`rg-outline-button ${filters ? "is-active" : ""}`}
                onClick={() => setFilters(!filters)}
                aria-expanded={filters}
              >
                <Icon name="filter" size={16} />
                Filtra{filterSize || maxPrice ? " (attivi)" : ""}
              </button>
              <label>
                <span className="rg-sr-only">Ordina prodotti</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="popular">Più popolari</option>
                  <option value="price-low">Prezzo crescente</option>
                  <option value="price-high">Prezzo decrescente</option>
                </select>
              </label>
            </div>
            {filters && (
              <div className="rg-filter-panel">
                <label>
                  Taglia
                  <select
                    value={filterSize}
                    onChange={(event) => setFilterSize(event.target.value)}
                  >
                    <option value="">Tutte le taglie</option>
                    {["S", "M", "L", "XL", "XXL", "3XL", "Unica"].map(
                      (value) => (
                        <option key={value}>{value}</option>
                      ),
                    )}
                  </select>
                </label>
                <label className="rg-checkbox">
                  <input
                    type="checkbox"
                    checked={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.checked)}
                  />
                  Fino a €55
                </label>
                <button
                  onClick={() => {
                    setFilterSize("")
                    setMaxPrice(false)
                  }}
                >
                  Azzera filtri
                </button>
              </div>
            )}
            <div className="rg-product-grid">{filtered.map(card)}</div>
            {filtered.length === 0 && (
              <div className="rg-empty">
                <Icon
                  name={category === "Preferiti" ? "heart" : "search"}
                  size={38}
                />
                <h2>
                  {category === "Preferiti"
                    ? "La tua passione, i tuoi preferiti."
                    : "Nessun prodotto trovato."}
                </h2>
                <p>
                  {category === "Preferiti"
                    ? "Tocca il cuore sui prodotti per ritrovarli qui."
                    : "Prova a modificare i filtri."}
                </p>
                <button
                  className="rg-gold-button"
                  onClick={() => navigate("catalog")}
                >
                  SCOPRI LE FELPE <Icon name="arrow" size={18} />
                </button>
              </div>
            )}
          </section>
        )}

        {page === "product" && (
          <section className="rg-product-page">
            <div className="rg-breadcrumb">
              <button onClick={() => navigate("home")}>Home</button> /{" "}
              <button onClick={() => navigate("catalog", product.category)}>
                {product.category}
              </button>{" "}
              / <span>{product.name}</span>
            </div>
            <div className="rg-product-layout">
              <div className="rg-gallery">
                <div
                  className="rg-main-image"
                  onTouchStart={(event) => {
                    touchStart.current = event.touches[0].clientX
                  }}
                  onTouchEnd={(event) => {
                    if (
                      touchStart.current !== null &&
                      Math.abs(
                        event.changedTouches[0].clientX - touchStart.current,
                      ) > 45
                    )
                      setGallery(
                        (previous) =>
                          (previous +
                            (event.changedTouches[0].clientX <
                            touchStart.current!
                              ? 1
                              : product.gallery.length - 1)) %
                          product.gallery.length,
                      )
                    touchStart.current = null
                  }}
                >
                  <img
                    src={product.gallery[gallery]}
                    alt={`${product.name}, vista ${gallery + 1}`}
                  />
                  <button
                    className={`rg-heart ${
                      favorites.includes(product.id) ? "is-saved" : ""
                    }`}
                    onClick={() => favorite(product.id)}
                    aria-label="Salva prodotto nei preferiti"
                    aria-pressed={favorites.includes(product.id)}
                  >
                    <Icon name="heart" />
                  </button>
                  {product.gallery.length > 1 && (
                    <>
                      <button
                        className="rg-gallery-arrow rg-gallery-previous"
                        onClick={() =>
                          setGallery(
                            (gallery + product.gallery.length - 1) %
                              product.gallery.length,
                          )
                        }
                        aria-label="Immagine precedente"
                      >
                        <Icon name="back" />
                      </button>
                      <button
                        className="rg-gallery-arrow rg-gallery-next"
                        onClick={() =>
                          setGallery((gallery + 1) % product.gallery.length)
                        }
                        aria-label="Immagine successiva"
                      >
                        <Icon name="arrow" />
                      </button>
                    </>
                  )}
                </div>
                <div className="rg-thumbnails">
                  {product.gallery.map((image, index) => (
                    <button
                      key={image}
                      className={gallery === index ? "is-active" : ""}
                      onClick={() => setGallery(index)}
                      aria-label={`Mostra vista ${index + 1}`}
                      aria-pressed={gallery === index}
                    >
                      <img
                        src={
                          product.id === 2 && index === 0
                            ? "/reference/product-front.webp"
                            : image
                        }
                        alt={`Dettaglio ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="rg-product-details">
                <h1>{product.name}</h1>
                <div className="rg-product-price">{money(product.price)}</div>
                <p className="rg-available">
                  <span />
                  Disponibile
                </p>
                <div className="rg-size-label">
                  TAGLIA: <span>{size}</span>
                  <button onClick={() => setPanel("sizes")}>
                    Guida taglie
                  </button>
                </div>
                <div className="rg-sizes">
                  {product.sizes.map((value) => (
                    <button
                      key={value}
                      className={size === value ? "is-active" : ""}
                      onClick={() => setSize(value)}
                      aria-pressed={size === value}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="rg-quantity">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Riduci quantità"
                  >
                    <Icon name="minus" size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumenta quantità"
                  >
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <button
                  className="rg-gold-button rg-add-to-cart"
                  onClick={() => add(product, size, quantity)}
                >
                  <Icon name="cart" />
                  AGGIUNGI AL CARRELLO
                </button>
                <button
                  className="rg-shop-pay"
                  onClick={() => setPanel("payment")}
                >
                  Acquista con{" "}
                  <b>
                    shop<span>Pay</span>
                  </b>
                </button>
                <button
                  className="rg-payment-options"
                  onClick={() => {
                    add(product, size, quantity)
                    setSubmitted(false)
                    navigate("checkout")
                  }}
                >
                  Altre opzioni di pagamento
                </button>
                <div className="rg-product-accordions">
                  <details>
                    <summary>
                      Descrizione e dettagli <Icon name="plus" size={16} />
                    </summary>
                    <p>
                      I nostri colori. La nostra storia. Un capo per portare la
                      tua appartenenza sempre con te. Immagini, prezzi e
                      disponibilità di questo concept riprendono il riferimento
                      e non costituiscono un’offerta commerciale.
                    </p>
                  </details>
                  <details>
                    <summary>
                      Spedizioni e resi <Icon name="plus" size={16} />
                    </summary>
                    <p>
                      Tempi di spedizione, pagamento alla consegna e condizioni
                      di reso mostrati nel concept sono da confermare con il
                      negozio prima dell’acquisto.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "checkout" && (
          <section className="rg-checkout">
            <button className="rg-back-link" onClick={() => setPanel("cart")}>
              <Icon name="back" size={17} />
              Torna al carrello
            </button>
            <h1>Il tuo checkout</h1>
            <p className="rg-demo-note">
              Anteprima del concept · Nessun pagamento reale.
            </p>
            {submitted ? (
              <div className="rg-empty">
                <Icon name="check" size={42} />
                <h2>Anteprima completata.</h2>
                <p>
                  Nessun ordine è stato inviato e nessun pagamento è stato
                  effettuato.
                </p>
                <button
                  className="rg-gold-button"
                  onClick={() => navigate("home")}
                >
                  TORNA ALLA HOME
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="rg-empty">
                <h2>Il tuo carrello è vuoto.</h2>
                <button
                  className="rg-gold-button"
                  onClick={() => navigate("catalog")}
                >
                  SCOPRI LA COLLEZIONE
                </button>
              </div>
            ) : (
              <div className="rg-checkout-layout">
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    setSubmitted(true)
                  }}
                >
                  <h2>Contatti</h2>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                    />
                  </label>
                  <h2>Indirizzo di spedizione</h2>
                  <div className="rg-form-row">
                    <label>
                      Nome
                      <input
                        name="firstName"
                        required
                        autoComplete="given-name"
                      />
                    </label>
                    <label>
                      Cognome
                      <input
                        name="lastName"
                        required
                        autoComplete="family-name"
                      />
                    </label>
                  </div>
                  <label>
                    Indirizzo
                    <input
                      name="address"
                      required
                      autoComplete="street-address"
                    />
                  </label>
                  <div className="rg-form-row">
                    <label>
                      Città
                      <input
                        name="city"
                        required
                        autoComplete="address-level2"
                      />
                    </label>
                    <label>
                      CAP
                      <input
                        name="postal"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{5}"
                        autoComplete="postal-code"
                      />
                    </label>
                  </div>
                  <label>
                    Telefono
                    <input
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                    />
                  </label>
                  <div className="rg-checkout-notice">
                    <Icon name="shield" />
                    <p>
                      Questa è una simulazione. Non inserire dati di pagamento.
                    </p>
                  </div>
                  <button className="rg-gold-button" type="submit">
                    COMPLETA L’ANTEPRIMA <Icon name="arrow" size={18} />
                  </button>
                </form>
                <aside className="rg-order-summary">
                  <h2>Il tuo ordine</h2>
                  {cart.map((item) => (
                    <div
                      className="rg-summary-item"
                      key={`${item.product.id}-${item.size}`}
                    >
                      <img src={item.product.image} alt="" />
                      <span>
                        {item.product.name}
                        <small>
                          Taglia: {item.size} · Quantità: {item.quantity}
                        </small>
                      </span>
                      <b>{money(item.product.price * item.quantity)}</b>
                    </div>
                  ))}
                  <div className="rg-total">
                    <b>Totale</b>
                    <span>{money(subtotal)}</span>
                  </div>
                  <p className="rg-demo-note">
                    Spedizione e condizioni definitive da verificare.
                  </p>
                </aside>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="rg-footer">
        <Brand onClick={() => navigate("home")} />
        <p>I NOSTRI COLORI. LA NOSTRA FEDE.</p>
        <div>
          <button onClick={() => setPanel("help")}>Contatti</button>
          <button onClick={() => setPanel("help")}>Spedizioni e resi</button>
          <button onClick={() => setPanel("help")}>Privacy e condizioni</button>
        </div>
        <small>
          Concept indipendente · Immagini e dati illustrativi dal riferimento.
          <br />
          Pagamenti, account e ordini non sono collegati a Shopify.
        </small>
      </footer>
      {page !== "checkout" && (
        <div
          className={`rg-bottom-host ${panel ? "is-hidden" : ""}`}
          inert={Boolean(panel)}
          aria-hidden={panel ? true : undefined}
        >
          <BottomNav {...navProps} />
        </div>
      )}

      {panel && (
        <div className="rg-overlay" onClick={() => setPanel("")}>
          <div
            className={`rg-dialog rg-dialog-${panel}`}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === "cart"
                ? "Carrello"
                : panel === "menu"
                  ? "Menu principale"
                  : panel === "search"
                    ? "Cerca prodotti"
                    : "Informazioni"
            }
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rg-dialog-heading">
              {panel === "menu" ? (
                <Brand onClick={() => navigate("home")} />
              ) : (
                <h2>
                  {panel === "cart" ? (
                    <>
                      Carrello <span>({count})</span>
                    </>
                  ) : panel === "search" ? (
                    "Cerca nel nostro shop"
                  ) : panel === "account" ? (
                    "Il tuo account"
                  ) : panel === "sizes" ? (
                    "Guida alle taglie"
                  ) : panel === "payment" ? (
                    "Acquista con Shop Pay"
                  ) : panel === "story" ? (
                    "Lo shop dei romanisti"
                  ) : (
                    "Siamo qui per te"
                  )}
                </h2>
              )}
              <button
                className="rg-icon-button"
                aria-label="Chiudi"
                onClick={() => setPanel("")}
              >
                <Icon name="close" size={26} />
              </button>
            </div>

            {panel === "cart" && (
              <div className="rg-cart-content">
                {cart.length ? (
                  <>
                    <div className="rg-cart-items">
                      {cart.map((item, index) => (
                        <article
                          className="rg-cart-item"
                          key={`${item.product.id}-${item.size}`}
                        >
                          <button
                            className="rg-cart-image"
                            onClick={() => openProduct(item.product)}
                          >
                            <img
                              src={item.product.cartImage || item.product.image}
                              alt={item.product.name}
                            />
                          </button>
                          <div>
                            <button
                              className="rg-cart-name"
                              onClick={() => openProduct(item.product)}
                            >
                              {item.product.name}
                            </button>
                            <p>Taglia: {item.size}</p>
                            <span className="rg-cart-price">
                              {money(item.product.price)}
                            </span>
                            <div className="rg-quantity">
                              <button
                                onClick={() => changeQuantity(index, -1)}
                                aria-label={`Riduci quantità ${item.product.name}`}
                              >
                                <Icon name="minus" size={14} />
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={() => changeQuantity(index, 1)}
                                aria-label={`Aumenta quantità ${item.product.name}`}
                              >
                                <Icon name="plus" size={14} />
                              </button>
                            </div>
                          </div>
                          <button
                            className="rg-remove"
                            onClick={() =>
                              setCart((previous) =>
                                previous.filter((_, i) => i !== index),
                              )
                            }
                            aria-label={`Rimuovi ${item.product.name}`}
                          >
                            <Icon name="trash" size={18} />
                          </button>
                        </article>
                      ))}
                    </div>
                    <section className="rg-recommendations">
                      <h3>Potrebbe piacerti anche</h3>
                      <div>
                        {products.slice(5).map((item) => (
                          <article key={item.id}>
                            <div>
                              <button onClick={() => openProduct(item)}>
                                <img src={item.image} alt={item.name} />
                              </button>
                              <button
                                className="rg-small-add"
                                onClick={() => add(item)}
                                aria-label={`Aggiungi ${item.name}`}
                              >
                                <Icon name="plus" size={18} />
                              </button>
                            </div>
                            <button
                              className="rg-upsell-name"
                              onClick={() => openProduct(item)}
                            >
                              {item.name}
                            </button>
                            <span>{money(item.price)}</span>
                          </article>
                        ))}
                      </div>
                    </section>
                    <div className="rg-cart-totals">
                      <div>
                        <span>Subtotale</span>
                        <span>{money(subtotal)}</span>
                      </div>
                      <div>
                        <span>Spedizione</span>
                        <span>Gratis</span>
                      </div>
                      <div className="rg-total">
                        <b>Totale</b>
                        <span>{money(subtotal)}</span>
                      </div>
                      <button
                        className="rg-gold-button"
                        onClick={() => {
                          setSubmitted(false)
                          navigate("checkout")
                        }}
                      >
                        PROCEDI AL CHECKOUT
                      </button>
                      <div className="rg-shipping-note">
                        <Icon name="truck" size={36} />
                        <span>
                          Spedizione 24/48H
                          <br />
                          in tutta Italia
                        </span>
                      </div>
                      <p className="rg-demo-note">
                        Condizioni e prezzi illustrativi del concept.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rg-empty">
                    <Icon name="cart" size={44} />
                    <h2>Il tuo carrello è vuoto.</h2>
                    <p>La tua prossima passione ti aspetta.</p>
                    <button
                      className="rg-gold-button"
                      onClick={() => navigate("catalog")}
                    >
                      SCOPRI LA COLLEZIONE
                    </button>
                  </div>
                )}
              </div>
            )}

            {panel === "menu" && (
              <>
                <div className="rg-menu-scene" aria-hidden="true" />
                <nav className="rg-menu-links" aria-label="Menu principale">
                  {[
                    {
                      label: "Home",
                      icon: "home",
                      action: () => navigate("home"),
                    },
                    {
                      label: "Shop",
                      icon: "cart",
                      action: () => navigate("catalog", "Tutti i prodotti"),
                    },
                    {
                      label: "Felpe",
                      icon: "jacket",
                      action: () => navigate("catalog", "Felpe"),
                    },
                    {
                      label: "K-Way",
                      icon: "jacket",
                      action: () => navigate("catalog", "K-Way"),
                    },
                    {
                      label: "T-Shirt",
                      icon: "shirt",
                      action: () => navigate("catalog", "T-Shirt"),
                    },
                    {
                      label: "Accessori",
                      icon: "accessories",
                      action: () => navigate("catalog", "Accessori"),
                    },
                    {
                      label: "Chi siamo",
                      icon: "info",
                      action: () => setPanel("story"),
                    },
                  ].map((item) => (
                    <button key={item.label} onClick={item.action}>
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <div className="rg-menu-divider" />
                  {[
                    {
                      label: "I tuoi ordini",
                      icon: "bag",
                      action: () => setPanel("account"),
                    },
                    {
                      label: "Preferiti",
                      icon: "heart",
                      action: () => navigate("catalog", "Preferiti"),
                    },
                    {
                      label: "Account",
                      icon: "user",
                      action: () => setPanel("account"),
                    },
                  ].map((item) => (
                    <button key={item.label} onClick={item.action}>
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="rg-menu-quote">
                  <img src="/reference/menu-quote.webp" alt="" />
                  <p className="rg-sr-only">
                    “ROMA NON SI SPIEGA.
                    <br />
                    <strong>SI VIVE.”</strong>
                  </p>
                </div>
                <BottomNav {...navProps} />
              </>
            )}

            {panel === "search" && (
              <div className="rg-search-content">
                <label className="rg-search-field">
                  <Icon name="search" />
                  <input
                    type="search"
                    placeholder="Cerca una felpa, un colore, la tua passione…"
                    aria-label="Cerca prodotti"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <p className="rg-search-caption">
                  {search ? "Risultati della ricerca" : "I più cercati"}
                </p>
                {products
                  .filter(
                    (item) =>
                      item.name
                        .toLocaleLowerCase("it")
                        .includes(search.toLocaleLowerCase("it")) ||
                      item.category
                        .toLocaleLowerCase("it")
                        .includes(search.toLocaleLowerCase("it")),
                  )
                  .map((item) => (
                    <button
                      className="rg-search-result"
                      key={item.id}
                      onClick={() => openProduct(item)}
                    >
                      <img src={item.image} alt="" />
                      <span>
                        {item.name}
                        <small>{money(item.price)}</small>
                      </span>
                      <Icon name="arrow" size={17} />
                    </button>
                  ))}
                {search &&
                  !products.some((item) =>
                    `${item.name} ${item.category}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  ) && (
                    <p className="rg-empty">
                      Nessun risultato. Prova “Felpa” o “Roma”.
                    </p>
                  )}
              </div>
            )}
            {panel === "sizes" && (
              <div className="rg-info">
                <p>
                  Guida indicativa del concept. Le misure definitive devono
                  essere confermate dal negozio.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Taglia</th>
                      <th>Torace (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["S", "M", "L", "XL", "XXL", "3XL"].map((value, index) => (
                      <tr key={value}>
                        <td>{value}</td>
                        <td>
                          {88 + index * 6}–{94 + index * 6}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {panel === "account" && (
              <div className="rg-info">
                <Icon name="user" size={40} />
                <h3>La tua casa giallorossa.</h3>
                <p>
                  Account e storico ordini saranno disponibili con il
                  collegamento al negozio Shopify. Questo è un concept: non è
                  previsto un accesso reale.
                </p>
                <button
                  className="rg-gold-button"
                  onClick={() => navigate("catalog", "Preferiti")}
                >
                  <Icon name="heart" size={19} />I TUOI PREFERITI
                </button>
              </div>
            )}
            {panel === "payment" && (
              <div className="rg-info">
                <p>
                  Shop Pay è mostrato come nel riferimento, ma non è collegato a
                  un servizio di pagamento. Puoi esplorare il checkout
                  dimostrativo senza inserire dati di carta.
                </p>
                <button
                  className="rg-gold-button"
                  onClick={() => {
                    add(product, size, quantity)
                    setSubmitted(false)
                    navigate("checkout")
                  }}
                >
                  CONTINUA NELL’ANTEPRIMA <Icon name="arrow" size={17} />
                </button>
              </div>
            )}
            {panel === "story" && (
              <div className="rg-info">
                <img
                  className="rg-story-image"
                  src="/reference/rome.webp"
                  alt="Il Colosseo al tramonto"
                />
                <h3>
                  Più di una squadra.
                  <br />
                  Una fede che ti accompagna.
                </h3>
                <p>
                  I nostri colori. La nostra storia. Ovunque tu sia. Roma
                  Giallorossa è il mondo di chi porta l’appartenenza addosso,
                  ogni giorno.
                </p>
                <button
                  className="rg-gold-button"
                  onClick={() => navigate("catalog")}
                >
                  SCOPRI LA COLLEZIONE
                </button>
              </div>
            )}
            {panel === "help" && (
              <div className="rg-info">
                <p>Per informazioni su prodotti, spedizioni e resi:</p>
                <a href="mailto:info@romagiallorossa.shop">
                  info@romagiallorossa.shop
                </a>
                <p>
                  Questo concept riproduce il riferimento fornito. Prima della
                  pubblicazione occorre verificare con il venditore prezzi,
                  disponibilità, tempi di consegna, resi e documenti legali.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
