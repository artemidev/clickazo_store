// Clickazo storefront — shared UI components. Exports to window.
const { useState, useEffect, useRef } = React;

// ---- Icon: thin wrapper around Lucide, currentColor, 2px stroke ----
function Icon({ name, size = 20, style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = "";
      const el = document.createElement("i");
      el.setAttribute("data-lucide", name);
      ref.current.appendChild(el);
      window.lucide.createIcons({ attrs: { width: size, height: size }, nameAttr: "data-lucide" });
    }
  }, [name, size]);
  return <span ref={ref} className={className} style={{ display: "inline-flex", width: size, height: size, ...style }} />;
}

const TINTS = {
  lime:   "color-mix(in oklab, var(--lime-500) 38%, var(--surface))",
  violet: "color-mix(in oklab, var(--violet-400) 34%, var(--surface))",
  amber:  "color-mix(in oklab, var(--amber-500) 30%, var(--surface))",
  slate:  "color-mix(in oklab, var(--ink-400) 26%, var(--surface))",
};

// ---- Product image panel (placeholder: tinted backdrop + glyph) ----
function ProductMedia({ p, big }) {
  return (
    <div className="cz-media" style={{ background: `radial-gradient(circle at 32% 28%, ${TINTS[p.tint] || TINTS.slate}, var(--surface-inset))` }}>
      <span className="cz-media-glyph"><Icon name={p.icon} size={big ? 120 : 64} /></span>
      <span className="cz-media-tag">{p.id.toUpperCase()}</span>
    </div>
  );
}

// ---- Stars ----
function Stars({ value, size = 14 }) {
  const full = Math.round(value);
  return (
    <span className="cz-stars" aria-label={value + " stars"}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size}
          className={i <= full ? "on" : "off"}
          fill={i <= full ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="m12 2 3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z"/>
        </svg>
      ))}
    </span>
  );
}

// ---- Price ----
function Price({ p, size = 16 }) {
  const has = p.sale != null;
  const fmt = v => "$" + (Number.isInteger(v) ? v : v.toFixed(2));
  return (
    <span className="cz-price" style={{ fontSize: size }}>
      <span style={{ color: has ? "var(--sale)" : "var(--fg-1)" }}>{fmt(has ? p.sale : p.price)}</span>
      {has && <s>{fmt(p.price)}</s>}
    </span>
  );
}

// ---- Badge ----
function Badge({ kind }) {
  const map = {
    sale: { t: "−" + 0 + "%", bg: "var(--red-500)", fg: "#fff" },
    new:  { t: "New", bg: "var(--lime-500)", fg: "var(--ink-900)" },
    bestseller: { t: "Bestseller", bg: "var(--violet-500)", fg: "#fff" },
  };
  return null; // replaced by ProductCard's own logic
}

// ---- Button ----
function Btn({ variant = "primary", size, full, children, onClick, disabled, icon, type }) {
  const cls = ["cz-btn", "cz-btn-" + variant, size ? "cz-btn-" + size : "", full ? "cz-btn-full" : ""].join(" ");
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type={type || "button"}>
      {icon && <Icon name={icon} size={size === "lg" ? 19 : 17} />}
      {children}
    </button>
  );
}

// ---- Product card (signature hover interaction) ----
function ProductCard({ p, onOpen, onAdd }) {
  const [added, setAdded] = useState(false);
  const off = p.sale != null ? Math.round((1 - p.sale / p.price) * 100) : 0;
  const badge =
    p.badge === "sale" ? { t: "−" + off + "%", bg: "var(--red-500)", fg: "#fff" } :
    p.badge === "new" ? { t: "New", bg: "var(--lime-500)", fg: "var(--ink-900)" } :
    p.badge === "bestseller" ? { t: "Bestseller", bg: "var(--violet-500)", fg: "#fff" } : null;
  return (
    <article className="cz-card" onClick={() => onOpen(p)}>
      <div className="cz-card-media">
        <ProductMedia p={p} />
        {badge && <span className="cz-card-badge" style={{ background: badge.bg, color: badge.fg }}>{badge.t}</span>}
        <button className="cz-wish" aria-label="Add to wishlist" onClick={e => e.stopPropagation()}>
          <Icon name="heart" size={16} />
        </button>
        <button className={"cz-quick" + (added ? " is-added" : "")}
          onClick={e => { e.stopPropagation(); setAdded(true); onAdd(p); setTimeout(() => setAdded(false), 1400); }}>
          {added ? <><Icon name="check" size={16} /> Added</> : "Add to cart"}
        </button>
      </div>
      <div className="cz-card-body">
        <div className="cz-card-cat">{p.cat}</div>
        <h3 className="cz-card-title">{p.name}</h3>
        <div className="cz-card-meta">
          <Price p={p} />
          <span className="cz-rate"><Icon name="star" size={13} /> {p.rating}</span>
        </div>
      </div>
    </article>
  );
}

Object.assign(window, { Icon, ProductMedia, Stars, Price, Btn, ProductCard, TINTS });
