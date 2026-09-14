// Master Range Mappings (Ind AS Aligned)
const RANGE_DEFINITIONS = {
  CURRENT_ASSETS: { name: 'Current Assets', min: 1000, max: 1699, defaultBalance: 'Debit' },
  NON_CURRENT_ASSETS: { name: 'Non-Current Assets', min: 1700, max: 1999, defaultBalance: 'Debit' },
  CURRENT_LIABILITIES: { name: 'Current Liabilities', min: 2000, max: 2499, defaultBalance: 'Credit' },
  NON_CURRENT_LIABILITIES: { name: 'Non-Current Liabilities', min: 2500, max: 2999, defaultBalance: 'Credit' },
  EQUITY: { name: 'Equity & Reserves', min: 3000, max: 3999, defaultBalance: 'Credit' },
  REVENUE: { name: 'Revenue & Sales', min: 4000, max: 4499, defaultBalance: 'Credit' },
  DIRECT_COSTS: { name: 'Direct Costs / COGS', min: 4500, max: 4599, defaultBalance: 'Debit' },
  INDIRECT_EXPENSES: { name: 'Indirect Operating Expenses', min: 4600, max: 4999, defaultBalance: 'Debit' }
};

// Initial Master COA
let coaMaster = [];
try {
  coaMaster = JSON.parse(localStorage.getItem('caas_master_coa')) || [
    { code: 1001, name: 'Cash & Cash Equivalents', groupKey: 'CURRENT_ASSETS', balance: 'Debit', tag: 'Cash & Cash Equivalents' },
    { code: 1002, name: 'Trade Receivables (Debtors)', groupKey: 'CURRENT_ASSETS', balance: 'Debit', tag: 'Trade Receivables' },
    { code: 1701, name: 'Property, Plant & Equipment', groupKey: 'NON_CURRENT_ASSETS', balance: 'Debit', tag: 'Property, Plant & Equipment' },
    { code: 2001, name: 'Trade Payables (Creditors)', groupKey: 'CURRENT_LIABILITIES', balance: 'Credit', tag: 'Trade Payables' },
    { code: 3001, name: 'Owner / Share Capital', groupKey: 'EQUITY', balance: 'Credit', tag: 'Share Capital' },
    { code: 4001, name: 'Revenue from Operations', groupKey: 'REVENUE', balance: 'Credit', tag: 'Revenue from Operations' },
    { code: 4601, name: 'Operating Expenses', groupKey: 'INDIRECT_EXPENSES', balance: 'Debit', tag: 'Other Operating Expenses' }
  ];
} catch (e) {
  coaMaster = [];
}

// Initialize Ledger State
let transactions = [];
try {
  transactions = JSON.parse(localStorage.getItem('caas_ledger_state')) || [];
} catch (e) {
  transactions = [];
}

const app = document.getElementById('app');

app.innerHTML = `
  <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 1100px; margin: 20px auto; padding: 0 20px; color: #1f2937;">
    <h2 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">CAAS ERP - Financial Engine & Audit Core</h2>

    <!-- COA Creation Engine -->
    <div style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px;">
      <h3 style="margin-top: 0; margin-bottom: 16px; color: #0f172a;">Chart of Accounts (COA) Creation Engine</h3>
      
      <div id="alertBox" style="display: none; padding: 10px 14px; border-radius: 6px; font-size: 14px; font-weight: 600; margin-bottom: 16px;"></div>

      <form id="coaForm">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #475569;">Account Group *</label>
            <select id="accountGroup" style="width: 100%; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" required>
              <option value="">-- Select Group --</option>
              <option value="CURRENT_ASSETS">Current Assets (1000–1699)</option>
              <option value="NON_CURRENT_ASSETS">Non-Current Assets (1700–1999)</option>
              <option value="CURRENT_LIABILITIES">Current Liabilities (2000–2499)</option>
              <option value="NON_CURRENT_LIABILITIES">Non-Current Liabilities (2500–2999)</option>
              <option value="EQUITY">Equity & Reserves (3000–3999)</option>
              <option value="REVENUE">Revenue & Sales (4000–4499)</option>
              <option value="DIRECT_COSTS">Direct Costs / COGS (4500–4599)</option>
              <option value="INDIRECT_EXPENSES">Indirect Operating Expenses (4600–4999)</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #475569;">
              GL Code * <span id="rangeHint" style="font-weight: normal; color: #64748b; font-size: 11px;">(Select group)</span>
            </label>
            <input type="number" id="glCode" style="width: 100%; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" placeholder="e.g. 1010" required />
          </div>

          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #475569;">GL Account Name *</label>
            <input type="text" id="glName" style="width: 100%; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" placeholder="e.g. HDFC Bank Account" required />
          </div>

          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #475569;">Balance Type</label>
            <select id="balanceType" style="width: 100%; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background-color: #f1f5f9;" disabled>
              <option value="Debit">Debit (Dr)</option>
              <option value="Credit">Credit (Cr)</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #475569;">Schedule III Tag *</label>
            <select id="scheduleTag" style="width: 100%; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;" required>
              <option value="">-- Select Schedule III Head --</option>
              <option value="Cash & Cash Equivalents">Cash & Cash Equivalents</option>
              <option value="Trade Receivables">Trade Receivables</option>
              <option value="Inventories">Inventories</option>
              <option value="Property, Plant & Equipment">Property, Plant & Equipment</option>
              <option value="Trade Payables">Trade Payables</option>
              <option value="Other Current Liabilities">Other Current Liabilities</option>
              <option value="Share Capital">Share Capital</option>
              <option value="Reserves & Surplus">Reserves & Surplus</option>
              <option value="Revenue from Operations">Revenue from Operations</option>
              <option value="Cost of Materials Consumed">Cost of Materials Consumed</option>
              <option value="Other Operating Expenses">Other Operating Expenses</option>
            </select>
          </div>
        </div>

        <button type="submit" id="saveGlBtn" style="background-color: #0284c7; color: white; border: none; padding: 10px 18px; font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer;">
          + Save & Create GL Account
        </button>
      </form>
    </div>

    <!-- Multi-Line Voucher Entry -->
    <div style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px;">
      <h3 style="margin-top: 0; margin-bottom: 16px; color: #0f172a;">Multi-Line Voucher Entry</h3>
      
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1;">
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Voucher Type:</label>
          <select id="vType" style="width: 100%; padding: 9px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
            <option value="JV">Journal Voucher (JV)</option>
            <option value="BP">Bank Payment (BP)</option>
            <option value="BR">Bank Receipt (BR)</option>
            <option value="CP">Cash Payment (CP)</option>
            <option value="CR">Cash Receipt (CR)</option>
          </select>
        </div>

        <div style="flex: 1;">
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Voucher Date:</label>
          <input type="date" id="vDate" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 9px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
        </div>
      </div>

      <h4 style="margin: 15px 0 10px 0;">Voucher Entries</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; color: #4b5563;">
            <th style="padding: 10px; width: 45%;">Account Head</th>
            <th style="padding: 10px; width: 20%;">Type (Dr/Cr)</th>
            <th style="padding: 10px; width: 25%;">Amount (₹)</th>
            <th style="padding: 10px; width: 10%; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody id="lineItemsBody"></tbody>
      </table>

      <button id="addLineBtn" type="button" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 14px; font-weight: 600; border-radius: 6px; cursor: pointer; font-size: 13px; margin-bottom: 20px;">
        + Add Line Item
      </button>

      <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="font-size: 14px;">
          <span>Total Dr: <strong id="sumDr">₹0.00</strong></span> | 
          <span>Total Cr: <strong id="sumCr">₹0.00</strong></span>
        </div>
        <div id="balanceStatus" style="font-weight: 600; font-size: 14px; color: #ef4444;">
          Imbalance: ₹0.00
        </div>
      </div>

      <button id="postBtn" style="width: 100%; background-color: #0284c7; color: white; padding: 12px; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Post Voucher
      </button>
    </div>

    <!-- Voucher Audit Trail & Ledger View -->
    <div style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; color: #0f172a;">Voucher Audit Trail & General Ledger</h3>
        <div style="display: flex; gap: 10px;">
          <select id="ledgerFilterSelect" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px;">
            <option value="ALL">Show All Accounts (Full Audit)</option>
          </select>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
              <th style="padding: 10px;">Voucher ID</th>
              <th style="padding: 10px;">Date</th>
              <th style="padding: 10px;">Type</th>
              <th style="padding: 10px;">GL Account Details</th>
              <th style="padding: 10px; text-align: right;">Debit (₹)</th>
              <th style="padding: 10px; text-align: right;">Credit (₹)</th>
            </tr>
          </thead>
          <tbody id="auditTrailBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Real-Time Trial Balance -->
    <h3 style="margin-bottom: 12px;">Real-Time Trial Balance</h3>
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb; color: #4b5563;">
            <th style="padding: 10px;">GL Code & Account Name</th>
            <th style="padding: 10px;">Category Group</th>
            <th style="padding: 10px; text-align: right;">Total Debit (₹)</th>
            <th style="padding: 10px; text-align: right;">Total Credit (₹)</th>
            <th style="padding: 10px; text-align: right;">Net Balance (₹)</th>
          </tr>
        </thead>
        <tbody id="tbBody"></tbody>
        <tfoot>
          <tr id="tbFooter" style="border-top: 2px solid #111827; font-weight: bold;"></tr>
        </tfoot>
      </table>
    </div>

    <!-- Master COA Database View -->
    <h3 style="margin-bottom: 12px;">Master Chart of Accounts (COA Database)</h3>
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb; color: #4b5563;">
            <th style="padding: 8px;">GL Code</th>
            <th style="padding: 8px;">Account Name</th>
            <th style="padding: 8px;">Group</th>
            <th style="padding: 8px;">Balance Type</th>
            <th style="padding: 8px;">Schedule III Tag</th>
          </tr>
        </thead>
        <tbody id="coaTableBody"></tbody>
      </table>
    </div>
  </div>
`;

// Helper: Get CoA Dropdown Options HTML
function getCoAOptionsHTML() {
  coaMaster.sort((a, b) => Number(a.code) - Number(b.code));
  return coaMaster.map(
    (acc) => `<option value="${acc.code}">${acc.code} - ${acc.name}</option>`
  ).join('');
}

// Render Master COA Table & Ledger Filter Select
function renderCOATable() {
  coaMaster.sort((a, b) => Number(a.code) - Number(b.code));
  const tbody = document.getElementById('coaTableBody');
  tbody.innerHTML = coaMaster.map(acc => {
    const rangeInfo = RANGE_DEFINITIONS[acc.groupKey] || { name: acc.groupKey };
    return `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 8px;"><strong>${acc.code}</strong></td>
        <td style="padding: 8px;">${acc.name}</td>
        <td style="padding: 8px; color: #64748b;">${rangeInfo.name}</td>
        <td style="padding: 8px;"><strong>${acc.balance}</strong></td>
        <td style="padding: 8px;">${acc.tag}</td>
      </tr>
    `;
  }).join('');

  // Update voucher entry line selectors
  document.querySelectorAll('.line-code').forEach(select => {
    const currentVal = select.value;
    select.innerHTML = getCoAOptionsHTML();
    if (currentVal) select.value = currentVal;
  });

  // Populate Ledger Filter
  const ledgerSelect = document.getElementById('ledgerFilterSelect');
  const currentFilter = ledgerSelect.value;
  ledgerSelect.innerHTML = `<option value="ALL">Show All Accounts (Full Audit)</option>` +
    coaMaster.map(acc => `<option value="${acc.code}">${acc.code} - ${acc.name}</option>`).join('');
  if (currentFilter) ledgerSelect.value = currentFilter;
}

// Render Voucher Audit Trail & Ledger View
function renderAuditTrail() {
  const tbody = document.getElementById('auditTrailBody');
  const filterCode = document.getElementById('ledgerFilterSelect').value;

  tbody.innerHTML = '';

  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 14px; text-align: center; color: #94a3b8;">No posted vouchers found in the audit trail.</td></tr>`;
    return;
  }

  // Reverse to show newest vouchers first
  const sortedTx = [...transactions].reverse();

  sortedTx.forEach((v) => {
    const matchingLines = filterCode === 'ALL'
      ? v.lines
      : v.lines.filter(l => String(l.account_code) === String(filterCode));

    if (matchingLines.length === 0) return;

    matchingLines.forEach((line, index) => {
      const row = document.createElement('tr');
      row.style.borderBottom = index === matchingLines.length - 1 ? '2px solid #e2e8f0' : '1px solid #f1f5f9';
      if (index === 0) row.style.backgroundColor = '#fafafa';

      row.innerHTML = `
        <td style="padding: 8px 10px; font-weight: 600; color: #0284c7;">${index === 0 ? v.voucher_id : ''}</td>
        <td style="padding: 8px 10px; color: #64748b;">${index === 0 ? v.date : ''}</td>
        <td style="padding: 8px 10px; font-weight: 500;">${index === 0 ? `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${v.type}</span>` : ''}</td>
        <td style="padding: 8px 10px;"><strong>${line.account_code}</strong> - ${line.account_name}</td>
        <td style="padding: 8px 10px; text-align: right; font-family: monospace;">${line.debit > 0 ? line.debit.toFixed(2) : '-'}</td>
        <td style="padding: 8px 10px; text-align: right; font-family: monospace;">${line.credit > 0 ? line.credit.toFixed(2) : '-'}</td>
      `;
      tbody.appendChild(row);
    });
  });
}

document.getElementById('ledgerFilterSelect').addEventListener('change', renderAuditTrail);

// Group Selection Handler
const accountGroupSelect = document.getElementById('accountGroup');
const balanceTypeSelect = document.getElementById('balanceType');
const rangeHint = document.getElementById('rangeHint');
const alertBox = document.getElementById('alertBox');

accountGroupSelect.addEventListener('change', () => {
  const groupKey = accountGroupSelect.value;
  alertBox.style.display = 'none';

  if (!groupKey) {
    rangeHint.textContent = '(Select group)';
    return;
  }

  const rangeInfo = RANGE_DEFINITIONS[groupKey];
  balanceTypeSelect.value = rangeInfo.defaultBalance;
  rangeHint.textContent = `(Range: ${rangeInfo.min}–${rangeInfo.max})`;
});

// COA Form Submit Validation Guard
document.getElementById('coaForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const groupKey = accountGroupSelect.value;
  const code = Number(document.getElementById('glCode').value);
  const name = document.getElementById('glName').value.trim();
  const balance = balanceTypeSelect.value;
  const tag = document.getElementById('scheduleTag').value;

  if (!groupKey || !code || !name || !tag) return;

  const rangeInfo = RANGE_DEFINITIONS[groupKey];

  if (code < rangeInfo.min || code > rangeInfo.max) {
    showAlert(`Invalid GL Code! For ${rangeInfo.name}, the code must fall between ${rangeInfo.min} and ${rangeInfo.max}.`, 'danger');
    return;
  }

  const codeExists = coaMaster.some((acc) => Number(acc.code) === code);
  if (codeExists) {
    showAlert(`GL Code ${code} already exists in the Chart of Accounts! Please choose an unused code.`, 'danger');
    return;
  }

  coaMaster.push({ code, name, groupKey, balance, tag });
  localStorage.setItem('caas_master_coa', JSON.stringify(coaMaster));

  renderCOATable();

  showAlert(`GL Account ${code} - "${name}" successfully created!`, 'success');

  document.getElementById('coaForm').reset();
  rangeHint.textContent = '(Select group)';
});

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.style.backgroundColor = type === 'danger' ? '#fef2f2' : '#f0fdf4';
  alertBox.style.color = type === 'danger' ? '#dc2626' : '#16a34a';
  alertBox.style.border = type === 'danger' ? '1px solid #fecaca' : '1px solid #bbf7d0';
  alertBox.style.display = 'block';
}

// Voucher Line Operations
function addLineRow(defaultType = 'Dr') {
  const tbody = document.getElementById('lineItemsBody');
  const row = document.createElement('tr');
  row.className = 'line-row';
  row.style.borderBottom = '1px solid #f3f4f6';
  row.innerHTML = `
    <td style="padding: 8px;">
      <select class="line-code" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
        ${getCoAOptionsHTML()}
      </select>
    </td>
    <td style="padding: 8px;">
      <select class="line-type" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
        <option value="Dr" ${defaultType === 'Dr' ? 'selected' : ''}>Debit (Dr)</option>
        <option value="Cr" ${defaultType === 'Cr' ? 'selected' : ''}>Credit (Cr)</option>
      </select>
    </td>
    <td style="padding: 8px;">
      <input type="number" class="line-amt" step="0.01" placeholder="0.00" style="width: 95%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" />
    </td>
    <td style="padding: 8px; text-align: center;">
      <button type="button" class="remove-row-btn" style="background: #fee2e2; color: #dc2626; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">✕</button>
    </td>
  `;

  tbody.appendChild(row);

  row.querySelector('.line-amt').addEventListener('input', calculateVoucherTotals);
  row.querySelector('.line-type').addEventListener('change', calculateVoucherTotals);
  row.querySelector('.remove-row-btn').addEventListener('click', () => {
    if (document.querySelectorAll('.line-row').length > 2) {
      row.remove();
      calculateVoucherTotals();
    } else {
      alert('A voucher must contain at least two entries (Debit and Credit).');
    }
  });

  calculateVoucherTotals();
}

function calculateVoucherTotals() {
  let totalDr = 0;
  let totalCr = 0;

  document.querySelectorAll('.line-row').forEach((row) => {
    const type = row.querySelector('.line-type').value;
    const amt = parseFloat(row.querySelector('.line-amt').value) || 0;

    if (type === 'Dr') totalDr += amt;
    else totalCr += amt;
  });

  const diff = Math.abs(totalDr - totalCr);
  const isBalanced = diff < 0.01 && totalDr > 0;

  document.getElementById('sumDr').textContent = `₹${totalDr.toFixed(2)}`;
  document.getElementById('sumCr').textContent = `₹${totalCr.toFixed(2)}`;

  const statusEl = document.getElementById('balanceStatus');
  if (isBalanced) {
    statusEl.textContent = '✓ Voucher Balanced';
    statusEl.style.color = '#10b981';
  } else {
    statusEl.textContent = `Imbalance: ₹${diff.toFixed(2)}`;
    statusEl.style.color = '#ef4444';
  }

  return { totalDr, totalCr, isBalanced };
}

document.getElementById('addLineBtn').addEventListener('click', () => addLineRow('Dr'));

// Trial Balance Aggregation
function renderTrialBalance() {
  const accountBalances = {};

  transactions.forEach((v) => {
    v.lines.forEach((line) => {
      const code = String(line.account_code);
      if (!accountBalances[code]) {
        accountBalances[code] = { debit: 0, credit: 0 };
      }
      accountBalances[code].debit += Number(line.debit) || 0;
      accountBalances[code].credit += Number(line.credit) || 0;
    });
  });

  const tbBody = document.getElementById('tbBody');
  const tbFooter = document.getElementById('tbFooter');
  
  tbBody.innerHTML = '';
  let grandDebit = 0;
  let grandCredit = 0;

  const codes = Object.keys(accountBalances).sort((a, b) => Number(a) - Number(b));

  if (codes.length === 0) {
    tbBody.innerHTML = `<tr><td colspan="5" style="padding: 12px; text-align: center; color: #6b7280;">No posted vouchers yet.</td></tr>`;
    tbFooter.innerHTML = '';
    return;
  }

  codes.forEach((code) => {
    const dr = accountBalances[code].debit;
    const cr = accountBalances[code].credit;
    const net = dr - cr;

    grandDebit += dr;
    grandCredit += cr;

    const coaItem = coaMaster.find((a) => String(a.code) === code) || { name: 'Unknown Account', groupKey: 'N/A' };
    const rangeInfo = RANGE_DEFINITIONS[coaItem.groupKey] || { name: coaItem.groupKey };

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #f3f4f6';
    row.innerHTML = `
      <td style="padding: 10px;"><strong>${code}</strong> - ${coaItem.name}</td>
      <td style="padding: 10px; color: #6b7280;">${rangeInfo.name}</td>
      <td style="padding: 10px; text-align: right;">${dr.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right;">${cr.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; color: ${net >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
        ${Math.abs(net).toFixed(2)} ${net >= 0 ? 'Dr' : 'Cr'}
      </td>
    `;
    tbBody.appendChild(row);
  });

  const isBalanced = Math.abs(grandDebit - grandCredit) < 0.01;

  tbFooter.innerHTML = `
    <td style="padding: 10px;" colspan="2">Total (${isBalanced ? 'Balanced' : 'Unbalanced'})</td>
    <td style="padding: 10px; text-align: right;">${grandDebit.toFixed(2)}</td>
    <td style="padding: 10px; text-align: right;">${grandCredit.toFixed(2)}</td>
    <td style="padding: 10px; text-align: right; color: ${isBalanced ? '#10b981' : '#ef4444'};">
      ${isBalanced ? '✓ Balanced' : 'Differing'}
    </td>
  `;
}

// Post Voucher Action
document.getElementById('postBtn').addEventListener('click', () => {
  const type = document.getElementById('vType').value;
  const date = document.getElementById('vDate').value;
  const { totalDr, isBalanced } = calculateVoucherTotals();

  if (!isBalanced) {
    alert('Cannot post voucher. Debits must equal Credits.');
    return;
  }

  const lines = [];
  let isValid = true;

  document.querySelectorAll('.line-row').forEach((row) => {
    const code = row.querySelector('.line-code').value;
    const lineType = row.querySelector('.line-type').value;
    const amt = parseFloat(row.querySelector('.line-amt').value) || 0;

    if (!code || amt <= 0) isValid = false;

    const coaItem = coaMaster.find((a) => String(a.code) === String(code));

    lines.push({
      account_code: code,
      account_name: coaItem ? coaItem.name : '',
      debit: lineType === 'Dr' ? amt : 0,
      credit: lineType === 'Cr' ? amt : 0
    });
  });

  if (!isValid) {
    alert('Please enter valid positive amounts for all voucher rows.');
    return;
  }

  const newVoucher = {
    voucher_id: 'VOUCH-' + Date.now().toString().slice(-6),
    type,
    date,
    total_amount: totalDr,
    lines
  };

  transactions.push(newVoucher);
  localStorage.setItem('caas_ledger_state', JSON.stringify(transactions));

  renderTrialBalance();
  renderAuditTrail();

  document.getElementById('lineItemsBody').innerHTML = '';
  addLineRow('Dr');
  addLineRow('Cr');
});

// Initial Setup Calls
renderCOATable();
addLineRow('Dr');
addLineRow('Cr');
renderTrialBalance();
renderAuditTrail();