you need to add your own .env


# 🚀 Autho - Enterprise E-Commerce API Backend

## 📌 Project Overview
Autho is a highly scalable and secure e-commerce backend API. This system is more advanced than a normal shopping app because it implements a **Multi-Vendor** and **Multi-Role** management architecture. In this project, traditional SQL database concepts have been efficiently converted to NoSQL (MongoDB), so that data relationships (Users, Products, Orders) remain fast and flexible.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js (MVC Architecture)
* **Database:** MongoDB (via Mongoose ODM)
* **Security & Auth:** JSON Web Tokens (JWT) for session management, `bcryptjs` for password hashing.
* **Environment:** `dotenv` for managing sensitive keys.

---

## 🔐 The 11-Level Role-Based Access Control (RBAC) System

The system's greatest power lies in its security and ranking mechanism. The system has 11 different authority levels (ranks) defined so that no junior employee or user can access or modify a senior official's data.

### Hierarchy Levels (Bottom to Top)
1. **user (Level 1):** Regular customer (for purchasing items).
2. **support (Level 2):** Customer care (can only view complaints/orders).
3. **delivery (Level 3):** Delivery staff (can mark order status as "delivered").
4. **vendor (Level 4):** Third-party seller (can add their own products).
5. **marketing (Level 5):** SEO/Ads team (can edit product details/tags).
6. **sales (Level 6):** Sales team (can track revenue and orders).
7. **editor (Level 7):** Content writer (can write product descriptions).
8. **manager (Level 8):** Store manager (can handle daily operations).
9. **admin (Level 9):** Main Administrator (can manage staff and users).
10. **superuser (Level 10):** Senior Admin (can control admins).
11. **root (Level 11):** The God Mode / Creator (Unlimited Access).

### Core Security Rules (The 3 Pillars)
Three strict rules are applied in User update and delete APIs to make the system hack-proof:

1. **Gatekeeper Check:** Not everyone can distribute roles. If someone sends a request from Postman or frontend to change their own or someone else's role, the system checks if the requester is one of `['manager', 'admin', 'superuser', 'root']`. If not, the request is rejected (403 Access Denied).
2. **Rule A (No Self-Promotion):** No user (even Admins) can upgrade their own role using this API. This prevents self-assigned loopholes in the system.
3. **Rule B (The Rank/Authority Check):**
   * A user can only modify profiles, assign roles, or delete users who are at **lower ranks** than themselves.
   * Users cannot modify profiles of those at their **equal** or **senior** rank.
   * **The Root Exception:** Only `root` (Level 11) has the power to bypass ranking rules and assign any role (even creating a new `root`) to anyone.

---

## 📦 Core Modules Breakdown

### 1. User Management (`/api/users`)
* **Signup & Login:** Secure authentication where passwords are hashed and JWT tokens are generated.
* **Profile Management:** Users can update their own details (`req.user.id === targetUserId`).
* **Password Management:** A separate, secure route `simplePasswordUpdate` is created where only the user themselves or `admin/superuser/root` can change the password. Password changes from general profile updates are strictly blocked.
* **Audit Trail:** Whenever a profile is updated, the ID of the person making the update is recorded in the `updatedBy` field.

### 2. Product Management (`/api/products`)
* APIs are available to create, read, update, and delete products.
* Each product has `createdBy` and `updatedBy` IDs linked to track which vendor/admin owns the product.

### 3. Order Management (`/api/orders`)
* **Checkout Logic:** Backend strictly calculates `totalAmount += product.price * item.quantity` to prevent users from manipulating prices through the frontend for fraud.
* **Receipt Generation:** Before saving an order to the database, an `orderProducts` array is created where the exact product ID, purchase quantity, and locked price are recorded.
* **Status Tracking:** Order statuses (`pending`, `shipped`, `delivered`, etc.) are maintained and can be handled by different roles.

---

## 🚧 Upcoming Features & Next Steps
* **Design B (Resource Ownership):** Add logic in the products update controller so a vendor can only delete/edit their own products.
* **Design C (Field-Level Filtering):** Allow delivery boys to only update the order `status` field, preventing them from deleting or modifying price/quantity.
* **Aggregation Pipelines:** Use MongoDB's power to extract daily revenue and top-selling products data for dashboards.