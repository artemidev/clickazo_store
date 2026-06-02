// Clickazo storefront — app shell: routing, cart, theme.
const { useState: useStateA, useEffect: useEffectA } = React;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakRadio } = window;

const CZ_TWEAK_DEFAULTS = {
  announce: "rotating",     // rotating | static | off
  megaMenu: true,
  searchStyle: "central",   // central | compact
  cartValue: true,
  freeShipNudge: true,
  saleAccent: true,
};

function App() {
  const [tw, setTweak] = useTweaks(CZ_TWEAK_DEFAULTS);
  const [theme, setTheme] = useStateA(() => {
    const saved = localStorage.getItem("cz-theme");
    if (saved) return saved;
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  });
  const [route, setRoute] = useStateA("home");      // home | listing | pdp | new | apparel | desk | sale | signin | signup
  const [activeProduct, setActiveProduct] = useStateA(null);
  const [cart, setCart] = useStateA([]);
  const [cartOpen, setCartOpen] = useStateA(false);
  const [query, setQuery] = useStateA("");
  const [listCat, setListCat] = useStateA("All");
  const [user, setUser] = useStateA(() => {
    try { return JSON.parse(localStorage.getItem("cz-user")) || null; } catch (e) { return null; }
  });
  const [prevRoute, setPrevRoute] = useStateA("home");

  useEffectA(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cz-theme", theme);
  }, [theme]);

  // route helpers
  const go = (r) => {
    if (r === "new") { setListCat("All"); setRoute("listing"); }
    else if (r === "apparel") { setListCat("Apparel"); setRoute("listing"); }
    else if (r === "desk") { setListCat("Desk"); setRoute("listing"); }
    else if (r === "sale") { setListCat("Sale"); setRoute("listing"); }
    else if (r === "listing") { setListCat("All"); setRoute("listing"); }
    else if (r === "home") { setRoute("home"); }
    else setRoute(r);
    window.scrollTo({ top: 0 });
  };
  const openProduct = (p) => { setActiveProduct(p); setRoute("pdp"); window.scrollTo({ top: 0 }); };

  // auth
  const goAuth = (r) => { setPrevRoute(route === "signin" || route === "signup" ? prevRoute : route); setRoute(r); window.scrollTo({ top: 0 }); };
  const onAuthed = (u) => { setUser(u); localStorage.setItem("cz-user", JSON.stringify(u)); setRoute(prevRoute || "home"); window.scrollTo({ top: 0 }); };
  const onSignOut = () => { setUser(null); localStorage.removeItem("cz-user"); };

  const addToCart = (p) => {
    setCart(c => {
      const ex = c.find(it => it.p.id === p.id);
      if (ex) return c.map(it => it.p.id === p.id ? { ...it, qty: it.qty + 1 } : it);
      return [...c, { p, qty: 1 }];
    });
  };
  const changeQty = (p, d) => setCart(c => c.map(it => it.p.id === p.id ? { ...it, qty: Math.max(1, it.qty + d) } : it));
  const removeItem = (p) => setCart(c => c.filter(it => it.p.id !== p.id));
  const count = cart.reduce((s, it) => s + it.qty, 0);
  const subtotal = cart.reduce((s, it) => s + (it.p.sale ?? it.p.price) * it.qty, 0);

  // search: the header dropdown shows instant results; "see all" navigates explicitly
  const onQuery = (v) => { setQuery(v); };

  // map nav route -> header active key
  const headerRoute =
    route === "home" ? "home" :
    route === "listing" && listCat === "Sale" ? "sale" :
    route === "listing" && listCat === "Apparel" ? "apparel" :
    route === "listing" && listCat === "Desk" ? "desk" :
    route === "listing" ? "new" : "";

  const isAuth = route === "signin" || route === "signup";

  if (isAuth) {
    return (
      <AuthPage mode={route} onMode={goAuth} onAuthed={onAuthed}
        onBack={() => { setRoute(prevRoute || "home"); window.scrollTo({ top: 0 }); }} />
    );
  }

  return (
    <>
      <Header cartCount={count} cartSubtotal={subtotal} onCartOpen={() => setCartOpen(true)} theme={theme}
        onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
        route={headerRoute} onNav={go} query={query} onQuery={onQuery}
        onOpen={openProduct} user={user} onAuth={goAuth} onSignOut={onSignOut} tweaks={tw} />

      <main className="cz-main">
        {route === "home" && <Home onOpen={openProduct} onAdd={addToCart} onNav={go} />}
        {route === "listing" && <Listing onOpen={openProduct} onAdd={addToCart} query={query} initialCat={listCat} key={listCat} />}
        {route === "pdp" && activeProduct && <ProductDetail p={activeProduct} onAdd={addToCart} onOpen={openProduct} onBack={() => go("home")} />}
      </main>

      <Footer onNav={go} />

      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)}
        onQty={changeQty} onRemove={removeItem} />

      {/* add-to-cart toast */}
      <Toast count={count} />

      <TweaksPanel>
        <TweakSection label="Conversion" />
        <TweakRadio label="Top bar" value={tw.announce}
          options={["rotating", "static", "off"]}
          onChange={v => setTweak("announce", v)} />
        <TweakToggle label="Mega-menu" value={tw.megaMenu} onChange={v => setTweak("megaMenu", v)} />
        <TweakToggle label="Cart subtotal" value={tw.cartValue} onChange={v => setTweak("cartValue", v)} />
        <TweakToggle label="Free-ship nudge" value={tw.freeShipNudge} onChange={v => setTweak("freeShipNudge", v)} />
        <TweakToggle label="Highlight Sale" value={tw.saleAccent} onChange={v => setTweak("saleAccent", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Search" value={tw.searchStyle}
          options={["central", "compact"]}
          onChange={v => setTweak("searchStyle", v)} />
      </TweaksPanel>
    </>
  );
}

function Toast({ count }) {
  const [show, setShow] = useStateA(false);
  const prev = React.useRef(count);
  useEffectA(() => {
    if (count > prev.current) { setShow(true); const t = setTimeout(() => setShow(false), 1800); return () => clearTimeout(t); }
    prev.current = count;
  }, [count]);
  useEffectA(() => { prev.current = count; });
  return (
    <div className={"cz-toast" + (show ? " is-show" : "")}>
      <span className="cz-toast-ic"><Icon name="check" size={16} /></span> Added to your bag
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
