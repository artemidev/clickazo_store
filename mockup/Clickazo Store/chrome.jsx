// Clickazo storefront — chrome: header, cart drawer, footer.
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC, useMemo: useMemoC } = React;

// ---------- Header search (floating instant results) ----------
function HeaderSearch({ query, onQuery, onOpen, onNav, compact }) {
  const [open, setOpen] = useStateC(false);
  const [active, setActive] = useStateC(0);
  const wrapRef = useRefC(null);
  const inputRef = useRefC(null);
  const P = window.CZ_PRODUCTS;
  const POPULAR = ["Mechanical keyboard", "Speed cube", "Hoodie", "Rubber duck", "Desk mat"];

  const q = query.trim().toLowerCase();
  const results = useMemoC(() => {
    if (!q) return [];
    return P
      .map(p => {
        const hay = (p.name + " " + p.cat + " " + (p.tags || []).join(" ")).toLowerCase();
        const i = hay.indexOf(q);
        return i === -1 ? null : { p, score: i };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6)
      .map(r => r.p);
  }, [q]);

  // close on outside click
  useEffectC(() => {
    const onDoc = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  useEffectC(() => { setActive(0); }, [q]);

  const choose = (p) => { setOpen(false); onQuery(""); inputRef.current && inputRef.current.blur(); onOpen(p); };
  const submitAll = () => { setOpen(false); onNav("listing"); };

  const onKey = (e) => {
    if (e.key === "Escape") { setOpen(false); inputRef.current && inputRef.current.blur(); return; }
    if (!results.length) { if (e.key === "Enter" && q) submitAll(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(results.length, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active < results.length) choose(results[active]); else submitAll();
    }
  };

  const showPanel = open;
  const fmt = v => "$" + (Number.isInteger(v) ? v : v.toFixed(2));

  return (
    <div className={"cz-search-wrap" + (compact ? " compact" : "") + (showPanel ? " is-open" : "")} ref={wrapRef}>
      <div className="cz-search">
        <Icon name="search" size={compact ? 17 : 19} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { onQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={compact ? "Search…" : "Search tees, cubes, keyboards…"}
          aria-label="Search the store"
        />
        {query && (
          <button className="cz-search-clear" onMouseDown={e => e.preventDefault()} onClick={() => { onQuery(""); inputRef.current && inputRef.current.focus(); }} aria-label="Clear search">
            <Icon name="x" size={15} />
          </button>
        )}
        {!compact && (
          <button className="cz-search-go" onMouseDown={e => e.preventDefault()} onClick={submitAll} aria-label="Search">
            Search
          </button>
        )}
      </div>

      {showPanel && (
        <div className="cz-search-panel" role="listbox">
          {!q && (
            <div className="cz-search-pop">
              <div className="cz-search-head">Popular searches</div>
              <div className="cz-search-pills">
                {POPULAR.map(t => (
                  <button key={t} className="cz-search-pill" onMouseDown={e => e.preventDefault()} onClick={() => { onQuery(t); setOpen(true); inputRef.current && inputRef.current.focus(); }}>
                    <Icon name="search" size={13} />{t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && results.length === 0 && (
            <div className="cz-search-empty">
              <Icon name="search-x" size={22} />
              <div>No matches for <b>“{query}”</b></div>
              <span>Try “keyboard”, “cube”, or “mug”.</span>
            </div>
          )}

          {q && results.length > 0 && (
            <>
              <div className="cz-search-head">{results.length} match{results.length > 1 ? "es" : ""}</div>
              <div className="cz-search-rows">
                {results.map((p, i) => (
                  <button
                    key={p.id}
                    className={"cz-search-row" + (i === active ? " is-active" : "")}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => choose(p)}
                  >
                    <span className="cz-search-thumb"><ProductMedia p={p} /></span>
                    <span className="cz-search-info">
                      <span className="cz-search-name">{p.name}</span>
                      <span className="cz-search-cat">{p.cat}</span>
                    </span>
                    <span className="cz-search-price">
                      {p.sale != null
                        ? <><span className="sale">{fmt(p.sale)}</span><s>{fmt(p.price)}</s></>
                        : <span>{fmt(p.price)}</span>}
                    </span>
                  </button>
                ))}
              </div>
              <button
                className={"cz-search-all" + (active === results.length ? " is-active" : "")}
                onMouseEnter={() => setActive(results.length)}
                onMouseDown={e => e.preventDefault()}
                onClick={submitAll}
              >
                <span>See all results for <b>“{query}”</b></span> <Icon name="arrow-right" size={15} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Account menu (user icon) ----------
function AccountMenu({ user, onAuth, onSignOut }) {
  const [open, setOpen] = useStateC(false);
  const ref = useRefC(null);
  useEffectC(() => {
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const go = (r) => { setOpen(false); onAuth(r); };
  return (
    <div className="cz-acct" ref={ref}>
      <button className={"cz-icon-btn" + (open ? " is-active" : "")} onClick={() => setOpen(o => !o)} aria-label="Account">
        {user
          ? <span className="cz-acct-avatar">{user.name.slice(0,1).toUpperCase()}</span>
          : <Icon name="user" size={20} />}
      </button>
      {open && (
        <div className="cz-menu" role="menu">
          {user ? (
            <>
              <div className="cz-menu-head">
                <span className="cz-acct-avatar lg">{user.name.slice(0,1).toUpperCase()}</span>
                <div>
                  <div className="cz-menu-name">{user.name}</div>
                  <div className="cz-menu-mail">{user.email}</div>
                </div>
              </div>
              <div className="cz-menu-sep"></div>
              <button className="cz-menu-item" role="menuitem"><Icon name="package" size={17} />Your orders</button>
              <button className="cz-menu-item" role="menuitem"><Icon name="heart" size={17} />Wishlist</button>
              <button className="cz-menu-item" role="menuitem"><Icon name="settings" size={17} />Account settings</button>
              <div className="cz-menu-sep"></div>
              <button className="cz-menu-item" role="menuitem" onClick={() => { setOpen(false); onSignOut(); }}><Icon name="log-out" size={17} />Sign out</button>
            </>
          ) : (
            <>
              <div className="cz-menu-top">
                <div className="cz-menu-title">Welcome to Clickazo</div>
                <div className="cz-menu-sub">Sign in for faster checkout and order tracking.</div>
              </div>
              <Btn variant="primary" full onClick={() => go("signin")}>Sign in</Btn>
              <button className="cz-menu-create" onClick={() => go("signup")}>New here? <b>Create an account</b></button>
              <div className="cz-menu-sep"></div>
              <button className="cz-menu-item" role="menuitem" onClick={() => go("signin")}><Icon name="package" size={17} />Track an order</button>
              <button className="cz-menu-item" role="menuitem" onClick={() => go("signin")}><Icon name="heart" size={17} />Wishlist</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Announcement bar (rotating value props) ----------
const CZ_ANNOUNCE = [
  { icon: "truck",        node: <>Free shipping over <b>$50</b> &middot; ships in 1&ndash;2 days</> },
  { icon: "rotate-ccw",   node: <>30-day no-nonsense returns</> },
  { icon: "zap",          node: <>New drop live &mdash; up to <b>30% off</b> select gear</> },
  { icon: "shield-check", node: <>Secure checkout &middot; pay your way</> },
];

function AnnouncementBar({ mode, onNav }) {
  const [i, setI] = useStateC(0);
  const [dismissed, setDismissed] = useStateC(false);
  const rotating = mode === "rotating";
  useEffectC(() => {
    if (!rotating) return;
    const t = setInterval(() => setI(n => (n + 1) % CZ_ANNOUNCE.length), 4200);
    return () => clearInterval(t);
  }, [rotating]);
  if (mode === "off" || dismissed) return null;
  const items = rotating ? CZ_ANNOUNCE : [CZ_ANNOUNCE[0]];
  const cur = rotating ? i : 0;
  return (
    <div className="cz-announce" role="status" aria-live="polite">
      <div className="cz-announce-inner">
        {rotating && (
          <div className="cz-announce-dots">
            {CZ_ANNOUNCE.map((_, k) => (
              <button key={k} className={"cz-announce-dot" + (k === cur ? " is-on" : "")} onClick={() => setI(k)} aria-label={"Message " + (k + 1)} />
            ))}
          </div>
        )}
        <div className="cz-announce-track">
          {CZ_ANNOUNCE.map((m, k) => (
            <div key={k} className={"cz-announce-item" + (k === cur ? " is-on" : "")} aria-hidden={k !== cur}>
              <Icon name={m.icon} size={15} /> {m.node}
            </div>
          ))}
        </div>
        <button className="cz-announce-x" onClick={() => setDismissed(true)} aria-label="Dismiss">
          <Icon name="x" size={15} />
        </button>
      </div>
    </div>
  );
}

// ---------- Mega-menu ----------
const CZ_MEGA = {
  home: {
    cols: [
      { h: "Shop by category", links: [
        { label: "Apparel", route: "apparel", icon: "shirt" },
        { label: "Desk gear", route: "desk", icon: "keyboard" },
        { label: "Cubes", route: "listing", icon: "box" },
        { label: "Drinkware", route: "listing", icon: "coffee" },
        { label: "Gadgets", route: "listing", icon: "cable" },
        { label: "Gym", route: "listing", icon: "dumbbell" },
      ]},
      { h: "Collections", links: [
        { label: "New drops", route: "new", icon: "sparkles" },
        { label: "Best sellers", route: "listing", icon: "trending-up" },
        { label: "On sale", route: "sale", icon: "tag", hl: true },
        { label: "Under $25", route: "listing", icon: "wallet" },
      ]},
    ],
    featured: { title: "Trending now", route: "listing", items: ["cz-725", "cz-220"] },
    promo: { tone: "lime", t: "Free shipping over $50", s: "Plus 30-day returns, always.", cta: "Shop all", route: "listing" },
  },
  new: {
    cols: [{ h: "Just landed", links: [
      { label: "All new arrivals", route: "new", icon: "sparkles", hl: true },
      { label: "New apparel", route: "apparel", icon: "shirt" },
      { label: "New desk gear", route: "desk", icon: "keyboard" },
      { label: "New gadgets", route: "listing", icon: "cable" },
    ]}],
    featured: { title: "Fresh this week", route: "new", items: ["cz-220", "cz-1002"] },
  },
  apparel: {
    cols: [{ h: "Apparel", links: [
      { label: "All apparel", route: "apparel", icon: "shirt", hl: true },
      { label: "Tees", route: "apparel", icon: "shirt" },
      { label: "Hoodies", route: "apparel", icon: "shirt" },
      { label: "Beanies & hats", route: "apparel", icon: "shirt" },
    ]}],
    featured: { title: "Popular in apparel", route: "apparel", items: ["cz-114", "cz-512"] },
  },
  desk: {
    cols: [{ h: "Desk", links: [
      { label: "All desk gear", route: "desk", icon: "keyboard", hl: true },
      { label: "Keyboards", route: "desk", icon: "keyboard" },
      { label: "Stands & risers", route: "desk", icon: "laptop-minimal" },
      { label: "Desk mats", route: "desk", icon: "square-mouse-pointer" },
      { label: "Cables", route: "desk", icon: "cable" },
    ]}],
    featured: { title: "Desk favorites", route: "desk", items: ["cz-401", "cz-1002"] },
  },
  sale: {
    cols: [{ h: "Deals", links: [
      { label: "All sale items", route: "sale", icon: "tag", hl: true },
      { label: "Apparel deals", route: "sale", icon: "shirt" },
      { label: "Desk deals", route: "sale", icon: "keyboard" },
    ]}],
    featured: { title: "Biggest markdowns", route: "sale", items: ["cz-401", "cz-114"] },
    promo: { tone: "red", t: "Up to 30% off select gear", s: "While stocks last — only a few left.", cta: "Shop the sale", route: "sale" },
  },
};

function MegaMenu({ data, onNav, onOpen, onClose }) {
  const fmt = v => "$" + (Number.isInteger(v) ? v : v.toFixed(2));
  const byId = id => window.CZ_PRODUCTS.find(p => p.id === id);
  const feats = (data.featured.items || []).map(byId).filter(Boolean);
  return (
    <div className="cz-mega" onMouseEnter={() => {}}>
      <div className="cz-mega-inner">
        <div className="cz-mega-cols">
          {data.cols.map((col, ci) => (
            <div key={ci}>
              <div className="cz-mega-col-h">{col.h}</div>
              <div className="cz-mega-links">
                {col.links.map((l, li) => (
                  <button key={li} className={"cz-mega-link" + (l.hl ? " hl" : "")} onClick={() => { onNav(l.route); onClose(); }}>
                    <Icon name={l.icon} size={17} /> {l.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="cz-mega-feat">
          <div className="cz-mega-feat-h">
            <div className="cz-mega-col-h">{data.featured.title}</div>
            <button className="cz-mega-feat-all" onClick={() => { onNav(data.featured.route); onClose(); }}>
              See all <Icon name="arrow-right" size={15} />
            </button>
          </div>
          <div className="cz-mega-feat-grid">
            {feats.map(p => (
              <button key={p.id} className="cz-mega-fcard" onClick={() => { onOpen(p); onClose(); }}>
                <span className="cz-mega-fthumb"><ProductMedia p={p} /></span>
                <span className="cz-mega-fbody">
                  <span className="cz-mega-fcat">{p.cat}</span>
                  <span className="cz-mega-fname">{p.name}</span>
                  <span className="cz-mega-fprice">
                    {p.sale != null
                      ? <><span className="sale">{fmt(p.sale)}</span><s>{fmt(p.price)}</s></>
                      : <span>{fmt(p.price)}</span>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {data.promo && (
        <div className="cz-mega-promo-row">
          <div className={"cz-mega-promo " + data.promo.tone}>
            <div>
              <div className="cz-mega-promo-t">{data.promo.t}</div>
              <div className="cz-mega-promo-s">{data.promo.s}</div>
            </div>
            <button className="cz-mega-promo-cta" onClick={() => { onNav(data.promo.route); onClose(); }}>
              {data.promo.cta} <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ cartCount, cartSubtotal, onCartOpen, theme, onToggleTheme, route, onNav, query, onQuery, onOpen, user, onAuth, onSignOut, tweaks }) {
  const t = tweaks || {};
  const links = [["home","Shop"],["new","New drops"],["apparel","Apparel"],["desk","Desk"],["sale","Sale"]];
  const [hot, setHot] = useStateC(null);          // currently-open mega key
  const [bump, setBump] = useStateC(false);
  const closeT = useRefC(null);
  const prevCount = useRefC(cartCount);

  // cart count pop animation
  useEffectC(() => {
    if (cartCount > prevCount.current) { setBump(true); const x = setTimeout(() => setBump(false), 420); prevCount.current = cartCount; return () => clearTimeout(x); }
    prevCount.current = cartCount;
  }, [cartCount]);

  const megaOn = t.megaMenu !== false;
  const openMega = (k) => { if (!megaOn || !CZ_MEGA[k]) return; clearTimeout(closeT.current); setHot(k); };
  const scheduleClose = () => { closeT.current = setTimeout(() => setHot(null), 130); };
  const cancelClose = () => clearTimeout(closeT.current);
  const closeNow = () => { clearTimeout(closeT.current); setHot(null); };

  const fmt = v => "$" + (Number.isInteger(v) ? Math.round(v) : v.toFixed(2));
  const freeAt = 50;
  const toFree = Math.max(0, freeAt - cartSubtotal);
  const pct = Math.min(100, cartSubtotal > 0 ? (cartSubtotal / freeAt) * 100 : 0);
  const showNudge = t.freeShipNudge !== false && cartCount > 0;
  const showValue = t.cartValue !== false && cartCount > 0;

  return (
    <>
      <AnnouncementBar mode={t.announce || "rotating"} onNav={onNav} />
      <header className="cz-header">
        {/* row 1 — logo · search · actions */}
        <div className="cz-bar">
          <button className="cz-logo" onClick={() => onNav("home")} aria-label="Clickazo home">
            <span className="cz-logo-mark">
              <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" fill="var(--ink-900)"/></svg>
            </span>
            <span className="cz-logo-word">Clickazo</span>
          </button>

          <HeaderSearch query={query} onQuery={onQuery} onOpen={onOpen} onNav={onNav} compact={t.searchStyle === "compact"} />

          <div className="cz-header-actions">
            <button className="cz-icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
            </button>
            <AccountMenu user={user} onAuth={onAuth} onSignOut={onSignOut} />

            {showNudge && (
              <div className={"cz-ship-nudge" + (toFree === 0 ? " unlocked" : "")} title={toFree === 0 ? "Free shipping unlocked" : "Add " + fmt(toFree) + " for free shipping"}>
                <Icon name={toFree === 0 ? "circle-check" : "truck"} size={18} />
                <div className="cz-ship-nudge-body">
                  <div className="cz-ship-nudge-text">
                    {toFree === 0 ? "Free shipping unlocked" : <>Add <b>{fmt(toFree)}</b> for free ship</>}
                  </div>
                  <div className="cz-ship-nudge-track"><div className="cz-ship-nudge-fill" style={{ width: pct + "%" }} /></div>
                </div>
              </div>
            )}

            <button className={"cz-cart-btn" + (bump ? " bump" : "")} onClick={onCartOpen} aria-label="Open cart">
              <span className="cz-cart-ic">
                <Icon name="shopping-bag" size={20} />
                {cartCount > 0 && <span className="cz-cart-count">{cartCount}</span>}
              </span>
              {showValue && <span className="cz-cart-total">{fmt(cartSubtotal)}</span>}
            </button>
          </div>
        </div>

        {/* row 2 — category nav + mega-menu */}
        <div className="cz-navbar" onMouseLeave={scheduleClose}>
          <div className="cz-navbar-inner">
            <nav className="cz-nav">
              {links.map(([k,l]) => {
                const hasMega = megaOn && !!CZ_MEGA[k];
                return (
                  <button
                    key={k}
                    className={"cz-nav-link" + (route === k ? " is-active" : "") + (hot === k ? " is-hot" : "") + (k === "sale" && t.saleAccent !== false ? " sale" : "")}
                    onClick={() => { onNav(k); closeNow(); }}
                    onMouseEnter={() => openMega(k)}
                  >
                    {l}
                    {hasMega && <Icon name="chevron-down" size={15} className="chev" />}
                  </button>
                );
              })}
            </nav>
            <div className="cz-nav-spacer" />
            <div className="cz-nav-aux">
              <button className="cz-nav-aux-link" onClick={() => onNav("listing")}><Icon name="truck" size={15} /> Free shipping over $50</button>
              <span className="cz-nav-aux-sep" />
              <button className="cz-nav-aux-link" onClick={() => onAuth("signin")}><Icon name="package" size={15} /> Track order</button>
            </div>
          </div>
          {hot && CZ_MEGA[hot] && (
            <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
              <MegaMenu data={CZ_MEGA[hot]} onNav={onNav} onOpen={onOpen} onClose={closeNow} />
            </div>
          )}
        </div>
      </header>
    </>
  );
}

function CartDrawer({ open, items, onClose, onQty, onRemove }) {
  const subtotal = items.reduce((s, it) => s + (it.p.sale ?? it.p.price) * it.qty, 0);
  const freeAt = 50;
  const toFree = Math.max(0, freeAt - subtotal);
  const pct = Math.min(100, (subtotal / freeAt) * 100);
  return (
    <div className={"cz-drawer-root" + (open ? " is-open" : "")} aria-hidden={!open}>
      <div className="cz-drawer-scrim" onClick={onClose}></div>
      <aside className="cz-drawer" role="dialog" aria-label="Your bag">
        <div className="cz-drawer-head">
          <h3>Your bag <span className="cz-muted">({items.reduce((s,i)=>s+i.qty,0)})</span></h3>
          <button className="cz-icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button>
        </div>

        {items.length > 0 && (
          <div className="cz-ship-bar">
            <div className="cz-ship-text">
              {toFree > 0
                ? <>Add <b>${toFree.toFixed(2)}</b> for free shipping</>
                : <><Icon name="truck" size={14} /> You've unlocked free shipping</>}
            </div>
            <div className="cz-ship-track"><div className="cz-ship-fill" style={{ width: pct + "%" }}></div></div>
          </div>
        )}

        <div className="cz-drawer-body">
          {items.length === 0 ? (
            <div className="cz-empty">
              <Icon name="shopping-bag" size={40} />
              <p className="cz-empty-title">Your bag's empty.</p>
              <p className="cz-muted">Go find something good.</p>
            </div>
          ) : items.map(it => (
            <div className="cz-line" key={it.p.id}>
              <div className="cz-line-media"><ProductMedia p={it.p} /></div>
              <div className="cz-line-info">
                <div className="cz-line-title">{it.p.name}</div>
                <div className="cz-line-cat">{it.p.cat}</div>
                <div className="cz-line-foot">
                  <div className="cz-stepper">
                    <button onClick={() => onQty(it.p, -1)} aria-label="Decrease">−</button>
                    <span>{it.qty}</span>
                    <button onClick={() => onQty(it.p, 1)} aria-label="Increase">+</button>
                  </div>
                  <Price p={it.p} size={15} />
                </div>
              </div>
              <button className="cz-line-x" onClick={() => onRemove(it.p)} aria-label="Remove"><Icon name="x" size={16} /></button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="cz-drawer-foot">
            <div className="cz-subtotal"><span>Subtotal</span><span className="cz-price" style={{fontSize:20}}><span style={{color:"var(--fg-1)"}}>${subtotal.toFixed(2)}</span></span></div>
            <p className="cz-muted cz-fineprint">Taxes and shipping calculated at checkout.</p>
            <Btn variant="primary" size="lg" full>Checkout</Btn>
            <button className="cz-link-btn" onClick={onClose}>or keep shopping</button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Footer({ onNav }) {
  const cols = [
    ["Shop", ["New drops","Apparel","Desk gear","Cubes","Gadgets"]],
    ["Help", ["Shipping","Returns","Size guide","Track order","Contact"]],
    ["Company", ["About","Blog","Careers","Wholesale"]],
  ];
  return (
    <footer className="cz-footer">
      <div className="cz-footer-inner">
        <div className="cz-footer-brand">
          <div className="cz-logo">
            <span className="cz-logo-mark"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" fill="var(--ink-900)"/></svg></span>
            <span className="cz-logo-word">Clickazo</span>
          </div>
          <p className="cz-muted" style={{maxWidth:260,marginTop:12}}>Gear for people who ship. Ships free over $50, 30-day returns, no nonsense.</p>
          <div className="cz-social">
            {["mail","send","rss"].map(n => <button key={n} className="cz-icon-btn" aria-label={n}><Icon name={n} size={18} /></button>)}
          </div>
        </div>
        {cols.map(([h, items]) => (
          <div className="cz-footer-col" key={h}>
            <div className="cz-footer-h">{h}</div>
            {items.map(i => <button key={i} className="cz-footer-link" onClick={() => onNav("home")}>{i}</button>)}
          </div>
        ))}
        <div className="cz-footer-col">
          <div className="cz-footer-h">Stay in the loop</div>
          <p className="cz-muted" style={{fontSize:13,margin:"0 0 10px"}}>New drops, no spam.</p>
          <div className="cz-news">
            <input placeholder="you@dev.null" />
            <Btn variant="primary" icon="arrow-right" />
          </div>
        </div>
      </div>
      <div className="cz-footer-base">
        <span className="cz-muted">© 2026 Clickazo. Built with good taste.</span>
        <span className="cz-muted">Terms · Privacy · Cookies</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, CartDrawer, Footer });
