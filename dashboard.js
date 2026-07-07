// Dashboard JS: reads localStorage `cybershield_history` and renders charts + table

// Theme toggle handler
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

function formatDate(iso) {
  try {
    return iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  } catch (e) { return '—'; }
}

function safeInt(n){ return Number.isFinite(n) ? n : 0; }

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('cybershield_history') || '[]');
  } catch (err) {
    console.warn('Unable to parse scan history:', err);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const history = getHistory();

  const total = history.length;
  const safeSc = history.filter(r => r.status === 'safe').length;
  const dangerSc = history.filter(r => r.status === 'danger').length;
  const safeRatio = total > 0 ? Math.round((safeSc / total) * 100) : 0;

  const elTotal = document.getElementById('dbTotalScans');
  const elThreats = document.getElementById('dbThreatsBlocked');
  const elRatio = document.getElementById('dbSafeRatio');
  if (elTotal) elTotal.textContent = total;
  if (elThreats) elThreats.textContent = dangerSc;
  if (elRatio) elRatio.textContent = `${safeRatio}%`;

  // Threat breakdown counts
  let malware = 0, phishing = 0, unwanted = 0, harmful = 0;
  history.forEach(r => {
    if (r.threats && Array.isArray(r.threats)) {
      r.threats.forEach(t => {
        if (!t) return;
        const key = String(t).toUpperCase();
        if (key.includes('MALWARE')) malware++;
        else if (key.includes('SOCIAL_ENGINEERING') || key.includes('PHISHING')) phishing++;
        else if (key.includes('UNWANTED')) unwanted++;
        else if (key.includes('POTENTIALLY_HARMFUL') || key.includes('HARMFUL')) harmful++;
      });
    }
  });

  // Resolve color hints
  const isLight = document.documentElement.classList.contains('light-mode');
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const tickColor = isLight ? '#3a5580' : '#4a6580';

  // Pie chart: Safe vs Threat
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx && window.Chart) {
    const ctx1 = statusCtx.getContext('2d');
    new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Safe', 'Threats'],
        datasets: [{
          data: [safeInt(safeSc), safeInt(dangerSc)],
          backgroundColor: ['rgba(0, 200, 120, 0.9)', 'rgba(255, 70, 90, 0.95)'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor } }
        }
      }
    });
  }

  // Bar chart: Threat types
  const barCtx = document.getElementById('threatBarChart');
  if (barCtx && window.Chart) {
    const ctx2 = barCtx.getContext('2d');
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Malware', 'Phishing', 'Unwanted Software', 'Potentially Harmful'],
        datasets: [{
          label: 'Count',
          data: [malware, phishing, unwanted, harmful],
          backgroundColor: [
            'rgba(255, 51, 102, 0.6)',
            'rgba(255, 204, 0, 0.6)',
            'rgba(0, 245, 255, 0.6)',
            'rgba(120, 120, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 51, 102, 1)',
            'rgba(255, 204, 0, 1)',
            'rgba(0, 245, 255, 1)',
            'rgba(120, 120, 255, 1)'
          ],
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: tickColor }, grid: { color: gridColor } },
          x: { ticks: { color: tickColor }, grid: { display: false } }
        }
      }
    });
  }

  // Recent scans table
  const recentEl = document.getElementById('recentScans');
  if (recentEl) {
    if (!history || history.length === 0) {
      recentEl.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:24px">No scans recorded yet. <a href="index.html" style="color:var(--accent-cyan)">Scan a URL</a> to get started.</p>';
    } else {
      const recent = [...history].reverse().slice(0, 10);
      recentEl.innerHTML = `
        <table style="width:100%; border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid var(--card-border)">
              <th style="text-align:left; padding:10px 8px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; font-weight:600">URL</th>
              <th style="text-align:center; padding:10px 8px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; white-space:nowrap">Result</th>
              <th style="text-align:right; padding:10px 8px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; white-space:nowrap">Scanned</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map(r => `
              <tr style="border-bottom:1px solid var(--card-border)">
                <td style="padding:10px 8px; color:var(--text-sub); font-family:monospace; font-size:12px; max-width:340px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                  ${r.url || '—'}
                </td>
                <td style="padding:10px 8px; text-align:center">
                  <span style="
                    display:inline-block; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:700; letter-spacing:0.06em;
                    background:${r.status === 'safe' ? 'var(--safe-bg)' : 'var(--danger-bg)'};
                    color:${r.status === 'safe' ? 'var(--safe-color)' : 'var(--danger-color)'};
                    border:1px solid ${r.status === 'safe' ? 'var(--safe-border)' : 'var(--danger-border)'}
                  ">${r.status === 'safe' ? 'SAFE' : 'DANGER'}</span>
                </td>
                <td style="padding:10px 8px; color:var(--text-muted); font-size:11px; text-align:right; white-space:nowrap">
                  ${r.timestamp ? formatDate(r.timestamp) : '—'}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    }
  }

  // Clear history button
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Permanently delete your entire scan history?')) {
        localStorage.removeItem('cybershield_history');
        window.location.reload();
      }
    });
  }
});
