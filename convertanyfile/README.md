# ConvertAnyFile — Full Localhost / XAMPP Project Guide

ConvertAnyFile is an enterprise-grade document, media, and data transformation platform built to run completely locally on a standard Windows computer using **XAMPP (Apache + PHP 8 + MySQL + phpMyAdmin)** or with the included **Python Master Startup Script**.

**Target Localhost URL**: `http://localhost/convertanyfile/`  
**Diagnostics & Health Check**: `http://localhost/convertanyfile/system-check.php`  
**Unified Startup Script**: `python run_project.py` (or `python start.py`)

---

## ⚡ One-Click Master Startup Script (`run_project.py`)

To run the entire full-stack project (both the modern React 3D frontend and the PHP backend/API) with a single command:

```bash
# Run both Frontend (Port 3000) and PHP Backend (Port 8000)
python run_project.py
```
*(Alias also supported: `python start.py`)*

### What the Python Startup Script Does Automatically:
1. **System & Environment Check**: Detects OS (Windows, macOS, Linux) and Python version.
2. **Node Dependencies**: Verifies `node_modules` and runs `npm install` automatically if needed.
3. **Dual Server Orchestration**:
   - Launches Vite React 3D frontend on `http://localhost:3000`.
   - Detects PHP in system PATH or standard XAMPP paths (`C:\xampp\php\php.exe`) and launches PHP server on `http://localhost:8000`.
4. **Auto Browser Launch**: Opens `http://localhost:3000` automatically in your default browser.
5. **Unified Colored Logging**: Pipes `[FRONTEND]` (cyan) and `[PHP BACKEND]` (purple) logs into a single terminal.
6. **Clean Graceful Shutdown**: Automatically stops both background processes cleanly when you press `Ctrl+C`.

---

## 1. Quick Installation for Examiner Demonstration (Native XAMPP)

### Step 1: Start XAMPP Control Panel
1. Open **XAMPP Control Panel** on Windows.
2. Click **Start** for **Apache**.
3. Click **Start** for **MySQL**.

### Step 2: Copy Project to htdocs
Copy the `convertanyfile` directory directly into your XAMPP web root:
```text
C:\xampp\htdocs\convertanyfile\
```

### Step 3: Import MySQL Database
1. Open your browser and navigate to:
   ```text
   http://localhost/phpmyadmin/
   ```
2. Click the **Import** tab.
3. Choose the file located at:
   ```text
   C:\xampp\htdocs\convertanyfile\database\convertanyfile.sql
   ```
4. Click **Import** (or **Go**).
5. The `convertanyfile` database will be created automatically with all 7 tables:
   - `users` (Argon2id/Bcrypt hashes, user roles, tiers)
   - `files` (Uploaded documents, SHA-256 hashes, sizes)
   - `conversions` (Job states, timings, format pairs)
   - `conversion_history` (Permanent audit log, download links)
   - `subscriptions` (Plan states: free, pro, enterprise)
   - `payments` (Transaction audit records)
   - `security_logs` (OWASP security audits, IP, event type)

### Step 4: Verify Database Connection
The default connection parameters in `config/database.php` are:
- Host: `127.0.0.1`
- Port: `3306`
- Database: `convertanyfile`
- User: `root`
- Password: `""` (blank, default XAMPP setting)

### Step 5: Launch Application
Open your browser and navigate to:
```text
http://localhost/convertanyfile/
```
The application will launch immediately with full local functionality!

---

## 2. Pre-Seeded Local Demonstration Accounts

The database seed (`database/convertanyfile.sql`) automatically includes pre-seeded demo accounts with passwords securely hashed with Bcrypt (zero plaintext in database):

| Role | Email | Password | Tier / Permissions |
| :--- | :--- | :--- | :--- |
| **College Examiner** | `examiner@example.local` | `ChangeMe123!` | Enterprise / Full Admin Access |
| **System Admin** | `admin@convertanyfile.local` | `ChangeMe123!` | Administrator Access |

*(You can also register any new account directly via the UI; passwords will be hashed with native PHP Bcrypt).*

---

## 3. Architecture Diagram

```text
                     CONVERTANYFILE
                           │
                           ▼
                ┌────────────────────┐
                │  Futuristic UI     │
                │  HTML/CSS/JS       │
                │  Three.js          │
                └─────────┬──────────┘
                          │
                       fetch()
                          │
                          ▼
                ┌────────────────────┐
                │    PHP API Layer   │
                │ Authentication     │
                │ Upload             │
                │ Conversion         │
                │ Download           │
                └─────────┬──────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
     ┌────────────────┐       ┌─────────────────┐
     │     MySQL      │       │ File Processing │
     │ Users          │       │ PDF             │
     │ Files          │       │ DOCX            │
     │ History        │       │ JPG/PNG/WEBP    │
     │ Payments       │       │ Other formats   │
     └────────────────┘       └─────────────────┘
```

---

## 4. Technologies Used

### Frontend
- **HTML5 & CSS3**: High-performance semantic structure, CSS 3D perspective grids, and custom scrollbars.
- **JavaScript (ES6+)**: Async pipeline orchestration, drag-and-drop file ingestion, and dynamic DOM updates.
- **Tailwind CSS & 3D Glassmorphism**: Translucent panels, neon glow borders, and spatial depth hierarchy.
- **Three.js & Canvas**: 3D interactive holographic conversion portal with mouse-parallax tilt.
- **Responsive Layout**: Desktop, tablet, and mobile viewport optimizations.

### Backend
- **PHP 8+**: REST-style JSON API architecture and modular service design.
- **PHP Data Objects (PDO)**: Prepared SQL statements, `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`, `PDO::ATTR_EMULATE_PREPARES => false`.
- **PHP GD Engine**: High-fidelity image manipulation, resampling, JPEG/PNG/WEBP encoding.
- **Native OpenXML Parser**: Accurate DOCX XML extraction and manipulation.

### Database
- **MySQL / MariaDB**: Relational schema with strict foreign keys, indexing, and cascade rules.
- **phpMyAdmin**: Graphical database management and inspection.

### Local Server
- **XAMPP / Apache**: HTTP web server, `mod_rewrite` clean routing, and `.htaccess` execution barriers.

### Security
- **Argon2id & Bcrypt**: Salted password hashing (zero plaintext storage).
- **SHA-256 Integrity Hashes**: Cryptographic file checksums computed on upload and conversion.
- **OWASP Hardening**: Input sanitization, path canonicalization against directory traversal.
- **Upload Isolation**: `.htaccess` blocking PHP execution inside `uploads/`, `processed/`, and `temp/`.
- **CSRF & Session Security**: HttpOnly and SameSite cookie policies.

---

## 5. Strict Document Font Isolation (DOCX ↔ PDF)

The application enforces strict isolation between website UI design and converted documents:
- **Website UI**: Futuristic 3D styling (Syne, Plus Jakarta Sans, Tailwind classes, neon accents).
- **Converted Documents**: Source document formatting is strictly preserved:
  - Font families (Times New Roman, Arial, Calibri, Courier New, Georgia)
  - Font sizes (Headings H1-H3, body paragraphs)
  - Emphasis (bold, italic, bold-italic, underline, links)
  - Text colors (neutral corporate palette `#111827`, link `#2563EB`)
  - Tables with header fills and borders
  - Bulleted and numbered lists
  - Embedded images
  - Document footers with dynamic page numbers (`Page X of Y`)
- **Zero UI Bleed**: No website gradients, red accent bars, or UI fonts are ever applied to generated PDF or Word files.

---

## 6. Final Test Matrix

| Feature | Localhost | Database | Real Output | Preview | Download |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Register** | ✓ | ✓ | — | — | — |
| **Login** | ✓ | ✓ | — | — | — |
| **JPG → PNG** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PNG → JPG** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **JPG → PDF** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PDF → JPG** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **DOCX → PDF** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PDF → DOCX** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PDF Merge** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PDF Split** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **PDF Compress** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Conversion History** | ✓ | ✓ | — | ✓ | — |
| **Secure Download** | ✓ | ✓ | ✓ | — | ✓ |

---

## 7. Examiner Demonstration Walkthrough

You can demonstrate the following 6 core modules offline to the examiner:

### Demo 1 — System Diagnostics Check
1. Open: `http://localhost/convertanyfile/system-check.php`.
2. Click **Re-run Diagnostics**.
3. Point out the live verification of PHP, PDO, MySQL connection (7 tables active), storage writability, and GD image engine.

### Demo 2 — User Registration & MySQL Storage
1. Click **Sign In** in the top navigation bar.
2. Register a new user with name, email, and password.
3. Open phpMyAdmin &rarr; `convertanyfile.users` table. Show the newly created row with its secure Bcrypt hash.

### Demo 3 — File Upload & SHA-256 Checksum
1. Drop a document or image into the 3D conversion portal.
2. The file is uploaded to `uploads/` with a randomized UUID filename.
3. Check the `files` table in phpMyAdmin: observe the computed SHA-256 hash.

### Demo 4 — Real Local Conversion & Preview
1. Select target format (e.g. `DOCX → PDF` or `JPG → PNG`).
2. Click **Convert File**.
3. View the live inline preview. Point out that the document retains its original fonts and layout without website styling leakage.
4. Click **Download** to inspect the generated binary file.

### Demo 5 — Multi-Page PDF to JPG Preview
1. Convert a multi-page PDF to JPG images.
2. Observe the gallery preview showing **Page 1, Page 2, Page 3...** thumbnails.
3. Download individual pages or the bundled ZIP archive.

### Demo 6 — Security & Traversal Protection
1. Open `uploads/.htaccess`: verify that PHP script execution is disabled (`php_flag engine off`).
2. Point out that `api/files/download.php` uses database IDs and `realpath()` path canonicalization, rejecting any `../../` traversal attempt with `403 FORBIDDEN_TRAVERSAL` and logging it into `security_logs`.
