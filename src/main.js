import './style.css';
import { supabase } from './config/supabase.js';

// Render base ERP layout
document.querySelector('#app').innerHTML = `
  <aside class="sidebar">
    <div class="brand">CAAS ERP</div>
    <ul class="nav-links">
      <li class="nav-item active" id="nav-dashboard">Dashboard</li>
      <li class="nav-item" id="nav-coa">Chart of Accounts</li>
      <li class="nav-item" id="nav-journal">Journal Vouchers</li>
      <li class="nav-item" id="nav-tb">Trial Balance</li>
      <li class="nav-item" id="nav-assets">Fixed Asset Register</li>
    </ul>
  </aside>

  <main class="main-content">
    <header class="topbar">
      <h3>Financial Workspace</h3>
      <div id="company-badge" style="font-weight: 600; color: #475569;">Company ID: Demo-01</div>
    </header>
    <section class="workspace" id="workspace-content">
      <div class="card">
        <h2>Corporate Finance Overview</h2>
        <p style="margin-top: 10px; color: #64748b;">
          Welcome to CAAS ERP. Select <strong>Chart of Accounts</strong> from the left navigation menu to inspect account ledgers.
        </p>
      </div>
    </section>
  </main>
`;

// Function to fetch and render Chart of Accounts data
async function renderChartOfAccounts() {
  const container = document.querySelector('#workspace-content');
  container.innerHTML = `<div class="card"><h2>Chart of Accounts</h2><p style="margin-top: 10px; color: #64748b;">Loading ledgers from database...</p></div>`;

  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('account_code', { ascending: true });

    if (error) throw error;

    const tableRows = data.map(acc => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 600;">${acc.account_code || ''}</td>
        <td style="padding: 12px;">${acc.account_name || ''}</td>
        <td style="padding: 12px; text-transform: capitalize;">${acc.account_type || ''}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="card">
        <h2>Chart of Accounts (Ind AS Structure)</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; text-align: left;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 12px;">Code</th>
              <th style="padding: 12px;">Account Name</th>
              <th style="padding: 12px;">Type</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="3" style="padding: 12px;">No account ledgers found.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="card" style="border-left: 4px solid #ef4444;">
        <h2 style="color: #ef4444;">Database Connection Error</h2>
        <p style="margin-top: 8px; color: #475569;">${err.message || 'Unable to connect to Supabase backend.'}</p>
        <p style="margin-top: 8px; font-size: 0.85rem; color: #64748b;">Ensure your .env contains valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables, then restart the server.</p>
      </div>`;
  }
}

// Sidebar Navigation Handling
document.querySelector('.nav-links').addEventListener('click', (e) => {
  const item = e.target.closest('.nav-item');
  if (!item) return;

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  item.classList.add('active');

  if (item.id === 'nav-coa') {
    renderChartOfAccounts();
  } else if (item.id === 'nav-dashboard') {
    document.querySelector('#workspace-content').innerHTML = `
      <div class="card">
        <h2>Corporate Finance Overview</h2>
        <p style="margin-top: 10px; color: #64748b;">
          Welcome to CAAS ERP. Select <strong>Chart of Accounts</strong> from the left navigation menu to inspect account ledgers.
        </p>
      </div>`;
  }
});