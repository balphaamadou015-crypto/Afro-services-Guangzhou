import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Plus, Minus, MapPin, Lock, Settings, ChevronLeft, Search,
  CheckCircle2, XCircle, Trash2, Edit3, X, Save, ClipboardList, Loader2, Globe2,
  Bike, Package, UtensilsCrossed, ArrowRight, Phone
} from "lucide-react";
import { getVal, setVal } from "./storage";

const NAVY = "#1B2A4A";
const RUST = "#B8493A";
const GOLD = "#D4A548";
const GREEN = "#2D5F4C";
const TEAL = "#1E6E8C";
const CREAM = "#F7F3EA";
const PAPER = "#FBF8F1";
const LINE = "#E4DCC9";
const INK = "#232323";
const MUTE = "#8A8172";

const ADMIN_PIN = "2027"; // code simple de démo — à remplacer par une vraie authentification en production

const DEFAULT_ZONES = [
  { id: "gn", name: "Guinée", flag: "🇬🇳", color: RUST },
  { id: "sn", name: "Sénégal", flag: "🇸🇳", color: GREEN },
  { id: "ng", name: "Nigéria", flag: "🇳🇬", color: GOLD },
  { id: "tz", name: "Tanzanie", flag: "🇹🇿", color: TEAL },
];

const CATALOG_KEY = "afd_catalog_v1";
const ORDERS_KEY = "afd_orders_v1";
const TRANSPORT_KEY = "afd_transport_v1";
const COURSE_KEY = "afd_course_v1";

function fontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      button { font-family: inherit; cursor: pointer; }
      input, textarea { font-family: inherit; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-thumb { background: ${LINE}; border-radius: 8px; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState({ zones: DEFAULT_ZONES, dishes: [] });
  const [orders, setOrders] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);

  // view: home | food-home | zone | cart | confirm | transport | course | request-confirm | admin-login | admin
  const [view, setView] = useState("home");
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [cart, setCart] = useState({});
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastRequestType, setLastRequestType] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await getVal(CATALOG_KEY);
        if (c) setCatalog(JSON.parse(c));
      } catch (e) { console.error("Erreur de chargement du catalogue", e); }
      try {
        const o = await getVal(ORDERS_KEY);
        if (o) setOrders(JSON.parse(o));
      } catch (e) { console.error("Erreur de chargement des commandes", e); }
      try {
        const t = await getVal(TRANSPORT_KEY);
        if (t) setTransportRequests(JSON.parse(t));
      } catch (e) { console.error("Erreur de chargement des transports", e); }
      try {
        const cr = await getVal(COURSE_KEY);
        if (cr) setCourseRequests(JSON.parse(cr));
      } catch (e) { console.error("Erreur de chargement des courses", e); }
      setLoading(false);
    })();
  }, []);

  const persistCatalog = useCallback(async (next) => {
    setCatalog(next);
    setSaving(true);
    try { await setVal(CATALOG_KEY, JSON.stringify(next)); } catch (e) { console.error(e); }
    setSaving(false);
  }, []);

  const persistOrders = useCallback(async (next) => {
    setOrders(next);
    try { await setVal(ORDERS_KEY, JSON.stringify(next)); } catch (e) { console.error(e); }
  }, []);

  const persistTransport = useCallback(async (next) => {
    setTransportRequests(next);
    try { await setVal(TRANSPORT_KEY, JSON.stringify(next)); } catch (e) { console.error(e); }
  }, []);

  const persistCourse = useCallback(async (next) => {
    setCourseRequests(next);
    try { await setVal(COURSE_KEY, JSON.stringify(next)); } catch (e) { console.error(e); }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM, fontFamily: "'Manrope', sans-serif" }}>
        {fontImport()}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: NAVY }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Chargement…</span>
        </div>
      </div>
    );
  }

  const pendingCount =
    orders.filter((o) => o.status !== "livree").length +
    transportRequests.filter((r) => r.status !== "terminee").length +
    courseRequests.filter((r) => r.status !== "terminee").length;

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Manrope', sans-serif", color: INK }}>
      {fontImport()}
      <TopBar view={view} setView={setView} cartCount={Object.values(cart).reduce((a, b) => a + b, 0)} adminAuthed={adminAuthed} />

      {view === "home" && (
        <ServicesHome
          onFood={() => setView("food-home")}
          onTransport={() => setView("transport")}
          onCourse={() => setView("course")}
        />
      )}

      {view === "food-home" && (
        <HomeScreen
          zones={catalog.zones}
          dishes={catalog.dishes}
          onBack={() => setView("home")}
          onSelectZone={(z) => { setSelectedZoneId(z.id); setView("zone"); }}
        />
      )}

      {view === "zone" && (
        <ZoneScreen
          zone={catalog.zones.find((z) => z.id === selectedZoneId)}
          dishes={catalog.dishes.filter((d) => d.zoneId === selectedZoneId)}
          cart={cart}
          setCart={setCart}
          onBack={() => setView("food-home")}
          onGoCart={() => setView("cart")}
        />
      )}

      {view === "cart" && (
        <CartScreen
          catalog={catalog}
          cart={cart}
          setCart={setCart}
          onBack={() => setView(selectedZoneId ? "zone" : "food-home")}
          onConfirm={async (customer) => {
            const items = Object.entries(cart).map(([dishId, qty]) => {
              const dish = catalog.dishes.find((d) => d.id === dishId);
              return { dishId, name: dish?.name, price: dish?.price, qty, zone: catalog.zones.find(z => z.id === dish?.zoneId)?.name };
            });
            const total = items.reduce((s, i) => s + i.price * i.qty, 0);
            const order = {
              id: "CMD-" + Date.now().toString().slice(-6),
              customer, items, total, status: "nouvelle", createdAt: new Date().toISOString(),
            };
            await persistOrders([order, ...orders]);
            setCart({});
            setView("confirm");
          }}
        />
      )}

      {view === "confirm" && <ConfirmScreen onHome={() => { setSelectedZoneId(null); setView("home"); }} text="Nous te contactons très vite par téléphone ou WeChat pour confirmer ta livraison." />}

      {view === "transport" && (
        <TransportScreen
          onBack={() => setView("home")}
          onSubmit={async (data) => {
            const req = { id: "TR-" + Date.now().toString().slice(-6), ...data, status: "nouvelle", createdAt: new Date().toISOString() };
            await persistTransport([req, ...transportRequests]);
            setLastRequestType("transport");
            setView("request-confirm");
          }}
        />
      )}

      {view === "course" && (
        <CourseScreen
          onBack={() => setView("home")}
          onSubmit={async (data) => {
            const req = { id: "CO-" + Date.now().toString().slice(-6), ...data, status: "nouvelle", createdAt: new Date().toISOString() };
            await persistCourse([req, ...courseRequests]);
            setLastRequestType("course");
            setView("request-confirm");
          }}
        />
      )}

      {view === "request-confirm" && (
        <ConfirmScreen
          onHome={() => setView("home")}
          text={lastRequestType === "transport"
            ? "Ta demande de transport a bien été reçue. Notre équipe t'appelle très vite pour organiser la course."
            : "Ta demande de course/commission a bien été reçue. Nous te contactons très vite pour les détails."}
        />
      )}

      {view === "admin-login" && <AdminLogin onSuccess={() => { setAdminAuthed(true); setView("admin"); }} onBack={() => setView("home")} />}

      {view === "admin" && adminAuthed && (
        <AdminPanel
          catalog={catalog} persistCatalog={persistCatalog}
          orders={orders} persistOrders={persistOrders}
          transportRequests={transportRequests} persistTransport={persistTransport}
          courseRequests={courseRequests} persistCourse={persistCourse}
          saving={saving}
          onExit={() => { setAdminAuthed(false); setView("home"); }}
        />
      )}
    </div>
  );
}

// ================= TOP BAR =================
function TopBar({ view, setView, cartCount, adminAuthed }) {
  return (
    <div style={{ background: NAVY, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
      <button onClick={() => setView("home")} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, color: CREAM }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: RUST, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShoppingBag size={16} color="#fff" />
        </div>
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18 }}>Afro Services Guangzhou</span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {view === "zone" && cartCount > 0 && (
          <button onClick={() => setView("cart")} style={{ display: "flex", alignItems: "center", gap: 6, background: RUST, color: "#fff", border: "none", borderRadius: 999, padding: "8px 14px", fontWeight: 700, fontSize: 13 }}>
            <ShoppingBag size={14} /> {cartCount}
          </button>
        )}
        <button
          onClick={() => setView(adminAuthed ? "admin" : "admin-login")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", color: CREAM, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "8px 13px", fontWeight: 600, fontSize: 12.5 }}
        >
          <Settings size={13} /> Gestion
        </button>
      </div>
    </div>
  );
}

// ================= SERVICES HOME (nouvel accueil) =================
function ServicesHome({ onFood, onTransport, onCourse }) {
  const services = [
    { id: "food", title: "Commander un repas", desc: "Plats et sauces par pays : Guinée, Sénégal, Nigéria, Tanzanie...", icon: UtensilsCrossed, color: RUST, onClick: onFood },
    { id: "transport", title: "Demander un transport", desc: "Un trajet en moto d'un point à un autre à Guangzhou (ex : Xiaobei ↔ Meibo).", icon: Bike, color: GREEN, onClick: onTransport },
    { id: "course", title: "Confier une course / commission", desc: "Récupérer un colis, faire une démarche, transporter une marchandise...", icon: Package, color: GOLD, onClick: onCourse },
  ];
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: RUST, fontWeight: 700, fontSize: 12.5, letterSpacing: 0.5, marginBottom: 10 }}>
          <Globe2 size={14} /> AU SERVICE DE LA COMMUNAUTÉ AFRICAINE À GUANGZHOU
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 36, color: NAVY, margin: "0 0 10px" }}>
          De quoi as-tu besoin aujourd'hui ?
        </h1>
        <p style={{ color: MUTE, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
          Repas, transport en moto ou petites courses : dis-nous ce qu'il te faut, notre équipe s'en occupe.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={s.onClick}
              style={{ textAlign: "left", border: `1.5px solid ${LINE}`, borderRadius: 20, background: PAPER, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `${s.color}1F`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: NAVY, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: s.color, fontWeight: 700, fontSize: 12.5, marginTop: "auto" }}>
                Continuer <ArrowRight size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ================= FOOD HOME (choix du pays) =================
function HomeScreen({ zones, dishes, onSelectZone, onBack }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTE, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <ChevronLeft size={16} /> Retour aux services
      </button>
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 32, color: NAVY, margin: "0 0 8px" }}>Quelle cuisine te fait envie ?</h1>
        <p style={{ color: MUTE, fontSize: 14 }}>Choisis ton pays pour voir les plats disponibles en ce moment.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
        {zones.map((z) => {
          const zoneDishes = dishes.filter((d) => d.zoneId === z.id);
          const availableCount = zoneDishes.filter((d) => d.available).length;
          return (
            <button key={z.id} onClick={() => onSelectZone(z)} style={{ textAlign: "left", border: `1.5px solid ${LINE}`, borderRadius: 20, background: PAPER, padding: 0, overflow: "hidden" }}>
              <div style={{ height: 90, background: `linear-gradient(120deg, ${z.color}, ${z.color}CC)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{z.flag}</div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 19, color: NAVY, marginBottom: 4 }}>{z.name}</div>
                <div style={{ fontSize: 12.5, color: MUTE }}>
                  {availableCount > 0 ? `${availableCount} plat${availableCount > 1 ? "s" : ""} disponible${availableCount > 1 ? "s" : ""}` : "Aucun plat disponible pour le moment"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ================= ZONE (liste des plats) =================
function ZoneScreen({ zone, dishes, cart, setCart, onBack }) {
  if (!zone) return null;
  const addToCart = (id, delta) => {
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  };
  const available = dishes.filter((d) => d.available);
  const unavailable = dishes.filter((d) => !d.available);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 100px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTE, fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 }}>
        <ChevronLeft size={16} /> Retour aux pays
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, background: `linear-gradient(120deg, ${zone.color}, ${zone.color}CC)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{zone.flag}</div>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 26, color: NAVY, margin: 0 }}>Cuisine {zone.name}</h2>
          <span style={{ fontSize: 12.5, color: MUTE }}>{available.length} plat{available.length !== 1 ? "s" : ""} disponible{available.length !== 1 ? "s" : ""} maintenant</span>
        </div>
      </div>

      {dishes.length === 0 && <EmptyState text="Aucun plat n'a encore été ajouté pour cette cuisine. Reviens bientôt !" />}

      {available.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: unavailable.length ? 26 : 0 }}>
          {available.map((d) => <DishCard key={d.id} dish={d} color={zone.color} qty={cart[d.id] || 0} onAdd={(delta) => addToCart(d.id, delta)} />)}
        </div>
      )}
      {unavailable.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: MUTE, letterSpacing: 0.4, marginBottom: 10 }}>ACTUELLEMENT INDISPONIBLE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: 0.55 }}>
            {unavailable.map((d) => <DishCard key={d.id} dish={d} color={zone.color} qty={0} onAdd={() => {}} disabled />)}
          </div>
        </div>
      )}
    </div>
  );
}

function DishCard({ dish, color, qty, onAdd, disabled }) {
  return (
    <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 16, padding: 14, background: PAPER, display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: NAVY }}>{dish.name}</span>
          {!disabled && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 800, color: GREEN }}><CheckCircle2 size={11} /> DISPONIBLE</span>}
          {disabled && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 800, color: MUTE }}><XCircle size={11} /> INDISPONIBLE</span>}
        </div>
        {dish.desc && <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 7, lineHeight: 1.4 }}>{dish.desc}</div>}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color }}>¥{dish.price}</div>
      </div>
      {!disabled && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {qty > 0 && (
            <>
              <button onClick={() => onAdd(-1)} style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${color}`, background: "transparent", color, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
              <span style={{ fontWeight: 700, fontSize: 14, width: 16, textAlign: "center" }}>{qty}</span>
            </>
          )}
          <button onClick={() => onAdd(1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: MUTE, fontSize: 13.5, border: `1.5px dashed ${LINE}`, borderRadius: 16 }}>{text}</div>;
}

// ================= CART =================
function CartScreen({ catalog, cart, setCart, onBack, onConfirm }) {
  const items = Object.entries(cart).map(([dishId, qty]) => ({ dish: catalog.dishes.find((d) => d.id === dishId), qty })).filter((i) => i.dish);
  const total = items.reduce((s, i) => s + i.dish.price * i.qty, 0);
  const deliveryFee = items.length ? 6 : 0;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const addToCart = (id, delta) => {
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  };
  const canOrder = items.length > 0 && name.trim() && phone.trim() && address.trim();

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 60px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTE, fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 }}><ChevronLeft size={16} /> Retour</button>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 18px" }}>Ton panier</h2>
      {items.length === 0 ? <EmptyState text="Ton panier est vide." /> : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {items.map(({ dish, qty }) => (
              <div key={dish.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${LINE}`, paddingBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>{dish.name}</div>
                  <div style={{ fontSize: 11.5, color: MUTE }}>¥{dish.price} × {qty}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => addToCart(dish.id, -1)} style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${NAVY}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{qty}</span>
                  <button onClick={() => addToCart(dish.id, 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={11} /></button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: PAPER, border: `1.5px solid ${LINE}`, borderRadius: 16, padding: 14, marginBottom: 20 }}>
            <Row label="Sous-total" value={`¥${total}`} />
            <Row label="Livraison" value={`¥${deliveryFee}`} />
            <div style={{ borderTop: `1px dashed ${LINE}`, margin: "8px 0" }} />
            <Row label="Total" value={`¥${total + deliveryFee}`} bold />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            <Field label="Nom complet" value={name} onChange={setName} placeholder="Ex : Awa Diallo" />
            <Field label="Téléphone / WeChat" value={phone} onChange={setPhone} placeholder="Ex : 138 xxxx xxxx" />
            <Field label="Adresse de livraison" value={address} onChange={setAddress} placeholder="Quartier, rue, bâtiment, repère" textarea />
          </div>
          <button onClick={() => canOrder && onConfirm({ name, phone, address })} disabled={!canOrder} style={{ width: "100%", background: RUST, color: "#fff", border: "none", borderRadius: 16, padding: 15, fontWeight: 800, fontSize: 14.5, opacity: canOrder ? 1 : 0.5 }}>
            Confirmer la commande · ¥{total + deliveryFee}
          </button>
        </>
      )}
    </div>
  );
}

// ================= TRANSPORT =================
function TransportScreen({ onBack, onSubmit }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [when, setWhen] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const canSend = from.trim() && to.trim() && name.trim() && phone.trim();

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px 60px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTE, fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 }}><ChevronLeft size={16} /> Retour aux services</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${GREEN}1F`, display: "flex", alignItems: "center", justifyContent: "center" }}><Bike size={22} color={GREEN} /></div>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: NAVY, margin: 0 }}>Demander un transport</h2>
          <span style={{ fontSize: 12.5, color: MUTE }}>Un membre de l'équipe vient te chercher en moto</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Départ" value={from} onChange={setFrom} placeholder="Ex : Xiaobei (小北)" />
        <Field label="Destination" value={to} onChange={setTo} placeholder="Ex : Meibo (美博城)" />
        <Field label="Quand ?" value={when} onChange={setWhen} placeholder="Ex : Maintenant, ou aujourd'hui 15h" />
        <Field label="Ton nom" value={name} onChange={setName} placeholder="Ex : Moussa Bah" />
        <Field label="Téléphone / WeChat" value={phone} onChange={setPhone} placeholder="Ex : 138 xxxx xxxx" />
        <Field label="Note (optionnel)" value={notes} onChange={setNotes} placeholder="Nombre de personnes, bagages..." textarea />
      </div>

      <div style={{ background: PAPER, border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 13, margin: "16px 0", fontSize: 12.5, color: MUTE, display: "flex", gap: 8 }}>
        <Phone size={15} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} />
        Après ta demande, notre équipe t'appelle pour confirmer le prix de la course et l'heure exacte.
      </div>

      <button onClick={() => canSend && onSubmit({ from, to, when, name, phone, notes })} disabled={!canSend} style={{ width: "100%", background: GREEN, color: "#fff", border: "none", borderRadius: 16, padding: 15, fontWeight: 800, fontSize: 14.5, opacity: canSend ? 1 : 0.5 }}>
        Envoyer la demande
      </button>
    </div>
  );
}

// ================= COURSE / COMMISSION =================
function CourseScreen({ onBack, onSubmit }) {
  const [desc, setDesc] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const canSend = desc.trim() && pickup.trim() && name.trim() && phone.trim();

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px 60px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTE, fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 }}><ChevronLeft size={16} /> Retour aux services</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${GOLD}25`, display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={22} color={GOLD} /></div>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: NAVY, margin: 0 }}>Confier une course</h2>
          <span style={{ fontSize: 12.5, color: MUTE }}>Récupérer un colis, faire une démarche, transporter une marchandise...</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Que veux-tu qu'on fasse ?" value={desc} onChange={setDesc} placeholder="Ex : récupérer un colis chez un fournisseur et me le livrer" textarea />
        <Field label="Lieu de récupération" value={pickup} onChange={setPickup} placeholder="Ex : marché Sanyuanli" />
        <Field label="Lieu de livraison (optionnel)" value={dropoff} onChange={setDropoff} placeholder="Ex : Xiaobei, résidence..." />
        <Field label="Ton nom" value={name} onChange={setName} placeholder="Ex : Fanta Camara" />
        <Field label="Téléphone / WeChat" value={phone} onChange={setPhone} placeholder="Ex : 138 xxxx xxxx" />
      </div>

      <div style={{ background: PAPER, border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 13, margin: "16px 0", fontSize: 12.5, color: MUTE, display: "flex", gap: 8 }}>
        <Phone size={15} color={GOLD} style={{ flexShrink: 0, marginTop: 1 }} />
        Nous te recontactons pour convenir du prix de la course selon la distance et la marchandise.
      </div>

      <button onClick={() => canSend && onSubmit({ desc, pickup, dropoff, name, phone })} disabled={!canSend} style={{ width: "100%", background: GOLD, color: "#fff", border: "none", borderRadius: 16, padding: 15, fontWeight: 800, fontSize: 14.5, opacity: canSend ? 1 : 0.5 }}>
        Envoyer la demande
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, marginBottom: 5, letterSpacing: 0.3 }}>{label.toUpperCase()}</div>
      <Tag value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={textarea ? 2 : undefined} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${LINE}`, background: "#FFFDF9", fontSize: 13.5, color: NAVY, outline: "none", resize: "none" }} />
    </label>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 500, color: NAVY, padding: "3px 0", fontFamily: bold ? "'JetBrains Mono', monospace" : "inherit" }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function ConfirmScreen({ onHome, text }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}><CheckCircle2 size={32} color="#fff" /></div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>Demande envoyée !</h2>
      <p style={{ color: MUTE, fontSize: 14, marginBottom: 24 }}>{text}</p>
      <button onClick={onHome} style={{ background: NAVY, color: CREAM, border: "none", borderRadius: 14, padding: "13px 24px", fontWeight: 700, fontSize: 13.5 }}>Retour à l'accueil</button>
    </div>
  );
}

// ================= ADMIN LOGIN =================
function AdminLogin({ onSuccess, onBack }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Lock size={24} color={CREAM} /></div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>Espace de gestion</h2>
      <p style={{ color: MUTE, fontSize: 13, marginBottom: 20 }}>Entre le code d'accès pour gérer les plats, transports, courses et commandes.</p>
      <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setError(false); }} placeholder="Code d'accès" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${error ? RUST : LINE}`, textAlign: "center", fontSize: 16, letterSpacing: 4, marginBottom: 12, outline: "none" }} />
      {error && <div style={{ color: RUST, fontSize: 12, marginBottom: 12 }}>Code incorrect, réessaie.</div>}
      <button onClick={() => (pin === ADMIN_PIN ? onSuccess() : setError(true))} style={{ width: "100%", background: NAVY, color: CREAM, border: "none", borderRadius: 12, padding: 13, fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Entrer</button>
      <button onClick={onBack} style={{ background: "none", border: "none", color: MUTE, fontSize: 12.5 }}>Annuler</button>
      <p style={{ fontSize: 11, color: MUTE, marginTop: 24 }}>Code de démo : {ADMIN_PIN} — à remplacer par une vraie authentification avant mise en ligne publique.</p>
    </div>
  );
}

// ================= ADMIN PANEL =================
function AdminPanel({ catalog, persistCatalog, orders, persistOrders, transportRequests, persistTransport, courseRequests, persistCourse, saving, onExit }) {
  const [tab, setTab] = useState("plats"); // plats | commandes | transports | courses
  const [editingDish, setEditingDish] = useState(null);
  const [zoneFilter, setZoneFilter] = useState("all");

  const toggleAvailable = (dishId) => persistCatalog({ ...catalog, dishes: catalog.dishes.map((d) => d.id === dishId ? { ...d, available: !d.available } : d) });
  const deleteDish = (dishId) => persistCatalog({ ...catalog, dishes: catalog.dishes.filter((d) => d.id !== dishId) });
  const saveDish = (dish) => {
    const next = dish.id
      ? { ...catalog, dishes: catalog.dishes.map((d) => d.id === dish.id ? dish : d) }
      : { ...catalog, dishes: [...catalog.dishes, { ...dish, id: "d" + Date.now() }] };
    persistCatalog(next);
    setEditingDish(null);
  };
  const setOrderStatus = (orderId, status) => persistOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o));
  const setTransportStatus = (id, status) => persistTransport(transportRequests.map((r) => r.id === id ? { ...r, status } : r));
  const setCourseStatus = (id, status) => persistCourse(courseRequests.map((r) => r.id === id ? { ...r, status } : r));

  const visibleDishes = zoneFilter === "all" ? catalog.dishes : catalog.dishes.filter((d) => d.zoneId === zoneFilter);

  const tabs = [
    ["plats", "Plats & disponibilité"],
    ["commandes", `Commandes repas (${orders.filter(o => o.status !== "livree").length})`],
    ["transports", `Transports (${transportRequests.filter(r => r.status !== "terminee").length})`],
    ["courses", `Courses (${courseRequests.filter(r => r.status !== "terminee").length})`],
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: RUST, letterSpacing: 0.4 }}>ESPACE DE GESTION</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: NAVY, margin: 0 }}>Bienvenue Alpha</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saving && <span style={{ fontSize: 11.5, color: MUTE, display: "flex", alignItems: "center", gap: 4 }}><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> sauvegarde…</span>}
          <button onClick={onExit} style={{ background: "none", border: `1.5px solid ${LINE}`, borderRadius: 999, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, color: MUTE }}>Quitter</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "9px 16px", borderRadius: 999, border: "none", background: tab === id ? NAVY : PAPER, color: tab === id ? CREAM : MUTE, fontWeight: 700, fontSize: 13 }}>{label}</button>
        ))}
      </div>

      {tab === "plats" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <ZoneChip label="Toutes" active={zoneFilter === "all"} onClick={() => setZoneFilter("all")} color={NAVY} />
              {catalog.zones.map((z) => <ZoneChip key={z.id} label={`${z.flag} ${z.name}`} active={zoneFilter === z.id} onClick={() => setZoneFilter(z.id)} color={z.color} />)}
            </div>
            <button onClick={() => setEditingDish("new")} style={{ display: "flex", alignItems: "center", gap: 6, background: RUST, color: "#fff", border: "none", borderRadius: 12, padding: "9px 15px", fontWeight: 700, fontSize: 12.5 }}><Plus size={14} /> Ajouter un plat</button>
          </div>
          {visibleDishes.length === 0 && <EmptyState text="Aucun plat ici pour l'instant. Clique sur « Ajouter un plat » pour commencer." />}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleDishes.map((d) => {
              const zone = catalog.zones.find((z) => z.id === d.zoneId);
              return (
                <div key={d.id} style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 13, background: PAPER, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${zone?.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{zone?.flag}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: MUTE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.desc || "—"} · ¥{d.price}</div>
                  </div>
                  <button onClick={() => toggleAvailable(d.id)} style={{ display: "flex", alignItems: "center", gap: 5, border: "none", borderRadius: 999, padding: "7px 12px", fontSize: 11.5, fontWeight: 800, background: d.available ? GREEN + "22" : MUTE + "22", color: d.available ? GREEN : MUTE, flexShrink: 0 }}>
                    {d.available ? <CheckCircle2 size={13} /> : <XCircle size={13} />}{d.available ? "DISPONIBLE" : "INDISPONIBLE"}
                  </button>
                  <button onClick={() => setEditingDish(d)} style={{ background: "none", border: "none", color: MUTE, padding: 5 }}><Edit3 size={15} /></button>
                  <button onClick={() => deleteDish(d.id)} style={{ background: "none", border: "none", color: RUST, padding: 5 }}><Trash2 size={15} /></button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "commandes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.length === 0 && <EmptyState text="Aucune commande reçue pour le moment." />}
          {orders.map((o) => (
            <div key={o.id} style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 14, background: PAPER }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: MUTE }}>{o.id} · {new Date(o.createdAt).toLocaleString("fr-FR")}</div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: NAVY }}>{o.customer?.name}</div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 15, color: NAVY }}>¥{o.total + 6}</span>
              </div>
              <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 4 }}>📞 {o.customer?.phone} · 📍 {o.customer?.address}</div>
              <div style={{ fontSize: 12.5, color: INK, marginBottom: 10 }}>{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["nouvelle", "en_cuisine", "en_route", "livree"].map((s) => (
                  <button key={s} onClick={() => setOrderStatus(o.id, s)} style={{ padding: "6px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: o.status === s ? NAVY : "#FFFFFF", color: o.status === s ? CREAM : MUTE, border: `1.5px solid ${o.status === s ? NAVY : LINE}` }}>
                    {{ nouvelle: "Nouvelle", en_cuisine: "En cuisine", en_route: "En route", livree: "Livrée" }[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "transports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transportRequests.length === 0 && <EmptyState text="Aucune demande de transport pour le moment." />}
          {transportRequests.map((r) => (
            <div key={r.id} style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 14, background: PAPER }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: MUTE }}>{r.id} · {new Date(r.createdAt).toLocaleString("fr-FR")}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: NAVY, marginBottom: 4 }}>{r.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: INK, marginBottom: 4 }}>
                <MapPin size={13} color={GREEN} /> {r.from} <ArrowRight size={12} color={MUTE} /> {r.to}
              </div>
              <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 4 }}>🕐 {r.when || "Non précisé"} · 📞 {r.phone}</div>
              {r.notes && <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 8, fontStyle: "italic" }}>« {r.notes} »</div>}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {["nouvelle", "en_cours", "terminee"].map((s) => (
                  <button key={s} onClick={() => setTransportStatus(r.id, s)} style={{ padding: "6px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: r.status === s ? GREEN : "#FFFFFF", color: r.status === s ? "#fff" : MUTE, border: `1.5px solid ${r.status === s ? GREEN : LINE}` }}>
                    {{ nouvelle: "Nouvelle", en_cours: "En cours", terminee: "Terminée" }[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "courses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {courseRequests.length === 0 && <EmptyState text="Aucune demande de course pour le moment." />}
          {courseRequests.map((r) => (
            <div key={r.id} style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 14, background: PAPER }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: MUTE, marginBottom: 6 }}>{r.id} · {new Date(r.createdAt).toLocaleString("fr-FR")}</div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: NAVY, marginBottom: 4 }}>{r.name}</div>
              <div style={{ fontSize: 13, color: INK, marginBottom: 4 }}>{r.desc}</div>
              <div style={{ fontSize: 12.5, color: MUTE, marginBottom: 8 }}>
                📍 Récupération : {r.pickup}{r.dropoff ? ` → Livraison : ${r.dropoff}` : ""} · 📞 {r.phone}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["nouvelle", "en_cours", "terminee"].map((s) => (
                  <button key={s} onClick={() => setCourseStatus(r.id, s)} style={{ padding: "6px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: r.status === s ? GOLD : "#FFFFFF", color: r.status === s ? "#fff" : MUTE, border: `1.5px solid ${r.status === s ? GOLD : LINE}` }}>
                    {{ nouvelle: "Nouvelle", en_cours: "En cours", terminee: "Terminée" }[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingDish && (
        <DishEditor zones={catalog.zones} dish={editingDish === "new" ? null : editingDish} defaultZoneId={zoneFilter !== "all" ? zoneFilter : catalog.zones[0]?.id} onCancel={() => setEditingDish(null)} onSave={saveDish} />
      )}
    </div>
  );
}

function ZoneChip({ label, active, onClick, color }) {
  return <button onClick={onClick} style={{ padding: "7px 12px", borderRadius: 999, border: `1.5px solid ${active ? color : LINE}`, background: active ? color : "transparent", color: active ? "#fff" : MUTE, fontSize: 12, fontWeight: 700 }}>{label}</button>;
}

function DishEditor({ zones, dish, defaultZoneId, onCancel, onSave }) {
  const [name, setName] = useState(dish?.name || "");
  const [desc, setDesc] = useState(dish?.desc || "");
  const [price, setPrice] = useState(dish?.price?.toString() || "");
  const [zoneId, setZoneId] = useState(dish?.zoneId || defaultZoneId);
  const [available, setAvailable] = useState(dish?.available ?? true);
  const canSave = name.trim() && price && zoneId;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,74,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 22, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 700, color: NAVY, margin: 0 }}>{dish ? "Modifier le plat" : "Ajouter un plat"}</h3>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: MUTE }}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "block" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, marginBottom: 5 }}>PAYS / CUISINE</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {zones.map((z) => (
                <button key={z.id} onClick={() => setZoneId(z.id)} style={{ padding: "7px 11px", borderRadius: 999, border: `1.5px solid ${zoneId === z.id ? z.color : LINE}`, background: zoneId === z.id ? z.color : "transparent", color: zoneId === z.id ? "#fff" : MUTE, fontSize: 12, fontWeight: 700 }}>{z.flag} {z.name}</button>
              ))}
            </div>
          </label>
          <Field label="Nom du plat / sauce" value={name} onChange={setName} placeholder="Ex : Sauce feuille, Thiéboudienne..." />
          <Field label="Description (optionnel)" value={desc} onChange={setDesc} placeholder="Ex : avec poisson fumé, épicée..." textarea />
          <Field label="Prix (RMB)" value={price} onChange={(v) => setPrice(v.replace(/[^0-9.]/g, ""))} placeholder="Ex : 32" />
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Disponible dès maintenant</span>
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ flex: 1, background: "none", border: `1.5px solid ${LINE}`, borderRadius: 12, padding: 12, fontWeight: 700, fontSize: 13, color: MUTE }}>Annuler</button>
          <button onClick={() => canSave && onSave({ ...(dish || {}), name: name.trim(), desc: desc.trim(), price: parseFloat(price), zoneId, available })} disabled={!canSave} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: RUST, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontWeight: 700, fontSize: 13, opacity: canSave ? 1 : 0.5 }}><Save size={14} /> Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
