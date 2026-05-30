// Clickazo storefront — screens: Home, Listing, Product detail.
const { useState: useStateS, useMemo } = React;

// ---------- HOME ----------
function Home({ onOpen, onAdd, onNav }) {
  const P = window.CZ_PRODUCTS;
  const featured = P.filter(p => ["cz-401","cz-220","cz-114"].includes(p.id));
  const fresh = P.filter(p => p.badge === "new" || p.badge === "bestseller").slice(0, 4);
  return (
    <div className="cz-home">
      {/* Hero */}
      <section className="cz-hero">
        <div className="cz-hero-copy">
          <span className="eyebrow">New season · 2026</span>
          <h1>Code,<br/>worn well.</h1>
          <p className="lead">Tees, cubes, mugs, and desk gear for people who ship. Built to last, easy to love, free over $50.</p>
          <div className="cz-hero-cta">
            <Btn variant="primary" size="lg" onClick={() => onNav("new")}>Shop the new drop</Btn>
            <Btn variant="outline" size="lg" icon="arrow-right" onClick={() => onNav("home")}>Browse all</Btn>
          </div>
          <div className="cz-hero-trust">
            <span><Icon name="truck" size={16} /> Free 2-day shipping</span>
            <span><Icon name="shield-check" size={16} /> 30-day returns</span>
            <span><Icon name="star" size={16} /> 4.8 avg · 6k reviews</span>
          </div>
        </div>
        <div className="cz-hero-media">
          <div className="cz-hero-card cz-hero-card-1"><ProductMedia p={featured[0]} big /></div>
          <div className="cz-hero-card cz-hero-card-2"><ProductMedia p={featured[1]} /></div>
          <div className="cz-hero-card cz-hero-card-3"><ProductMedia p={featured[2]} /></div>
        </div>
      </section>

      {/* Category strip */}
      <section className="cz-cats">
        {[["Apparel","shirt"],["Cubes","box"],["Desk","keyboard"],["Drinkware","coffee"],["Gym","dumbbell"],["Gadgets","cable"]].map(([c,ic]) => (
          <button key={c} className="cz-cat-tile" onClick={() => onNav("home")}>
            <Icon name={ic} size={24} /><span>{c}</span>
          </button>
        ))}
      </section>

      {/* New + bestsellers */}
      <section className="cz-section">
        <div className="cz-section-head">
          <div><span className="eyebrow">Fresh out</span><h2>New & trending</h2></div>
          <Btn variant="ghost" icon="arrow-right" onClick={() => onNav("new")}>See all</Btn>
        </div>
        <div className="cz-grid">
          {fresh.map(p => <ProductCard key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} />)}
        </div>
      </section>

      {/* Promo band */}
      <section className="cz-promo-band">
        <div className="cz-promo-text">
          <span className="eyebrow" style={{color:"rgba(20,22,15,.6)"}}>Limited</span>
          <h2>The desk-setup sale — up to 30% off keyboards, stands & mats.</h2>
          <Btn variant="secondary" size="lg" onClick={() => onNav("sale")}>Shop the sale</Btn>
        </div>
        <div className="cz-promo-icon"><Icon name="keyboard" size={120} /></div>
      </section>

      {/* Editorial quote */}
      <section className="cz-quote">
        <p className="serif">"Buy nice or buy twice. We picked nice."</p>
        <span className="cz-muted">— the Clickazo team</span>
      </section>
    </div>
  );
}

// ---------- LISTING ----------
function Listing({ onOpen, onAdd, query, initialCat }) {
  const P = window.CZ_PRODUCTS;
  const [cat, setCat] = useStateS(initialCat || "All");
  const [sort, setSort] = useStateS("featured");
  const [onSale, setOnSale] = useStateS(initialCat === "Sale");

  const list = useMemo(() => {
    let l = P.slice();
    if (onSale) l = l.filter(p => p.sale != null);
    if (cat !== "All") l = l.filter(p => p.cat === cat);
    if (query) l = l.filter(p => (p.name + p.cat).toLowerCase().includes(query.toLowerCase()));
    if (sort === "price-asc") l.sort((a,b) => (a.sale??a.price) - (b.sale??b.price));
    if (sort === "price-desc") l.sort((a,b) => (b.sale??b.price) - (a.sale??a.price));
    if (sort === "rating") l.sort((a,b) => b.rating - a.rating);
    return l;
  }, [cat, sort, onSale, query]);

  return (
    <div className="cz-listing">
      <div className="cz-listing-head">
        <div>
          <span className="eyebrow">{list.length} products</span>
          <h1 style={{fontSize:"var(--text-h2)"}}>{onSale ? "On sale" : cat === "All" ? "Everything" : cat}</h1>
        </div>
        <div className="cz-sort">
          <Icon name="sliders-horizontal" size={16} />
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div className="cz-chips">
        {window.CZ_CATEGORIES.map(c => (
          <button key={c} className={"chip" + (cat === c && !onSale ? " active" : "")} onClick={() => { setCat(c); setOnSale(false); }}>{c}</button>
        ))}
        <button className={"chip lime" + (onSale ? " active" : "")} onClick={() => setOnSale(v => !v)}>On sale</button>
      </div>

      <div className="cz-grid cz-grid-4">
        {list.map(p => <ProductCard key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} />)}
      </div>
      {list.length === 0 && <div className="cz-empty" style={{padding:"60px 0"}}><Icon name="search" size={36} /><p className="cz-empty-title">Nothing matches that.</p><p className="cz-muted">Try a different filter or search.</p></div>}
    </div>
  );
}

// ---------- PRODUCT DETAIL ----------
function ProductDetail({ p, onAdd, onOpen, onBack }) {
  const [size, setSize] = useStateS("M");
  const [qty, setQty] = useStateS(1);
  const [added, setAdded] = useStateS(false);
  const P = window.CZ_PRODUCTS;
  const related = P.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  const rel = related.length ? related : P.filter(x => x.id !== p.id).slice(0, 4);
  const isApparel = p.cat === "Apparel";

  return (
    <div className="cz-pdp">
      <div className="bc">
        <button onClick={onBack}>Home</button><span>/</span>
        <button onClick={onBack}>{p.cat}</button><span>/</span>
        <span className="cur">{p.name}</span>
      </div>

      <div className="cz-pdp-main">
        <div className="cz-pdp-gallery">
          <div className="cz-pdp-hero"><ProductMedia p={p} big /></div>
          <div className="cz-pdp-thumbs">
            {[0,1,2].map(i => <div key={i} className={"cz-pdp-thumb" + (i===0?" is-active":"")}><Icon name={p.icon} size={28} /></div>)}
          </div>
        </div>

        <div className="cz-pdp-info">
          <span className="eyebrow">{p.cat} · {p.id.toUpperCase()}</span>
          <h1>{p.name}</h1>
          <div className="cz-pdp-rate">
            <Stars value={p.rating} size={18} />
            <span className="cz-muted">{p.rating} · {p.reviews} reviews</span>
          </div>
          <div className="cz-pdp-price"><Price p={p} size={34} /></div>
          <p className="cz-pdp-blurb">{p.blurb}</p>

          <div className="cz-pdp-tags">
            {p.tags.map(t => <span key={t} className="cz-spec-chip">{t}</span>)}
          </div>

          {isApparel && (
            <div className="cz-pdp-opt">
              <div className="cz-opt-label">Size</div>
              <div className="cz-size-row">
                {["XS","S","M","L","XL","2XL"].map(s => (
                  <button key={s} className={"cz-size" + (size===s?" is-active":"")} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="cz-pdp-buy">
            <div className="cz-stepper cz-stepper-lg">
              <button onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q+1)}>+</button>
            </div>
            <Btn variant="primary" size="lg" full icon={added ? "check" : "shopping-bag"}
              onClick={() => { for (let i=0;i<qty;i++) onAdd(p); setAdded(true); setTimeout(()=>setAdded(false),1500); }}>
              {added ? "Added to bag" : "Add to cart"}
            </Btn>
          </div>
          <Btn variant="secondary" size="lg" full>Buy it now</Btn>

          <div className="cz-pdp-trust">
            <span><Icon name="truck" size={16} /> Free 2-day shipping over $50</span>
            <span><Icon name="shield-check" size={16} /> 30-day no-fuss returns</span>
          </div>
        </div>
      </div>

      <section className="cz-section">
        <div className="cz-section-head"><div><span className="eyebrow">You might also like</span><h2>More from {p.cat}</h2></div></div>
        <div className="cz-grid cz-grid-4">
          {rel.map(x => <ProductCard key={x.id} p={x} onOpen={onOpen} onAdd={onAdd} />)}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Home, Listing, ProductDetail });
