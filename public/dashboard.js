// public/dashboard.js

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
  const isLight = document.documentElement.classList.toggle('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// State for sorting
let sortCol = 'time';
let sortDesc = true;

function renderTable(history) {
  const recentEl = document.getElementById('recentScans');
  if (history.length === 0) {
    recentEl.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:24px">No scans recorded yet. <a href="index.html" style="color:var(--accent-cyan)">Scan a URL</a> to get started.</p>';
    return;
  }

  // Sort logic
  let sorted = [...history];
  sorted.sort((a, b) => {
    if (sortCol === 'url') {
      const uA = a.url || '';
      const uB = b.url || '';
      return sortDesc ? uB.localeCompare(uA) : uA.localeCompare(uB);
    } else if (sortCol === 'status') {
      const sA = a.status || '';
      const sB = b.status || '';
      return sortDesc ? sB.localeCompare(sA) : sA.localeCompare(sB);
    } else { // time
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return sortDesc ? tB - tA : tA - tB;
    }
  });

  const recent = sorted.slice(0, 50); // display up to 50

  const getSortIcon = (col) => {
    if (sortCol !== col) return '<span style="opacity:0.3; margin-left:4px;">↕</span>';
    return sortDesc ? '<span style="margin-left:4px; color:var(--text-main);">▼</span>' : '<span style="margin-left:4px; color:var(--text-main);">▲</span>';
  };

  recentEl.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse">
        <thead>
          <tr style="border-bottom:1px solid var(--card-border); cursor:pointer;">
            <th data-col="url" class="sort-header" style="text-align:left; padding:10px 8px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; user-select:none; transition: color 0.2s;">URL ${getSortIcon('url')}</th>
            <th data-col="status" class="sort-header" style="text-align:center; padding:10px 8px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; white-space:nowrap; user-select:none; transition: color 0.2s;">Result ${getSortIcon('status')}</th>
            <th data-col="time" class="sort-header" style="text-align:right; padding:10px 8px; font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; white-space:nowrap; user-select:none; transition: color 0.2s;">Scanned ${getSortIcon('time')}</th>
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
                ${r.timestamp ? new Date(r.timestamp).toLocaleString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '—'}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  // Attach sorting events
  document.querySelectorAll('.sort-header').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-col');
      if (sortCol === col) {
        sortDesc = !sortDesc;
      } else {
        sortCol = col;
        sortDesc = (col === 'time'); // Default to desc for time, asc for others
      }
      renderTable(history);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const history = JSON.parse(localStorage.getItem('cybershield_history') || '[]');

  const total     = history.length;
  const safeSc    = history.filter(r => r.status === 'safe').length;
  const dangerSc  = history.filter(r => r.status === 'danger').length;
  const safeRatio = total > 0 ? Math.round((safeSc / total) * 100) : 0;

  document.getElementById('dbTotalScans').textContent  = total;
  document.getElementById('dbThreatsBlocked').textContent = dangerSc;
  document.getElementById('dbSafeRatio').textContent   = `${safeRatio}%`;

  // Threat type breakdown
  let malware = 0, phishing = 0, unwanted = 0, harmful = 0;
  history.forEach(r => {
    if (r.threats && Array.isArray(r.threats)) {
      r.threats.forEach(t => {
        if (t === 'MALWARE')                        malware++;
        if (t === 'SOCIAL_ENGINEERING')             phishing++;
        if (t === 'UNWANTED_SOFTWARE')              unwanted++;
        if (t === 'POTENTIALLY_HARMFUL_APPLICATION') harmful++;
      });
    }
  });

  // Resolve colors from CSS vars for chart
  const isLight = document.documentElement.classList.contains('light-mode');
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const tickColor = isLight ? '#3a5580' : '#4a6580';

  const ctx = document.getElementById('analyticsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Safe Scans', 'Malware', 'Phishing', 'Unwanted / Harmful'],
      datasets: [{
        label: 'Count',
        data: [safeSc, malware, phishing, (unwanted + harmful)],
        backgroundColor: [
          'rgba(0, 255, 136, 0.5)',
          'rgba(255, 51, 102, 0.5)',
          'rgba(255, 204, 0, 0.5)',
          'rgba(0, 245, 255, 0.5)'
        ],
        borderColor: [
          'rgba(0, 255, 136, 1)',
          'rgba(255, 51, 102, 1)',
          'rgba(255, 204, 0, 1)',
          'rgba(0, 245, 255, 1)'
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
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0, color: tickColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: tickColor },
          grid: { display: false }
        }
      }
    }
  });

  // Initial render
  renderTable(history);

  // Clear button
  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Permanently delete your entire scan history?')) {
      localStorage.removeItem('cybershield_history');
      window.location.reload();
    }
  });
});
