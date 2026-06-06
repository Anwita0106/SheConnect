# She Can Foundation - Contact & Admin Portal

A complete, production-ready, and highly secure full-stack web application developed for the **She Can Foundation**. 

This portal features a visually stunning and responsive **Contact Us** page where users can submit inquiries, alongside a fully protected **Admin Dashboard** which allows foundations administrators to manage, search, and delete incoming forms.

🌐 Frontend: https://she-connect-eight.vercel.app

⚙️ Backend API: https://sheconnect.onrender.com

---

## 🌟 Key Features

* **Empowering Modern UI**: Visually breathtaking color palettes, micro-interactions, custom loading frames, glassmorphism card layouts, and a clean statistics panel designed to stand out.
* **Full-stack Security**:
  * **Input Sanitization & XSS Protection**: Powered by `express-validator` and built-in HTML character escaping.
  * **SQL Injection Defense**: Standard parameterized queries powered natively by **Sequelize ORM**.
  * **Rate Limiting**: Rate limits on public submissions and secure logins using `express-rate-limit`.
  * **JWT Authentication**: Secure admin sessions with cryptographically signed tokens.
* **Seamless DB Connections**: Built on Sequelize, supporting local **SQLite** (default zero-configuration) and production-grade **PostgreSQL** by updating a single environment variable.
* **Accessible (A11y)**: Built with semantic HTML, ARIA attributes, explicit labels, and distinct live validation indicator guides.

---

## 📁 Folder Structure Explanation

The application follows a clean, professional, and separation-of-concerns folder design:

```
she-can-foundation/
├── backend/                  # REST API Server
│   ├── config/               # DB Connection & Configuration (Sequelize)
│   │   └── database.js
│   ├── controllers/          # Business logic handlers
│   │   ├── authController.js
│   │   └── contactController.js
│   ├── middleware/           # Security and verification layers
│   │   ├── authMiddleware.js # Admin JWT token verifier
│   │   └── security.js       # Rate limiters & form sanitizers
│   ├── models/               # Sequelize Data Schemas
│   │   ├── index.js          # Export aggregator
│   │   ├── admin.js          # Admin account schema
│   │   └── submission.js     # Form submission schema
│   ├── routes/               # API endpoint routes mapping
│   │   ├── authRoutes.js
│   │   └── contactRoutes.js
│   ├── scripts/              # Migration / database seeds
│   │   └── seedAdmin.js      # Seeds default admin user
│   ├── .env                  # Dev environment secrets (Git ignored)
│   ├── .env.example          # Sample environment instructions
│   ├── package.json          # Node modules, configurations, scripts
│   └── server.js             # Main server startup & db-sync
│
├── frontend/                 # Client React Application (Vite-powered)
│   ├── public/               # Public static assets
│   ├── src/
│   │   ├── components/       # Custom modular components
│   │   │   ├── ContactForm.jsx   # Contact page and submissions form
│   │   │   ├── Dashboard.jsx     # Admin control panel
│   │   │   ├── Login.jsx         # Secure login screen
│   │   │   ├── Toast.jsx         # Dynamic notification banners
│   │   │   ├── Toast.css
│   │   │   ├── ContactForm.css
│   │   │   ├── Login.css
│   │   │   └── Dashboard.css
│   │   ├── services/         # API fetch calls wrappers
│   │   │   └── api.js
│   │   ├── App.css           # App-wide visual loading frames
│   │   ├── App.jsx           # Views router & token orchestrator
│   │   ├── index.css         # Global variables, fonts, resets
│   │   └── main.jsx          # React entry mount
│   ├── package.json          # Frontend packages & dev dependencies
│   └── vite.config.js        # Vite compilation & backend API Proxy
│
└── README.md                 # Complete system documentation
```

---

## 🗄️ Database Schemas

### 1. Submissions (`Submissions` Table)
Stores user contact messages.

| Field Name  | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default V4 | Unique record identifier |
| `name` | `STRING` | AllowNull: `false` | Sanitized sender full name |
| `email` | `STRING` | AllowNull: `false`, IsEmail | Validated email address |
| `message` | `TEXT` | AllowNull: `false` | Sanitized message content |
| `createdAt` | `DATE` | Default: Current Date | Submission timestamp |

### 2. Admin Accounts (`Admins` Table)
Stores administrative credentials.

| Field Name  | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default V4 | Unique admin identifier |
| `username` | `STRING` | Unique, AllowNull: `false` | Login username |
| `passwordHash`| `STRING` | AllowNull: `false` | Bcrypt hashed password |
| `createdAt` | `DATE` | Default: Current Date | Admin creation timestamp |

---

## 🔌 API Documentation

### Public Endpoints

#### 1. POST `/api/contact`
Submits a contact form.
* **Rate Limit**: 10 submissions per hour per IP.
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "message": "I would love to volunteer at She Can Foundation!"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Form Submitted Successfully",
    "data": {
      "id": "e4451000-fc02-4fb3-96b5-0c5a298bf024",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "message": "I would love to volunteer at She Can Foundation!",
      "createdAt": "2026-05-31T16:00:00.000Z"
    }
  }
  ```
* **Validation Error (400 Bad Request)**:
  ```json
  {
    "status": "error",
    "errors": [
      { "field": "email", "message": "Please provide a valid email address" }
    ]
  }
  ```

---

#### 2. POST `/api/auth/login`
Authenticates admin user and yields JWT.
* **Rate Limit**: 5 attempts per 15 minutes per IP.
* **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "a9012354-9db2-4e4f-b3a1-2d7cbf0d12ab",
      "username": "admin"
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "status": "error",
    "message": "Invalid credentials"
  }
  ```

---

### Admin Protected Endpoints (Requires `Authorization: Bearer <JWT_Token>`)

#### 3. GET `/api/contact`
Retrieves all form submissions, ordered by newest first. Supports text search query.
* **Query Parameters**:
  * `search` (Optional): String filter matching `name`, `email`, or `message` via SQL `LIKE`.
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "total": 1,
    "data": [
      {
        "id": "e4451000-fc02-4fb3-96b5-0c5a298bf024",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "message": "I would love to volunteer at She Can Foundation!",
        "createdAt": "2026-05-31T16:00:00.000Z"
      }
    ]
  }
  ```

---

#### 4. DELETE `/api/contact/:id`
Deletes a form submission by its UUID.
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Submission deleted successfully"
  }
  ```

---

#### 5. GET `/api/auth/verify`
Checks if the current JWT in headers is valid.
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Session is active",
    "admin": {
      "id": "a9012354-9db2-4e4f-b3a1-2d7cbf0d12ab",
      "username": "admin"
    }
  }
  ```

---

## 🛠️ Step-by-Step Setup Instructions

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### 1. Clone & Initialize the Project
Make sure you are in the project folder:
```bash
# If you are in the scratch directory:
cd C:\Users\anwit\.gemini\antigravity\scratch\she-can-foundation
```

### 2. Backend Setup
Configure and seed the database server.
```bash
cd backend

# Install dependencies
npm install

# Run database synchronization & seed default Admin
npm run db:seed
```
The seeder will automatically create a local `database.sqlite` file and seed:
* **Username**: `admin`
* **Password**: `admin123`

To start the API in development mode:
```bash
npm run dev
```
The server will boot on [http://localhost:5000](http://localhost:5000).

### 3. Frontend Setup
Compile and run the React client.
```bash
# Open a new terminal window
cd C:\Users\anwit\.gemini\antigravity\scratch\she-can-foundation\frontend

# Install dependencies
npm install

# Start Vite server
npm run dev
```
The application will open on [http://localhost:5173](http://localhost:5173).

---

## ⚙️ Environment Variables

A `.env` file has been created inside the `backend/` folder:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=she_can_foundation_secret_key_2026_dev_only_key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
DEFAULT_ADMIN_USER=admin
DEFAULT_ADMIN_PASS=admin123
```

> **Note**: To switch from SQLite to **PostgreSQL**, simply add `DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database_name>` to the `.env` file. The backend will automatically recognize this connection and handle it!
