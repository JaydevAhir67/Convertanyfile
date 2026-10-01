<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/middleware/csrf.php';
$csrfToken = CsrfMiddleware::getToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= APP_NAME ?> — Universal 3D File Conversion Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/3d-ui.css">
  <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body class="perspective-grid">

  <!-- Header & Top Navigation -->
  <header style="border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(3,7,18,0.85); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 50;">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; height: 68px;">
      <a href="./" style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #fff;">C</div>
        <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -0.5px;"><?= APP_NAME ?></span>
      </a>

      <nav style="display: flex; align-items: center; gap: 24px; font-size: 13px; font-weight: 600; color: #94a3b8;">
        <a href="#convert" style="color: #f8fafc;">Convert</a>
        <a href="#tools" style="hover:color: #f8fafc;">3D Tools</a>
        <a href="#history">My Conversions</a>
        <a href="#security">Security Vault</a>
      </nav>

      <div id="nav-user-container">
        <!-- Rendered via auth.js -->
        <button onclick="openAuthModal('login')" style="font-size: 12px; padding: 6px 14px; border-radius: 8px; background: #06b6d4; color: #0f172a; font-weight: 700;">Sign In</button>
      </div>
    </div>
  </header>

  <!-- Hero & 3D Conversion Portal Section -->
  <section style="padding: 4rem 0 3rem 0;">
    <div class="container">
      <div class="hero-grid glass-panel-elevated" style="padding: 3.5rem 2.5rem; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; align-items: center;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); padding: 4px 12px; border-radius: 8px; margin-bottom: 1.25rem;">
            <span>★ Full XAMPP / Localhost Edition</span>
            <span>·</span>
            <span>PHP + MySQL Native</span>
          </div>

          <h1 style="font-size: 2.75rem; font-weight: 800; line-height: 1.15; margin-bottom: 1rem; letter-spacing: -1px;">
            Every File Has <span style="background: linear-gradient(to right, #06b6d4, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Another Form.</span>
          </h1>

          <p style="color: #94a3b8; font-size: 15px; margin-bottom: 2rem; max-width: 480px;">
            Real local file conversions powered by PHP GD, native OpenXML parsing, and MySQL persistence. Document fonts are strictly preserved.
          </p>

          <div style="display: flex; gap: 12px;">
            <a href="#convert" style="background: #06b6d4; color: #0f172a; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px;">
              <span>Drop File to Transform</span>
              <span>→</span>
            </a>
            <a href="#history" style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; color: #f8fafc; font-weight: 600; font-size: 13px; padding: 12px 20px; border-radius: 12px;">
              View History
            </a>
          </div>
        </div>

        <!-- 3D Conversion Portal Visualization -->
        <div style="display: flex; justify-content: center; align-items: center;">
          <div class="portal-container">
            <div class="portal-ring-1"></div>
            <div class="portal-ring-2"></div>
            <div class="portal-core">
              <div style="text-align: center;">
                <div style="font-size: 22px; font-weight: 800; color: #38bdf8; font-family: 'Syne';">DOCX</div>
                <div style="font-size: 11px; color: #a855f7; font-weight: 700;">↓</div>
                <div style="font-size: 22px; font-weight: 800; color: #e11d48; font-family: 'Syne';">PDF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Upload & Transformation Zone -->
  <section id="convert" style="padding: 2rem 0 4rem 0;">
    <div class="container" style="max-width: 860px;">
      <div class="glass-panel" style="padding: 2.5rem; text-align: center;">
        
        <!-- Dropzone Container -->
        <div id="dropzone" style="border: 2px dashed rgba(6, 182, 212, 0.4); border-radius: 1.25rem; padding: 3rem 1.5rem; background: rgba(3, 7, 18, 0.4); transition: all 0.2s; cursor: pointer;" onclick="document.getElementById('file-input').click()">
          <input type="file" id="file-input" style="display: none;">
          <div style="width: 56px; height: 56px; margin: 0 auto 1rem; border-radius: 16px; background: rgba(6, 182, 212, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #38bdf8;">✦</div>
          <h3 id="dropzone-prompt" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Drop your file to transform</h3>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 1.25rem;">Supports DOCX, PDF, JPG, PNG, WEBP, CSV, JSON, TXT (up to 100 MB)</p>
          <button type="button" style="background: rgba(30, 41, 59, 0.9); border: 1px solid #475569; color: #f8fafc; font-weight: 600; font-size: 12px; padding: 8px 18px; border-radius: 8px;">Browse Files</button>
        </div>

        <!-- Selected File Status & Target Select -->
        <div id="file-selected-panel" style="display: none; margin-top: 1.5rem; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem 1.5rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div id="selected-file-name" style="font-weight: 700; font-size: 14px; color: #f8fafc;">document.docx</div>
              <div id="selected-file-size" style="font-size: 12px; color: #94a3b8; font-family: monospace;">1.2 MB</div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; color: #94a3b8;">Target Format:</span>
              <select id="target-format-select" style="background: #0f172a; color: #f8fafc; border: 1px solid #334155; padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 12px;">
                <option value="pdf">PDF (Document)</option>
                <option value="docx">Word (.docx)</option>
                <option value="jpg">JPG (Image)</option>
                <option value="png">PNG (Lossless)</option>
                <option value="webp">WEBP (Optimized)</option>
                <option value="csv">CSV (Tabular)</option>
                <option value="json">JSON (Data)</option>
              </select>

              <button id="convert-btn" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; font-weight: 700; font-size: 12px; padding: 8px 18px; border-radius: 8px;">
                Transform File →
              </button>
            </div>
          </div>
        </div>

        <!-- Conversion Progress State -->
        <div id="conversion-progress-box" style="display: none; margin-top: 1.5rem; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
            <span id="progress-status-text" style="color: #38bdf8;">Transforming document...</span>
            <span style="color: #94a3b8;">Processing</span>
          </div>
          <div style="width: 100%; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden;">
            <div id="progress-bar-fill" style="width: 30%; height: 100%; background: linear-gradient(to right, #06b6d4, #8b5cf6); transition: width 0.3s;"></div>
          </div>
        </div>

        <!-- Conversion Success & Download Box -->
        <div id="conversion-result-box" style="display: none; margin-top: 1.5rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 1.5rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #10b981; letter-spacing: 0.5px;">✓ TRANSFORMATION COMPLETE</div>
              <div id="result-filename" style="font-size: 15px; font-weight: 800; color: #f8fafc; margin-top: 2px;">document.pdf</div>
              <div id="result-sha256" style="font-size: 11px; font-family: monospace; color: #94a3b8; margin-top: 4px;">SHA-256: calculating...</div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <button id="result-preview-btn" style="background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; color: #f8fafc; font-size: 12px; font-weight: 600; padding: 8px 14px; border-radius: 8px;">
                Preview
              </button>
              <a id="result-download-btn" href="#" style="background: #10b981; color: #064e3b; font-size: 12px; font-weight: 700; padding: 8px 18px; border-radius: 8px; text-decoration: none;">
                Download File ↓
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Conversion History Section -->
  <section id="history" style="padding: 2rem 0 4rem 0;">
    <div class="container" style="max-width: 860px;">
      <div class="glass-panel" style="padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px;">My Conversions</h2>
          <button onclick="HistoryController.loadHistory()" style="font-size: 12px; color: #38bdf8; font-weight: 600;">↻ Refresh</button>
        </div>

        <div id="history-list-container">
          <!-- Rendered via converter.js -->
          <div style="color: #64748b; font-size: 13px; text-align: center; padding: 1.5rem;">Loading MySQL records...</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Auth Modal -->
  <div id="auth-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 100; align-items: center; justify-content: center;">
    <div class="glass-panel-elevated" style="width: 100%; max-width: 400px; padding: 2rem; position: relative;">
      <button onclick="closeAuthModal()" style="position: absolute; top: 1rem; right: 1rem; color: #94a3b8; font-size: 18px;">✕</button>
      <h3 id="auth-modal-title" style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.25rem;">Sign In to ConvertAnyFile</h3>

      <div id="auth-name-field" style="display: none; margin-bottom: 1rem;">
        <label style="font-size: 11px; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 4px;">Full Name</label>
        <input type="text" id="auth-name" placeholder="John Doe" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff;">
      </div>

      <div style="margin-bottom: 1rem;">
        <label style="font-size: 11px; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 4px;">Email</label>
        <input type="email" id="auth-email" placeholder="user@convertanyfile.local" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff;">
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="font-size: 11px; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 4px;">Password</label>
        <input type="password" id="auth-password" placeholder="••••••••" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff;">
      </div>

      <button id="auth-submit-btn" onclick="handleAuthSubmit()" style="width: 100%; padding: 10px; background: #06b6d4; color: #0f172a; font-weight: 800; border-radius: 8px; font-size: 13px;">
        Sign In
      </button>

      <div style="text-align: center; margin-top: 1rem; font-size: 12px; color: #94a3b8;">
        <span onclick="openAuthModal(document.getElementById('auth-submit-btn').dataset.mode === 'register' ? 'login' : 'register')" style="color: #38bdf8; cursor: pointer; text-decoration: underline;">
          Toggle Login / Register
        </span>
      </div>
    </div>
  </div>

  <footer style="border-top: 1px solid rgba(255,255,255,0.08); padding: 2rem 0; font-size: 12px; color: #64748b; text-align: center;">
    <div class="container">
      ConvertAnyFile XAMPP Edition · Apache + PHP 8 + MySQL PDO · All document typography strictly preserved.
    </div>
  </footer>

  <script src="assets/js/auth.js"></script>
  <script src="assets/js/upload.js"></script>
  <script src="assets/js/converter.js"></script>
  <script src="assets/js/animations.js"></script>
  <script src="assets/js/app.js"></script>
</body>
</html>
