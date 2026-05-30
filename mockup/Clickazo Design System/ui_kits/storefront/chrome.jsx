// Clickazo storefront — chrome: header, cart drawer, footer.
const { useState: useStateC } = React;

function Header({ cartCount, onCartOpen, theme, onToggleTheme, route, onNav, query, onQuery }) {
  const links = [["home","Shop"],["new","New drops"],["apparel","Apparel"],["desk","Desk"],["sale","Sale"]];
  return (
    <header className="cz-header">
      <div className="cz-header-inner">
        <button className="cz-logo" onClick={() => onNav("home")} aria-label="Clickazo home">
          <span className="cz-logo-mark">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" fill="var(--ink-900)"/></svg>
          </span>
          <span className="cz-logo-word">Clickazo</span>
        </button>
        <nav className="cz-nav">
          {links.map(([k,l]) => (
            <button key={k} className={"cz-nav-link" + (route === k ? " is-active" : "")} onClick={() => onNav(k)}>{l}</button>
          ))}
        </nav>
        <div className="cz-header-actions">
          <div className="cz-search">
            <Icon name="search" size={17} />
            <input value={query} onChange={e => onQuery(e.target.value)} placeholder="Search the store…" />
          </div>
          <button className="cz-icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
          </button>
          <button className="cz-icon-btn" aria-label="Account"><Icon name="user" size={20} /></button>
          <button className="cz-cart-btn" onClick={onCartOpen} aria-label="Open cart">
            <Icon name="shopping-bag" size={20} />
            {cartCount > 0 && <span className="cz-cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
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
