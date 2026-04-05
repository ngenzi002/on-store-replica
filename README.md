# OnStore Backend API

## Setup

```bash
npm install
cp .env.example .env   # fill in your DB credentials & JWT secret
npm run dev            # development with nodemon
npm start              # production
```

---

## Base URL
```
http://localhost:5000/api
```

---

## Authentication
All protected routes require:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/register` | Public | Register buyer or seller |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Auth | Get current user |
| PUT | `/auth/change-password` | Auth | Change password |

**Register body:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123",
  "role": "buyer",
  "full_name": "John Doe",
  "phone": "+250700000000"
}
```
For sellers add `"store_name": "My Store"` and set `"role": "seller"`.

---

### Products
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/products` | Public | List products (paginated, filterable) |
| GET | `/products/:slug` | Public | Single product with images & reviews |
| POST | `/products` | Seller | Create product (multipart/form-data) |
| PUT | `/products/:id` | Seller | Update own product |
| DELETE | `/products/:id` | Seller | Delete own product |

**Query params for GET /products:**
`page`, `limit`, `category`, `seller`, `min_price`, `max_price`, `search`, `sort`, `order`

---

### Cart
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/cart` | Buyer | Get cart items |
| POST | `/cart` | Buyer | Add item `{ product_id, quantity }` |
| PATCH | `/cart/:id` | Buyer | Update quantity `{ quantity }` |
| DELETE | `/cart/:id` | Buyer | Remove item |
| DELETE | `/cart` | Buyer | Clear cart |

---

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/orders` | Buyer | Place order from cart |
| GET | `/orders` | Buyer | My order history |
| GET | `/orders/seller` | Seller | Orders containing my products |
| GET | `/orders/:id` | Buyer | Order detail with items |
| PATCH | `/orders/:id/cancel` | Buyer | Cancel order |
| PATCH | `/orders/:orderId/items/:itemId/status` | Seller | Update item status |

**Order status flow:** `pending` → `confirmed` → `delivered` / `cancelled`

---

### Reviews
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/reviews` | Buyer | Review a delivered product |
| GET | `/reviews/product/:productId` | Public | Get product reviews |

---

### Wishlist
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/wishlist` | Buyer | Get wishlist |
| POST | `/wishlist` | Buyer | Toggle product in wishlist `{ product_id }` |

---

### Categories
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/categories` | Public | Get category tree |
| POST | `/categories` | Admin | Create category |

---

### Notifications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/notifications` | Auth | Get notifications (`?unread=true`) |
| PATCH | `/notifications/read-all` | Auth | Mark all as read |

---

### Analytics
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/analytics/seller` | Seller | Revenue, top products, monthly sales |

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `chat:open` | `{ seller_id }` | Open/create room with seller |
| `chat:join` | `{ room_id }` | Join a chat room |
| `chat:send` | `{ room_id, body }` | Send a message |
| `chat:typing` | `{ room_id, typing }` | Typing indicator |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `chat:room` | `{ room_id }` | Room created/found |
| `chat:history` | `[messages]` | Last 50 messages |
| `chat:message` | `message` | New incoming message |
| `chat:typing` | `{ user_id, typing }` | Other user typing |
| `notification:new` | `{ type, title, body }` | Real-time notification |

**Connect with auth:**
```js
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```
