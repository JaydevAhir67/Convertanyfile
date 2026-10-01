# ConvertAnyFile — Full Localhost / XAMPP Project Guide

ConvertAnyFile is an enterprise-grade document, media, and data transformation platform built to run completely locally on a standard Windows computer using **XAMPP (Apache + PHP 8 + MySQL + phpMyAdmin)**.

URL: `http://localhost/convertanyfile/`

---

## 1. Quick Installation for Examiner Demonstration

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
   - `users`
   - `files`
   - `conversions`
   - `conversion_history`
   - `subscriptions`
   - `payments`
   - `security_logs`

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

## 2. Examiner Demonstration Walkthrough

You can demonstrate the following 6 core modules offline to the examiner:

### Demo 1 — User Registration
1. Click **Sign In** in the top navigation bar.
2. Click **Toggle Login / Register**.
3. Enter Name, Email, and Password.
4. Click **Register**.
5. Inspect phpMyAdmin: the user is created in MySQL with a secure Bcrypt/Argon2id password hash (zero plaintext).

### Demo 2 — User Login & Session
1. Log out and log back in.
2. Observe that a secure HttpOnly, SameSite PHP session cookie is established.

### Demo 3 — File Upload & SHA-256 Verification
1. Drag and drop any DOCX, PDF, or image file into the 3D upload dropzone.
2. The file is uploaded to `uploads/` with a **randomized cryptographic filename** (e.g. `8f4c9c1e7a2b...docx`).
3. The server computes a **SHA-256 cryptographic integrity hash** and stores the record in MySQL `files`.

### Demo 4 — Real Local Conversion (Zero Faking)
1. Select your target format (e.g., `DOCX → PDF`, `PDF → DOCX`, or `JPG → PNG`).
2. Click **Transform File →**.
3. The PHP conversion engine executes locally:
   - Images are rendered via PHP GD.
   - DOCX files are parsed directly via OpenXML (`word/document.xml`).
   - Pure PDF binary vector streams are generated without applying any website styles.
4. Click **Download File ↓** or **Preview** to view the genuine converted output.

### Demo 5 — MySQL Conversion History
1. Scroll down to **My Conversions**.
2. Observe the persistent conversion history loaded in real-time from the MySQL database via `api/history/index.php`.

### Demo 6 — Security & Strict Document Font Isolation
- Upload directory `.htaccess` prevents direct PHP script execution (`php_flag engine off` and script blocking).
- All SQL queries use PDO prepared statements with `PDO::ATTR_EMULATE_PREPARES => false`.
- **Strict Font Isolation**: The website's futuristic font (Syne / Plus Jakarta Sans) is **never** applied to converted documents. Original document fonts (Times New Roman, Arial, Calibri, etc.) and layout are strictly preserved.

---

## 3. Troubleshooting Guide for XAMPP

### 1. Apache does not start (Port 80 / 443 conflict)
- **Cause**: Skype, VMware, or Windows IIS is using port 80 or 443.
- **Fix**: In XAMPP Control Panel, click **Config** > **Apache (httpd.conf)**.
  Change:
  ```apache
  Listen 80
  ```
  to:
  ```apache
  Listen 8080
  ```
  Then access the site via: `http://localhost:8080/convertanyfile/`.

### 2. MySQL does not start (Port 3306 conflict)
- **Cause**: An existing MySQL/MariaDB service is already running on the computer.
- **Fix**: Open Windows Services (`services.msc`), find any running `MySQL` or `MariaDB` service, stop it, and click **Start** in XAMPP.

### 3. Database Connection Failed
- Verify that `convertanyfile.sql` was imported into phpMyAdmin.
- If your XAMPP MySQL root has a password, update `config/database.php`:
  ```php
  private const DB_PASS = 'your_mysql_password';
  ```

### 4. Upload Size Limit
- If uploading large files (> 20 MB), verify your `php.ini` settings:
  ```ini
  upload_max_filesize = 100M
  post_max_size = 100M
  memory_limit = 256M
  max_execution_time = 300
  ```
  Restart Apache after modifying `php.ini`.

---

## 4. Architecture Summary
- **Frontend**: Futuristic 3D glassmorphic interface with CSS 3D transforms and Three.js canvas.
- **Backend API**: Modular PHP endpoints communicating with JSON / multipart streams.
- **Database**: Relational MySQL with foreign key constraints, indexes, and SHA-256 auditing.
- **File System**: Isolated private storage with random identifiers and `.htaccess` execution barriers.
