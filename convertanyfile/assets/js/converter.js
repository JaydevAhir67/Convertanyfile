/**
 * ConvertAnyFile - History and Quick Preset Controller
 */

const HistoryController = {
  async loadHistory() {
    const listEl = document.getElementById('history-list-container');
    if (!listEl) return;

    try {
      const res = await fetch('api/history/index.php');
      const data = await res.json();
      if (!data.success || !data.history || data.history.length === 0) {
        listEl.innerHTML = '<div style="color: #64748b; font-size: 13px; text-align: center; padding: 2rem;">No conversion records found. Convert your first file above.</div>';
        return;
      }

      listEl.innerHTML = data.history.map(item => `
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 13px; font-weight: 600; color: #f8fafc;">${item.original_filename} → ${item.output_filename}</div>
            <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">SHA-256: ${item.sha256_output.substring(0, 16)}... · ${item.processing_seconds}s</div>
          </div>
          <span style="font-size: 11px; font-weight: 600; color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 6px;">COMPLETED</span>
        </div>
      `).join('');
    } catch (e) {
      console.warn('Failed to fetch history:', e);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HistoryController.loadHistory();
});
