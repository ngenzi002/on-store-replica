import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useCartStore, useNotifStore } from '../../context/store';
import styles from './Navbar.module.css';

const CartIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const BellIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { count } = useCartStore();
  const { unreadCount } = useNotifStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = (path) => location.pathname === path ? styles.active : '';

  const handleLogout = () => { logout(); navigate('/auth'); setMenuOpen(false); };

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'G';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoDot} />
          OnStore
        </Link>

        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${active('/')}`}>Explore</Link>
          {user?.role === 'buyer' && (
            <>
              <Link to="/orders" className={`${styles.link} ${active('/orders')}`}>My orders</Link>
              <Link to="/wishlist" className={`${styles.link} ${active('/wishlist')}`}>Wishlist</Link>
            </>
          )}
          {user?.role === 'seller' && (
            <Link to="/dashboard" className={`${styles.link} ${active('/dashboard')}`}>Dashboard</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`${styles.link} ${active('/admin')}`}>Admin</Link>
          )}
          {user && (
            <Link to="/chat" className={`${styles.link} ${active('/chat')}`}>Messages</Link>
          )}
        </div>

        <div className={styles.right}>
          {user && (
            <>
              <Link to="/cart" className={styles.iconBtn} title="Cart">
                <CartIcon />
                {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
              </Link>
              <button className={styles.iconBtn} title="Notifications">
                <BellIcon />
                {unreadCount > 0 && <span className={styles.notifDot} />}
              </button>
              <Link to="/chat" className={styles.iconBtn} title="Messages">
                <ChatIcon />
              </Link>
            </>
          )}

          <div className={styles.avatarWrap} ref={menuRef}>
            <div className={styles.avatar} onClick={() => setMenuOpen(!menuOpen)}>
              {initials}
            </div>
            {menuOpen && (
              <div className={styles.dropdown}>
                {user ? (
                  <>
                    <div className={styles.dropHeader}>
                      <div className={styles.dropName}>{user.username}</div>
                      <div className={styles.dropRole}>{user.role}</div>
                    </div>
                    <div className={styles.dropDivider} />
                    <Link to="/profile" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Profile</Link>
                    {user.role === 'buyer' && <Link to="/orders" className={styles.dropItem} onClick={() => setMenuOpen(false)}>My orders</Link>}
                    {user.role === 'seller' && <Link to="/dashboard" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Dashboard</Link>}
                    <div className={styles.dropDivider} />
                    <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Sign in</Link>
                    <Link to="/auth?mode=register" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Create account</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
