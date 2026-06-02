// Clickazo storefront — auth screens: Sign in + Sign up.
const { useState: useStateAu, useRef: useRefAu } = React;

// ---- Provider glyphs (official-ish marks for the sign-in buttons) ----
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.46h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.73z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.27a12 12 0 0 0 0 10.74z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
    </svg>
  );
}
function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="currentColor">
      <path d="M17.05 12.54c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.78 1.3 10.33.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.93-.03-.01-2.7-1.04-2.73-4.12zM14.6 4.86c.71-.86 1.19-2.06 1.06-3.26-1.02.04-2.26.68-3 1.54-.66.76-1.24 1.98-1.08 3.15 1.14.09 2.31-.58 3.02-1.43z"/>
    </svg>
  );
}

function Field({ label, type, value, onChange, placeholder, error, autoComplete, children, hint }) {
  const [show, setShow] = useStateAu(false);
  const isPw = type === "password";
  return (
    <label className="cz-field">
      <span className="cz-field-row">
        <span className="cz-field-label">{label}</span>
        {hint}
      </span>
      <span className={"cz-input" + (error ? " has-error" : "")}>
        <input
          type={isPw && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {isPw && (
          <button type="button" className="cz-input-eye" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"} tabIndex={-1}>
            <Icon name={show ? "eye-off" : "eye"} size={17} />
          </button>
        )}
        {children}
      </span>
      {error && <span className="cz-field-err"><Icon name="alert-circle" size={13} />{error}</span>}
    </label>
  );
}

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function AuthPage({ mode, onMode, onAuthed, onBack }) {
  const isSignup = mode === "signup";
  const [name, setName] = useStateAu("");
  const [email, setEmail] = useStateAu("");
  const [pw, setPw] = useStateAu("");
  const [remember, setRemember] = useStateAu(true);
  const [agree, setAgree] = useStateAu(false);
  const [errs, setErrs] = useStateAu({});
  const [busy, setBusy] = useStateAu(null); // 'email' | 'google' | 'apple'

  const validate = () => {
    const e = {};
    if (isSignup && name.trim().length < 2) e.name = "Tell us what to call you.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "That doesn't look like an email.";
    if (pw.length < 8) e.pw = "At least 8 characters.";
    if (isSignup && !agree) e.agree = "Please accept the terms to continue.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const finish = (provider) => {
    const display = isSignup ? name.trim() : (email.split("@")[0] || "Dev");
    onAuthed({
      name: display.charAt(0).toUpperCase() + display.slice(1),
      email: email || (provider === "google" ? "you@gmail.com" : provider === "apple" ? "you@icloud.com" : "you@dev.null"),
      provider,
    });
  };

  const submitEmail = (ev) => {
    ev.preventDefault();
    if (busy) return;
    if (!validate()) return;
    setBusy("email");
    setTimeout(() => finish("email"), 850);
  };
  const social = (provider) => {
    if (busy) return;
    setBusy(provider);
    setTimeout(() => finish(provider), 950);
  };

  const strength = isSignup ? pwStrength(pw) : 0;
  const strengthLabel = ["Too short", "Weak", "Okay", "Good", "Strong"][strength];

  return (
    <div className="cz-auth">
      <div className="cz-auth-dots" aria-hidden="true"></div>
      <div className="cz-auth-card">
        <button className="cz-auth-back" onClick={onBack}><Icon name="arrow-left" size={16} />Back to store</button>

        <div className="cz-auth-brand">
          <span className="cz-logo-mark" style={{ width: 44, height: 44, borderRadius: 12, flex: "0 0 44px" }}>
            <svg viewBox="0 0 24 24" width="26" height="26"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" fill="var(--ink-900)"/></svg>
          </span>
        </div>

        <h1 className="cz-auth-title">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="cz-auth-sub">
          {isSignup
            ? "Join Clickazo for faster checkout, order tracking, and first dibs on new drops."
            : "Sign in to pick up where you left off."}
        </p>

        <div className="cz-social-col">
          <button className="cz-social-btn" onClick={() => social("google")} disabled={!!busy}>
            {busy === "google" ? <span className="cz-spin"></span> : <GoogleGlyph />}
            <span>Continue with Google</span>
          </button>
          <button className="cz-social-btn dark" onClick={() => social("apple")} disabled={!!busy}>
            {busy === "apple" ? <span className="cz-spin light"></span> : <AppleGlyph />}
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="cz-auth-or"><span>or {isSignup ? "sign up" : "sign in"} with email</span></div>

        <form className="cz-auth-form" onSubmit={submitEmail} noValidate>
          {isSignup && (
            <Field label="Name" type="text" value={name} onChange={setName}
              placeholder="Ada Lovelace" autoComplete="name" error={errs.name} />
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail}
            placeholder="you@dev.null" autoComplete="email" error={errs.email} />
          <Field label="Password" type="password" value={pw} onChange={setPw}
            placeholder={isSignup ? "8+ characters" : "Your password"}
            autoComplete={isSignup ? "new-password" : "current-password"} error={errs.pw}
            hint={!isSignup && <button type="button" className="cz-field-link" onClick={e => e.preventDefault()}>Forgot?</button>} />

          {isSignup && pw.length > 0 && (
            <div className="cz-pw-meter" data-level={strength}>
              <div className="cz-pw-bars">
                {[0,1,2,3].map(i => <span key={i} className={i < strength ? "on" : ""}></span>)}
              </div>
              <span className="cz-pw-label">{strengthLabel}</span>
            </div>
          )}

          {!isSignup && (
            <label className="cz-check">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span className="cz-check-box"><Icon name="check" size={13} /></span>
              <span>Keep me signed in</span>
            </label>
          )}
          {isSignup && (
            <label className={"cz-check" + (errs.agree ? " has-error" : "")}>
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span className="cz-check-box"><Icon name="check" size={13} /></span>
              <span>I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms</a> and <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.</span>
            </label>
          )}

          <button className="cz-btn cz-btn-primary cz-btn-lg cz-btn-full cz-auth-submit" type="submit" disabled={busy === "email"}>
            {busy === "email" ? <span className="cz-spin"></span> : null}
            {busy === "email" ? (isSignup ? "Creating account…" : "Signing in…") : (isSignup ? "Create account" : "Sign in")}
          </button>
        </form>

        <p className="cz-auth-switch">
          {isSignup
            ? <>Already have an account? <button onClick={() => onMode("signin")}>Sign in</button></>
            : <>New to Clickazo? <button onClick={() => onMode("signup")}>Create an account</button></>}
        </p>
      </div>

      <p className="cz-auth-trust"><Icon name="shield-check" size={14} /> Secured with industry-standard encryption. We never sell your data.</p>
    </div>
  );
}

Object.assign(window, { AuthPage });
