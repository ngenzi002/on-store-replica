// ─── ProductDetail.jsx ─────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, reviewAPI } from '../services/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../context/store';
import toast from 'react-hot-toast';

export function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    productAPI.get(slug).then(({ data }) => { setProduct(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  const handleAddCart = async () => {
    if (!user) { navigate('/auth'); return; }
    try { await addItem(product.id, qty); toast.success(`Added ${qty}× to cart`); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray)' }}>Loading...</div>;
  if (!product) return <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray)' }}>Product not found</div>;

  const wishlisted = isWishlisted(product.id);
  const inStock = product.stock > 0;

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 18, fontFamily: 'var(--fm)', display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ cursor: 'pointer', color: 'var(--indigo)' }} onClick={() => navigate('/')}>Explore</span>
        <span style={{ color: 'var(--gray2)' }}>/</span>
        <span style={{ color: 'var(--gray2)' }}>{product.category_name}</span>
        <span style={{ color: 'var(--gray2)' }}>/</span>
        <span>{product.name.slice(0, 30)}...</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
        {/* Gallery */}
        <div>
          <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '1', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, position: 'relative' }}>
              <div className="product-img-pattern" />
              {product.images?.[activeImg]?.image_url
                ? <img src={product.images[activeImg].image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ position: 'relative', zIndex: 1 }}>📦</span>
              }
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 7, padding: 10 }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 50, height: 50, borderRadius: 8, background: 'var(--surface)', border: `1.5px solid ${i === activeImg ? 'var(--indigo)' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {img.image_url ? <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, letterSpacing: -0.5, marginBottom: 10, lineHeight: 1.2 }}>{product.name}</h1>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">{product.store_name}</span>
            {product.avg_rating > 0 && <span className="badge badge-amber">★ {parseFloat(product.avg_rating).toFixed(1)} · {product.reviews?.length || 0} reviews</span>}
            {product.stock <= 10 && product.stock > 0 && <span className="badge badge-rose">Only {product.stock} left</span>}
          </div>

          <div style={{ fontFamily: 'var(--fd)', fontSize: 34, letterSpacing: -1, marginBottom: 16 }}>${parseFloat(product.price).toFixed(2)}</div>
          <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 20, fontWeight: 300 }}>{product.description}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, fontSize: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: inStock ? 'var(--teal)' : 'var(--rose)' }} />
            <span style={{ color: inStock ? 'var(--teal)' : 'var(--rose)', fontWeight: 600, fontFamily: 'var(--fm)' }}>{inStock ? 'In stock' : 'Out of stock'}</span>
            {inStock && <span style={{ color: 'var(--gray)' }}>— {product.stock} units</span>}
          </div>

          {inStock && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <div className="qty-val">{qty}</div>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(q + 1, product.stock))}>+</button>
              </div>
              <button className="btn btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 14 }} onClick={handleAddCart}>Add to cart</button>
              <button
                onClick={() => { if (!user) { navigate('/auth'); return; } toggle(product.id); toast(wishlisted ? 'Removed from wishlist' : '♡ Added to wishlist'); }}
                style={{ width: 40, height: 40, border: `1.5px solid ${wishlisted ? 'var(--rose)' : 'var(--border2)'}`, borderRadius: 8, background: wishlisted ? 'var(--rose-light)' : 'none', cursor: 'pointer', color: wishlisted ? 'var(--rose)' : 'var(--gray2)', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--ease)' }}
              >{wishlisted ? '♥' : '♡'}</button>
            </div>
          )}

          <button className="btn btn-teal btn-full" style={{ marginBottom: 18 }} onClick={() => { handleAddCart(); navigate('/cart'); }}>Buy now</button>

          <hr className="divider" />

          {/* Reviews */}
          {product.reviews?.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Reviews</div>
              {product.reviews.slice(0, 3).map((r) => (
                <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.username?.[0]?.toUpperCase()}</div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.username}</span>
                    <span style={{ color: 'var(--amber)', fontSize: 11, marginLeft: 'auto' }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  {r.title && <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{r.title}</div>}
                  <p style={{ fontSize: 12, color: 'var(--gray)', lineHeight: 1.6 }}>{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auth.jsx ──────────────────────────────────────────────────────────────
export function Auth() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', store_name: '', phone: '' });

  const isRegister = mode === 'register';
  const set = (k) => (e) => { clearError(); setForm((f) => ({ ...f, [k]: e.target.value })); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) await register({ ...form, role });
      else await login({ email: form.email, password: form.password });
      navigate('/');
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
    } catch {}
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 24, textAlign: 'center', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, background: 'var(--indigo)', borderRadius: '50%' }} />
          OnStore
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray)', textAlign: 'center', marginBottom: 22 }}>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </div>

        {isRegister && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
            {['buyer', 'seller'].map((r) => (
              <button key={r} onClick={() => setRole(r)}
                style={{ padding: 9, fontSize: 13, textAlign: 'center', border: 'none', cursor: 'pointer', background: role === r ? 'var(--indigo)' : 'none', color: role === r ? '#fff' : 'var(--gray)', fontFamily: 'var(--ff)', fontWeight: 500, transition: 'all var(--ease)', textTransform: 'capitalize' }}>
                {r}
              </button>
            ))}
          </div>
        )}

        {error && <div style={{ background: 'var(--rose-light)', color: 'var(--rose)', border: '1px solid var(--rose-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 14, fontWeight: 500 }}>{error}</div>}

        <form onSubmit={submit}>
          {isRegister && role === 'buyer' && <><label className="input-label">Full name</label><input className="input" style={{ marginBottom: 12 }} placeholder="Jane Doe" value={form.full_name} onChange={set('full_name')} /></>}
          {isRegister && role === 'seller' && <><label className="input-label">Store name</label><input className="input" style={{ marginBottom: 12 }} placeholder="My Store" value={form.store_name} onChange={set('store_name')} required /></>}
          {isRegister && <><label className="input-label">Username</label><input className="input" style={{ marginBottom: 12 }} placeholder="janedoe" value={form.username} onChange={set('username')} required /></>}
          <label className="input-label">Email</label>
          <input className="input" style={{ marginBottom: 12 }} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          <label className="input-label">Password</label>
          <input className="input" style={{ marginBottom: 16 }} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8} />
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="divider-text" style={{ marginTop: 14 }}>or</div>
        <div style={{ fontSize: 12, color: 'var(--gray)', textAlign: 'center' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span style={{ color: 'var(--indigo)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Sign in' : 'Sign up free'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Cart.jsx ──────────────────────────────────────────────────────────────
export function Cart() {
  const navigate = useNavigate();
  const { items, total, isLoading, fetchCart, updateItem, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const [payMethod, setPayMethod] = useState('mobile_money');
  const [placing, setPlacing] = useState(false);

  useEffect(() => { if (user) fetchCart(); }, [user]);

  const tax = total * 0.05;
  const finalTotal = total + tax;

  const handleCheckout = async () => {
    setPlacing(true);
    try {
      await orderAPI.place({ payment_method: payMethod });
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Checkout failed');
    }
    setPlacing(false);
  };

  if (!user) return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <div className="empty-state-title">Sign in to view your cart</div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/auth')}>Sign in</button>
      </div>
    </div>
  );

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, letterSpacing: -0.5, marginBottom: 24 }}>Shopping cart</h1>
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <div className="empty-state-title">Your cart is empty</div>
          <div className="empty-state-sub">Start exploring products</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Browse products</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
          <div>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 13, padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 70, height: 70, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7 }} /> : '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--indigo)', fontFamily: 'var(--fm)', fontWeight: 600, marginBottom: 2 }}>{item.store_name}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{item.product_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="qty-ctrl" style={{ borderColor: 'var(--border)' }}>
                      <button className="qty-btn" style={{ width: 28, height: 30, fontSize: 14 }} onClick={() => updateItem(item.id, item.quantity - 1)}>−</button>
                      <div className="qty-val" style={{ fontSize: 12, padding: '0 10px' }}>{item.quantity}</div>
                      <button className="qty-btn" style={{ width: 28, height: 30, fontSize: 14 }} onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ fontSize: 11, color: 'var(--rose)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--ff)' }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--fm)', alignSelf: 'center' }}>${(item.unit_price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ position: 'sticky', top: 70 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Order summary</div>
            <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}><span>Delivery</span><span style={{ color: 'var(--teal)', fontWeight: 600 }}>Free</span></div>
            <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 11, marginTop: 3, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, fontFamily: 'var(--fm)' }}><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>

            <div style={{ marginTop: 14, marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--gray)' }}>Payment method</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              {['mobile_money', 'card', 'bank_transfer', 'cash'].map((m) => (
                <div key={m} onClick={() => setPayMethod(m)}
                  style={{ padding: '7px 8px', border: `1.5px solid ${payMethod === m ? 'var(--indigo)' : 'var(--border)'}`, borderRadius: 8, textAlign: 'center', fontSize: 11, cursor: 'pointer', transition: 'all var(--ease)', fontWeight: 500, color: payMethod === m ? 'var(--indigo)' : 'var(--gray)', background: payMethod === m ? 'var(--indigo-light)' : 'none' }}>
                  {m.replace('_', ' ')}
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-full" style={{ padding: 12, fontSize: 14 }} onClick={handleCheckout} disabled={placing}>
              {placing ? 'Placing order...' : 'Checkout'}
            </button>
            <div style={{ fontSize: 11, color: 'var(--gray)', textAlign: 'center', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              🔒 Secure checkout
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders.jsx ────────────────────────────────────────────────────────────
export function Orders() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    orderAPI.myOrders(filter !== 'all' ? { status: filter } : {})
      .then(({ data }) => { setOrders(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, filter]);

  const STATUS_STYLE = { pending: 'status-pending', confirmed: 'status-confirmed', processing: 'status-processing', delivered: 'status-delivered', cancelled: 'status-cancelled' };
  const TRACK = { pending: 10, confirmed: 35, processing: 65, delivered: 100, cancelled: 0 };

  if (!user) return <div className="container" style={{ paddingTop: 60 }}><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">Sign in to view orders</div><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/auth')}>Sign in</button></div></div>;

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, letterSpacing: -0.5 }}>My orders</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ color: 'var(--gray)', textAlign: 'center', padding: 40 }}>Loading orders...</div>
        : orders.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">No orders yet</div><div className="empty-state-sub">Start shopping to place your first order</div><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Browse products</button></div>
        : orders.map((o) => (
          <div key={o.id} className="card" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--fm)', color: 'var(--indigo)' }}>#{String(o.id).padStart(4, '0')}</span>
              <span style={{ fontSize: 11, color: 'var(--gray)', fontFamily: 'var(--fm)' }}>{new Date(o.created_at).toLocaleDateString()}</span>
              <span className={`badge ${STATUS_STYLE[o.status] || 'badge-gray'}`} style={{ padding: '3px 10px' }}>{o.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--fm)' }}>${parseFloat(o.total_amount).toFixed(2)}</div>
              <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: o.status === 'cancelled' ? 'var(--rose)' : 'var(--indigo)', width: `${TRACK[o.status] || 0}%`, borderRadius: 2, transition: 'width .5s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray)' }}>{o.item_count} item{o.item_count !== 1 ? 's' : ''}</div>
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── Wishlist.jsx ──────────────────────────────────────────────────────────
export function Wishlist() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggle } = useWishlistStore();

  useEffect(() => {
    if (!user) return;
    wishlistAPI.get().then(({ data }) => { setItems(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleRemove = async (productId) => {
    await toggle(productId);
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
    toast('Removed from wishlist');
  };

  if (!user) return <div className="container" style={{ paddingTop: 60 }}><div className="empty-state"><div className="empty-state-icon">♡</div><div className="empty-state-title">Sign in to view wishlist</div><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/auth')}>Sign in</button></div></div>;

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, letterSpacing: -0.5, marginBottom: 24 }}>
        Wishlist <span style={{ fontFamily: 'var(--fm)', fontSize: 16, color: 'var(--gray)' }}>({items.length})</span>
      </h1>
      {loading ? <div style={{ color: 'var(--gray)', textAlign: 'center', padding: 40 }}>Loading...</div>
        : items.length === 0 ? <div className="empty-state"><div className="empty-state-icon">♡</div><div className="empty-state-title">Nothing saved yet</div><div className="empty-state-sub">Tap ♡ on any product to save it</div><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Explore products</button></div>
        : <div className="grid-3">{items.map((item) => (
          <div key={item.id} className="card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }} onClick={() => navigate(`/products/${item.product_slug}`)}>
            <div style={{ aspectRatio: '4/3', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
              <div className="product-img-pattern" />
              {item.image ? <img src={item.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ position: 'relative', zIndex: 1 }}>📦</span>}
            </div>
            <div style={{ padding: 13 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{item.product_name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--fm)' }}>${parseFloat(item.price).toFixed(2)}</span>
                <button onClick={(e) => { e.stopPropagation(); handleRemove(item.product_id); }}
                  style={{ fontSize: 13, color: 'var(--rose)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}>♥ Remove</button>
              </div>
            </div>
          </div>
        ))}</div>}
    </div>
  );
}

// ─── Dashboard.jsx ─────────────────────────────────────────────────────────
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'seller') return;
    Promise.all([analyticsAPI.seller(), orderAPI.sellerOrders({ limit: 10 })])
      .then(([{ data: a }, { data: o }]) => { setData(a.data); setSellerOrders(o.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'seller') return <div className="container" style={{ paddingTop: 60 }}><div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">Seller access only</div></div></div>;
  if (loading) return <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray)' }}>Loading dashboard...</div>;

  const STATUS = { delivered: 'badge-teal', confirmed: 'badge-indigo', pending: 'badge-amber', cancelled: 'badge-rose' };

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, letterSpacing: -0.5, marginBottom: 3 }}>Seller dashboard</h1>
          <div style={{ fontSize: 12, color: 'var(--gray)', fontFamily: 'var(--fm)' }}>{user.username} · {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}</div>
        </div>
        <button className="btn btn-primary btn-sm">+ Add product</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 22 }}>
        {[
          { label: 'Revenue', value: `$${parseFloat(data?.overview?.total_revenue || 0).toFixed(0)}`, delta: '↑ 18%', up: true },
          { label: 'Orders', value: data?.overview?.total_orders || 0, delta: `${data?.low_stock_count} low stock`, up: false },
          { label: 'Items sold', value: data?.overview?.total_items_sold || 0, delta: 'All time', up: true },
          { label: 'Low stock', value: data?.low_stock_count || 0, delta: 'Need restock', up: false },
        ].map((s) => (
          <div key={s.label} className="card-surface">
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--gray)', marginBottom: 5, fontFamily: 'var(--fm)' }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--fm)' }}>{s.value}</div>
            <div style={{ fontSize: 11, marginTop: 3, fontWeight: 500, color: s.up ? 'var(--green)' : 'var(--rose)' }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 18 }}>
        {/* Revenue chart */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Monthly revenue
            <span className="badge badge-teal">Last 12 months</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data?.monthly_sales || []}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: 'var(--fm)' }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis hide />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} contentStyle={{ fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }} />
              <Bar dataKey="revenue" fill="var(--indigo)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Top products</div>
          {(data?.top_products || []).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--gray2)', fontFamily: 'var(--fm)', minWidth: 14 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--indigo)', width: `${(p.units_sold / (data.top_products[0]?.units_sold || 1)) * 100}%`, borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray)', fontFamily: 'var(--fm)' }}>{p.units_sold}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 1fr 1fr', padding: '9px 16px', background: 'var(--surface)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--gray)', fontFamily: 'var(--fm)' }}>
          <span>Order</span><span>Customer</span><span>Amount</span><span>Items</span><span>Status</span>
        </div>
        {sellerOrders.map((o) => (
          <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 1fr 1fr', padding: '11px 16px', borderTop: '1px solid var(--border)', alignItems: 'center', cursor: 'pointer', transition: 'background var(--ease)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--fm)', color: 'var(--indigo)' }}>#{String(o.order_id).padStart(4, '0')}</span>
            <span style={{ fontSize: 12, color: 'var(--gray)', fontFamily: 'var(--fm)' }}>{o.buyer_username}</span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--fm)' }}>${parseFloat(o.subtotal).toFixed(2)}</span>
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>{o.quantity}</span>
            <span className={`badge ${STATUS[o.item_status] || 'badge-gray'}`} style={{ padding: '2px 8px' }}>{o.item_status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chat.jsx ──────────────────────────────────────────────────────────────
import { getSocket } from '../services/socket';
export function Chat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const socket = getSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const msgsRef = React.useRef(null);

  useEffect(() => {
    if (!socket || !user) return;
    socket.on('chat:history', (msgs) => setMessages(msgs));
    socket.on('chat:message', (msg) => setMessages((prev) => [...prev, msg]));
    return () => { socket.off('chat:history'); socket.off('chat:message'); };
  }, [socket, user]);

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [messages]);

  const joinRoom = (roomId) => {
    setActiveRoom(roomId);
    setMessages([]);
    socket?.emit('chat:join', { room_id: roomId });
  };

  const sendMsg = () => {
    if (!input.trim() || !activeRoom) return;
    socket?.emit('chat:send', { room_id: activeRoom, body: input.trim() });
    setInput('');
  };

  if (!user) return <div className="container" style={{ paddingTop: 60 }}><div className="empty-state"><div className="empty-state-icon">💬</div><div className="empty-state-title">Sign in to access messages</div><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/auth')}>Sign in</button></div></div>;

  return (
    <div className="container fade-up" style={{ paddingTop: 28, paddingBottom: 48 }}>
      <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, letterSpacing: -0.5, marginBottom: 16 }}>Messages</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', border: '1.5px solid var(--border)', borderRadius: 'var(--rl)', overflow: 'hidden', background: '#fff', height: 480 }}>
        {/* Room list */}
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
          <div style={{ padding: '14px 14px 10px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Conversations</div>
          {rooms.length === 0 && <div style={{ padding: '20px 14px', fontSize: 12, color: 'var(--gray)', textAlign: 'center' }}>No conversations yet.<br/>Start by contacting a seller.</div>}
        </div>

        {/* Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {!activeRoom ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--gray)' }}>
              <div style={{ fontSize: 32 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Select a conversation</div>
              <div style={{ fontSize: 12, color: 'var(--gray2)' }}>Or contact a seller from a product page</div>
            </div>
          ) : (
            <>
              <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--paper)' }}>
                {messages.map((m) => {
                  const isMe = m.sender_id === user.id;
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: 8, maxWidth: '80%', alignSelf: isMe ? 'flex-end' : 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      {!isMe && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.username?.[0]?.toUpperCase()}</div>}
                      <div>
                        <div style={{ padding: '9px 13px', borderRadius: isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px', fontSize: 13, lineHeight: 1.5, background: isMe ? 'var(--indigo)' : '#fff', color: isMe ? '#fff' : 'var(--ink)', border: isMe ? 'none' : '1px solid var(--border)' }}>{m.body}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray2)', marginTop: 3, fontFamily: 'var(--fm)', textAlign: isMe ? 'right' : 'left' }}>{new Date(m.sent_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="Type a message..." className="input" style={{ flex: 1, borderRadius: 20 }} />
                <button className="btn btn-primary" style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }} onClick={sendMsg}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Import statements needed across all pages
import { orderAPI, wishlistAPI } from '../services/api';
