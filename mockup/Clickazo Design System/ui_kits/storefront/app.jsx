// Clickazo storefront — app shell: routing, cart, theme.
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [theme, setTheme] = useStateA(() => localStorage.getItem("cz-theme") || "light");
  const [route, setRoute] = useStateA("home");      // home | listing | pdp | new | apparel | desk | sale
  const [activeProduct, setActiveProduct] = useStateA(null);
  const [cart, setCart] = useStateA([]);
  const [cartOpen, setCartOpen] = useStateA(false);
  const [query, setQuery] = useStateA("");
  const [listCat, setListCat] = useStateA("All");

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
    else if (r === "home") { setRoute("home"); }
    else setRoute(r);
    window.scrollTo({ top: 0 });
  };
  const openProduct = (p) => { setActiveProduct(p); setRoute("pdp"); window.scrollTo({ top: 0 }); };

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

  // search jumps to listing
  const onQuery = (v) => { setQuery(v); if (v && route !== "listing") { setListCat("All"); setRoute("listing"); } };

  // map nav route -> header active key
  const headerRoute =
    route === "home" ? "home" :
    route === "listing" && listCat === "Sale" ? "sale" :
    route === "listing" && listCat === "Apparel" ? "apparel" :
    route === "listing" && listCat === "Desk" ? "desk" :
    route === "listing" ? "new" : "";

  return (
    <>
      <Header cartCount={count} onCartOpen={() => setCartOpen(true)} theme={theme}
        onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
        route={headerRoute} onNav={go} query={query} onQuery={onQuery} />

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
