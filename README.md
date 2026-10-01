# ConvertAnyFile — Full-Stack File Conversion & Transformation Platform

ConvertAnyFile is an enterprise-grade document, media, and data conversion platform with a futuristic 3D interface, native PHP/MySQL backend architecture, and complete offline XAMPP compatibility.

---

## ⚡ One-Click Master Startup Script

To run the complete full-stack project with a single command:

```bash
python run_project.py
```

*(You can also use `python start.py`)*

### Startup Features:
- **Automatic Environment Detection**: Windows, macOS, and Linux.
- **Node.js + PHP Dual Server Orchestration**:
  - Starts Vite 3D React UI on `http://localhost:3000`
  - Detects PHP and starts built-in PHP server on `http://localhost:8000`
- **Auto Browser Launch**: Opens the browser directly to `http://localhost:3000`.
- **Graceful Shutdown**: Press `Ctrl+C` to terminate all background servers cleanly.

---

## 💻 Native XAMPP Installation Guide

1. **Start XAMPP**: Start Apache and MySQL from XAMPP Control Panel.
2. **Copy Project**: Copy the `convertanyfile` directory to:
   ```text
   C:\xampp\htdocs\convertanyfile\
   ```
3. **Import Database**:
   - Open `http://localhost/phpmyadmin/`
   - Import `C:\xampp\htdocs\convertanyfile\database\convertanyfile.sql`
4. **Open in Browser**:
   ```text
   http://localhost/convertanyfile/
   ```
5. **System Health Check**:
   ```text
   http://localhost/convertanyfile/system-check.php
   ```

---

## 🔑 Pre-Seeded Local Examiner Demonstration Account

| Role | Email | Password | Tier / Permissions |
| :--- | :--- | :--- | :--- |
| **Examiner** | `examiner@example.local` | `ChangeMe123!` | Enterprise / Full Local Admin |
| **System Admin** | `admin@convertanyfile.local` | `ChangeMe123!` | Administrator Access |

*(All passwords stored using native PHP Bcrypt hashing; zero plaintext credentials).*

---

## 🏗️ Architecture & Technologies

### Frontend
- React 19, TypeScript, Vite
- Three.js 3D Interactive Canvas & Hero Portal
- Tailwind CSS
- Lucide React Icons

### Backend & Database
- PHP 8.x with REST-style APIs (`/api/auth`, `/api/files`, `/api/user`)
- MySQL Relational Database (7 normalized tables, foreign keys, indexes)
- PDO with Prepared Statements (SQL Injection Immunity)
- Bcrypt Password Hashing
- Secure Isolated File Handling (`uploads/`, `processed/`, `temp/`)

### Unified Python Launcher
- `run_project.py` (Script name: `run_project.py`, alias: `start.py`)
