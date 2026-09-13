import './style.css';

// Initialize ledger state from LocalStorage or empty array
let transactions = JSON.parse(localStorage.getItem('caas_ledger_state')) || [];

const app = document.getElementById('app');

// Render complete UI
app.innerHTML = `
  <div class="container">
    <h2>CAAS ERP - General Ledger & Trial Balance</h2>
    
    <!-- Voucher Input Form -->
    <div class="card">
      <div class="form-group">
        <label>Voucher Type:</label>
        <select id="vType">
          <option value="JV">Journal Voucher</option>
          <option value="BP">Bank Payment</option>
          <option value="BR">Bank Receipt</option>
        </select>
      </div>

      <div class="form-group">
        <label>Voucher Date:</label>
        <input type="date" id="vDate" value="${new Date().toISOString().split('T')[0]}" />
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label>Debit Account Code:</label>
          <input type="text" id="drCode" placeholder="e.g. 1001" />
        </div>
        <div class="form-group">
          <label>Debit Amount (₹):</label>
          <input type="number" id="drAmt" step="0.01" placeholder="0.00" />
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label>Credit Account Code:</label>
          <input type="text" id="crCode" placeholder="e.g. 2001" />
        </div>
        <div class="form-group">
          <label>Credit Amount (₹):</label>
          <input type="number" id="crAmt" step="0.01" placeholder="0.00" />
        </div>
      </div>

      <button id="postBtn" class="btn-primary">Post Voucher</button>
    </div>

    <!-- Trial Balance Module -->
    <h3>Real-Time Trial Balance</h3>
    <div class="card">
      <table id="tbTable" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc;">
            <th style="padding: 8px;">Account Code</th>
            <th style="padding: 8px; text-align: right;">Total Debit (₹)</th>
            <th style="padding: 8px; text-align: right;">Total Credit (₹)</th>
            <th style="padding: 8px; text-align: right;">Net Balance (₹)</th>
          </tr>
        </thead>
        <tbody id="tbBody"></tbody>
        <tfoot>
          <tr id="tbFooter" style="border-top: 2px solid #333; font-weight: bold;"></tr>
        </tfoot>
      </table>
    </div>

    <!-- Posted Transactions Log -->
    <h3>Posted Transactions Log</h3>
    <pre id="log" class="log-box">${JSON.stringify(transactions, null, 2)}</pre>
  </div>
`;

// Calculate & Render Trial Balance
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
    tbBody.innerHTML = `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #666;">No posted vouchers yet.</td></tr>`;
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
    row.style.borderBottom = '1px solid #eee';
    row.innerHTML = `
      <td style="padding: 8px;"><strong>${code}</strong></td>
      <td style="padding: 8px; text-align: right;">${dr.toFixed(2)}</td>
      <td style="padding: 8px; text-align: right;">${cr.toFixed(2)}</td>
      <td style="padding: 8px; text-align: right; color: ${net >= 0 ? '#10b981' : '#ef4444'}; font-weight: 500;">
        ${Math.abs(net).toFixed(2)} ${net >= 0 ? 'Dr' : 'Cr'}
      </td>
    `;
    tbBody.appendChild(row);
  });

  const isBalanced = Math.abs(grandDebit - grandCredit) < 0.01;

  tbFooter.innerHTML = `
    <td style="padding: 8px;">Total (${isBalanced ? 'Balanced' : 'Unbalanced'})</td>
    <td style="padding: 8px; text-align: right;">${grandDebit.toFixed(2)}</td>
    <td style="padding: 8px; text-align: right;">${grandCredit.toFixed(2)}</td>
    <td style="padding: 8px; text-align: right; color: ${isBalanced ? '#10b981' : '#ef4444'};">
      ${isBalanced ? '✓ Balanced' : '✗ Difference'}
    </td>
  `;
}

// Initial render of Trial Balance
renderTrialBalance();

// Voucher Posting Event Handler
document.getElementById('postBtn').addEventListener('click', () => {
  const type = document.getElementById('vType').value;
  const date = document.getElementById('vDate').value;
  const drCode = document.getElementById('drCode').value.trim();
  const drAmt = parseFloat(document.getElementById('drAmt').value) || 0;
  const crCode = document.getElementById('crCode').value.trim();
  const crAmt = parseFloat(document.getElementById('crAmt').value) || 0;

  if (!drCode || !crCode) {
    alert('Please provide valid Debit and Credit account codes.');
    return;
  }

  if (drAmt <= 0 || crAmt <= 0 || drAmt !== crAmt) {
    alert('Debit and Credit amounts must be non-zero and equal.');
    return;
  }

  const newVoucher = {
    voucher_id: 'VOUCH-' + Date.now().toString().slice(-6),
    type,
    date,
    lines: [
      { account_code: drCode, debit: drAmt, credit: 0 },
      { account_code: crCode, debit: 0, credit: crAmt }
    ]
  };

  transactions.push(newVoucher);
  localStorage.setItem('caas_ledger_state', JSON.stringify(transactions));

  document.getElementById('log').textContent = JSON.stringify(transactions, null, 2);
  renderTrialBalance();

  // Reset inputs
  document.getElementById('drCode').value = '';
  document.getElementById('drAmt').value = '';
  document.getElementById('crCode').value = '';
  document.getElementById('crAmt').value = '';
});