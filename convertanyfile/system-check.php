<?php
/**
 * ConvertAnyFile - Examiner Demonstration Diagnostics Page
 * Accessible locally at: http://localhost/convertanyfile/system-check.php
 */
require_once __DIR__ . '/config/config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Diagnostics &middot; <?= APP_NAME ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/3d-ui.css">
  <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body class="perspective-grid" style="background: #030712; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; padding-bottom: 4rem;">

  <div class="container" style="max-width: 900px; margin: 3rem auto; padding: 0 1.5rem;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #fff;">C</div>
        <div>
          <h1 style="font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.5px;"><?= APP_NAME ?> Diagnostics</h1>
          <p style="font-size: 12px; color: #94a3b8; margin: 2px 0 0 0;">Examiner System Health &amp; Environment Verification</p>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <a href="./" style="font-size: 12px; padding: 8px 16px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #f8fafc; text-decoration: none; font-weight: 600;">&larr; Return to App</a>
        <button onclick="runDiagnostics()" id="rerun-btn" style="font-size: 12px; padding: 8px 16px; border-radius: 10px; background: #06b6d4; color: #030712; border: none; font-weight: 700; cursor: pointer;">Re-run Diagnostics</button>
      </div>
    </div>

    <!-- Overall Status Banner -->
    <div id="overall-banner" class="glass-panel-elevated" style="padding: 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid #10b981;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div id="overall-icon" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(16,185,129,0.2); display: flex; align-items: center; justify-content: center; color: #10b981; font-weight: 800;">✓</div>
        <div>
          <h3 id="overall-title" style="margin: 0; font-size: 1rem; font-weight: 700; color: #fff;">Running Health Checks...</h3>
          <p id="overall-subtitle" style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Inspecting PHP, MySQL, Apache, storage, and security layers...</p>
        </div>
      </div>
      <div id="env-badge" style="font-size: 11px; font-weight: 700; font-family: monospace; background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); color: #38bdf8; padding: 4px 10px; border-radius: 6px;">
        XAMPP LOCALHOST
      </div>
    </div>

    <!-- Checks Grid -->
    <div id="checks-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1rem;">
      <div style="text-align: center; padding: 3rem; color: #64748b; grid-column: 1 / -1;">Loading system status...</div>
    </div>
  </div>

  <script>
    async function runDiagnostics() {
      const btn = document.getElementById('rerun-btn');
      if (btn) btn.innerText = 'Testing...';

      try {
        const res = await fetch('api/system-check.php');
        const data = await res.json();

        // Update overall banner
        const titleEl = document.getElementById('overall-title');
        const subEl = document.getElementById('overall-subtitle');
        const bannerEl = document.getElementById('overall-banner');
        const iconEl = document.getElementById('overall-icon');

        if (data.all_healthy) {
          titleEl.innerText = "All Systems Operational";
          titleEl.style.color = "#10b981";
          subEl.innerText = "Apache, PHP 8, MySQL, storage directories, and conversion engines are fully operational.";
          bannerEl.style.borderLeftColor = "#10b981";
          iconEl.innerText = "✓";
          iconEl.style.color = "#10b981";
          iconEl.style.background = "rgba(16,185,129,0.2)";
        } else {
          titleEl.innerText = "Action Required";
          titleEl.style.color = "#f59e0b";
          subEl.innerText = "One or more components need attention (e.g. start MySQL or import convertanyfile.sql).";
          bannerEl.style.borderLeftColor = "#f59e0b";
          iconEl.innerText = "!";
          iconEl.style.color = "#f59e0b";
          iconEl.style.background = "rgba(245,158,11,0.2)";
        }

        // Render checks cards
        const grid = document.getElementById('checks-grid');
        grid.innerHTML = Object.entries(data.checks).map(([key, check]) => {
          const isOk = check.status === 'ok';
          const isWarn = check.status === 'warning';
          const color = isOk ? '#10b981' : isWarn ? '#f59e0b' : '#ef4444';
          const icon = isOk ? '✓' : isWarn ? '⚠' : '✕';

          return `
            <div class="glass-panel-elevated" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div style="font-weight: 700; font-size: 14px; color: #fff;">${check.name}</div>
                <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: ${color}; background: ${color}20; border: 1px solid ${color}40; padding: 2px 8px; border-radius: 6px;">
                  ${icon} ${check.status.toUpperCase()}
                </span>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.4;">${check.message}</p>
            </div>
          `;
        }).join('');

      } catch (e) {
        document.getElementById('overall-title').innerText = "Diagnostics Error";
        document.getElementById('overall-subtitle').innerText = "Unable to reach api/system-check.php. Ensure Apache is running.";
      } finally {
        if (btn) btn.innerText = 'Re-run Diagnostics';
      }
    }

    document.addEventListener('DOMContentLoaded', runDiagnostics);
  </script>
</body>
</html>
