// Initialize ledger state safely from LocalStorage
let transactions = [];
try {
  transactions = JSON.parse(localStorage.getItem('caas_ledger_state')) || [];
} catch (e) {
  transactions = [];
}

const app = document.getElementById('app');

app.innerHTML = `
  <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 950px; margin: 20px auto; padding: 0 20px; color: #1f2937;">
    <h2 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">CAAS ERP - Multi-Line General Ledger & Trial Balance</h2>
    
    <!-- Voucher Input Form -->
    <div style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px;">
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1;">
          <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Voucher Type:</label>
          <select id="vType" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
            <option value="JV">Journal Voucher (JV)</option>
            <option value="BP">Bank Payment (BP)</option>
            <option value="BR">Bank Receipt (BR)</option>
            <option value="CP">Cash Payment (CP)</option>
            <option value="CR">Cash Receipt (CR)</option>
          </select>
        </div>

        <div style="flex: 1;">
          <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Voucher Date:</label>
          <input type="date" id="vDate" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
        </div>
      </div>

      <!-- Line Items Table -->
      <h4 style="margin: 15px 0 10px 0;">Voucher Entries</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; color: #4b5563;">
            <th style="padding: 10px; width: 35%;">Account Code / Description</th>
            <th style="padding: 10px; width: 20%;">Type (Dr/Cr)</th>
            <th style="padding: 10px; width: 30%;">Amount (₹)</th>
            <th style="padding: 10px; width: 15%; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody id="lineItemsBody"></tbody>
      </table>

      <button id="addLineBtn" type="button" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 14px; font-weight: 600; border-radius: 6px; cursor: pointer; font-size: 13px; margin-bottom: 20px;">
        + Add Line Item
      </button>

      <!-- Totals & Balance Status Bar -->
      <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="font-size: 14px;">
          <span>Total Dr: <strong id="sumDr">₹0.00</strong></span> | 
          <span>Total Cr: <strong id="sumCr">₹0.00</strong></span>
        </div>
        <div id="balanceStatus" style="font-weight: 600; font-size: 14px; color: #ef4444;">
          Imbalance: ₹0.00
        </div>
      </div>

      <button id="postBtn" class="btn-primary" style="width: 100%; background-color: #0284c7; color: white; padding: 12px; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Post Voucher
      </button>
    </div>

    <!-- Real-Time Trial Balance -->
    <h3 style="margin-bottom: 12px;">Real-Time Trial Balance</h3>
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb; color: #4b5563;">
            <th style="padding: 10px;">Account Code</th>
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

    <!-- Posted Transactions Log -->
    <h3 style="margin-bottom: 12px;">Posted Transactions Log</h3>
    <pre id="log" style="background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 13px;">${JSON.stringify(transactions, null, 2)}</pre>
  </div>
`;

// Render dynamic rows for the voucher input form
function addLineRow(defaultType = 'Dr') {
  const tbody = document.getElementById('lineItemsBody');
  const row = document.createElement('tr');
  row.className = 'line-row';
  row.style.borderBottom = '1px solid #f3f4f6';
  row.innerHTML = `
    <td style="padding: 8px;">
      <input type="text" class="line-code" placeholder="e.g. 1001" style="width: 95%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" />
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

  // Attach event listeners for real-time validation updates
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

// Calculate running voucher totals and balance status
function calculateVoucherTotals() {
  let totalDr = 0;
  let totalCr = 0;

  document.querySelectorAll('.line-row').forEach((row) => {
    const type = row.querySelector('.line-type').value;
    const amt = parseFloat(row.querySelector('.line-amt').value) || 0;

    if (type === 'Dr') {
      totalDr += amt;
    } else {
      totalCr += amt;
    }
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

// Initialize default entry rows (1 Debit, 1 Credit)
addLineRow('Dr');
addLineRow('Cr');

document.getElementById('addLineBtn').addEventListener('click', () => addLineRow('Cr'));

// Aggregation Engine for Trial Balance
function renderTrialBalance() {
  const accountBalances = {};

  transactions.forEach((v) => {
    v.lines.forEach((line) => {
      if (!accountBalances[line.account_code]) {
        accountBalances[line.account_code] = { debit: 0, credit: 0 };
      }
      accountBalances[line.account_code].debit += Number(line.debit) || 0;
      accountBalances[line.account_code].credit += Number(line.credit) || 0;
    });
  });

  const tbBody = document.getElementById('tbBody');
  const tbFooter = document.getElementById('tbFooter');
  
  tbBody.innerHTML = '';
  let grandDebit = 0;
  let grandCredit = 0;

  const codes = Object.keys(accountBalances).sort();

  if (codes.length === 0) {
    tbBody.innerHTML = `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #6b7280;">No posted vouchers yet.</td></tr>`;
    tbFooter.innerHTML = '';
    return;
  }

  codes.forEach((code) => {
    const dr = accountBalances[code].debit;
    const cr = accountBalances[code].credit;
    const net = dr - cr;

    grandDebit += dr;
    grandCredit += cr;

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #f3f4f6';
    row.innerHTML = `
      <td style="padding: 10px;"><strong>${code}</strong></td>
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
    <td style="padding: 10px;">Total (${isBalanced ? 'Balanced' : 'Unbalanced'})</td>
    <td style="padding: 10px; text-align: right;">${grandDebit.toFixed(2)}</td>
    <td style="padding: 10px; text-align: right;">${grandCredit.toFixed(2)}</td>
    <td style="padding: 10px; text-align: right; color: ${isBalanced ? '#10b981' : '#ef4444'};">
      ${isBalanced ? '✓ Balanced' : '✗ Difference'}
    </td>
  `;
}

renderTrialBalance();

// Voucher Posting Event Handler
document.getElementById('postBtn').addEventListener('click', () => {
  const type = document.getElementById('vType').value;
  const date = document.getElementById('vDate').value;
  const { totalDr, totalCr, isBalanced } = calculateVoucherTotals();

  if (!isBalanced) {
    alert('Cannot post voucher. Total Debits must equal Total Credits and be greater than ₹0.00.');
    return;
  }

  const lines = [];
  let isValid = true;

  document.querySelectorAll('.line-row').forEach((row) => {
    const code = row.querySelector('.line-code').value.trim();
    const lineType = row.querySelector('.line-type').value;
    const amt = parseFloat(row.querySelector('.line-amt').value) || 0;

    if (!code || amt <= 0) {
      isValid = false;
    }

    lines.push({
      account_code: code,
      debit: lineType === 'Dr' ? amt : 0,
      credit: lineType === 'Cr' ? amt : 0
    });
  });

  if (!isValid) {
    alert('Please fill out valid account codes and positive amounts for all line items.');
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

  document.getElementById('log').textContent = JSON.stringify(transactions, null, 2);
  renderTrialBalance();

  // Reset form to clean default state
  document.getElementById('lineItemsBody').innerHTML = '';
  addLineRow('Dr');
  addLineRow('Cr');
});