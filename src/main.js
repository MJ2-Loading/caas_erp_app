// ==========================================
// 1. CAAS STATE ENGINE CLASS
// ==========================================
class CAASStateEngine {
    constructor() {
        this.storageKey = 'caas_erp_state';
        this.state = this.loadState() || {
            company_master: { name: 'CAAS Enterprise', fy: '2026-27' },
            chart_of_accounts: [],
            vouchers: []
        };
    }

    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : null;
    }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    getState() {
        return this.state;
    }

    postVoucher(payload) {
        // Validate Debit / Credit Sum Equality
        const totalDebit = payload.lines.reduce((acc, l) => acc + (l.debit || 0), 0);
        const totalCredit = payload.lines.reduce((acc, l) => acc + (l.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new Error(`Imbalanced Voucher: Total Debit (${totalDebit}) must equal Total Credit (${totalCredit}).`);
        }

        const voucher = {
            voucherId: 'VOUCH-' + Date.now(),
            timestamp: new Date().toISOString(),
            ...payload
        };

        this.state.vouchers.push(voucher);
        this.saveState();
        return voucher;
    }
}

// Initialize Engine globally on window
window.caasEngine = new CAASStateEngine();

// ==========================================
// 2. RENDER HTML INTERFACE
// ==========================================
const app = document.getElementById('app');

app.innerHTML = `
  <div style="max-width: 800px; margin: 2rem auto; font-family: sans-serif; padding: 0 1rem;">
    <h2>CAAS ERP - General Ledger Entry</h2>
    
    <div id="statusMessage" style="margin-bottom: 1rem; padding: 0.75rem; display: none; border-radius: 4px;"></div>

    <form id="voucherForm" style="display: grid; gap: 1rem; background: #f9f9f9; padding: 1.5rem; border: 1px solid #ddd; border-radius: 6px;">
      <div>
        <label><strong>Voucher Type:</strong></label><br/>
        <select id="voucherType" style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
          <option value="JOURNAL">Journal Voucher</option>
          <option value="PAYMENT">Payment</option>
          <option value="RECEIPT">Receipt</option>
        </select>
      </div>

      <div>
        <label><strong>Voucher Date:</strong></label><br/>
        <input type="date" id="voucherDate" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;" />
      </div>

      <hr style="width: 100%; border: 0; border-top: 1px solid #ccc; margin: 0.5rem 0;" />

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <label><strong>Debit Account Code:</strong></label>
          <input type="text" id="debitAccount" placeholder="e.g. 1001" required style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;" />
        </div>
        <div>
          <label><strong>Debit Amount (₹):</strong></label>
          <input type="number" id="debitAmount" step="0.01" placeholder="0.00" required style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <label><strong>Credit Account Code:</strong></label>
          <input type="text" id="creditAccount" placeholder="e.g. 2001" required style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;" />
        </div>
        <div>
          <label><strong>Credit Amount (₹):</strong></label>
          <input type="number" id="creditAmount" step="0.01" placeholder="0.00" required style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;" />
        </div>
      </div>

      <button type="submit" style="padding: 0.75rem; background: #0066cc; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 0.5rem;">
        Post Voucher
      </button>
    </form>

    <h3 style="margin-top: 2rem;">Posted Transactions Log</h3>
    <pre id="transactionLog" style="background: #1e1e1e; color: #00ff00; padding: 1rem; border-radius: 4px; overflow-x: auto; max-height: 250px;"></pre>
  </div>
`;

// ==========================================
// 3. UI FORM EVENT HANDLERS & BINDINGS
// ==========================================
const voucherForm = document.getElementById('voucherForm');
const statusBox = document.getElementById('statusMessage');
const transactionLog = document.getElementById('transactionLog');

function updateLog() {
    const state = window.caasEngine.getState();
    transactionLog.textContent = JSON.stringify(state.vouchers, null, 2);
}

voucherForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const voucherType = document.getElementById('voucherType').value;
    const voucherDate = document.getElementById('voucherDate').value;
    const debitAccount = document.getElementById('debitAccount').value;
    const debitAmount = parseFloat(document.getElementById('debitAmount').value || 0);
    const creditAccount = document.getElementById('creditAccount').value;
    const creditAmount = parseFloat(document.getElementById('creditAmount').value || 0);

    const payload = {
        type: voucherType,
        date: voucherDate,
        lines: [
            { accountId: debitAccount, debit: debitAmount, credit: 0 },
            { accountId: creditAccount, debit: 0, credit: creditAmount }
        ]
    };

    try {
        const result = window.caasEngine.postVoucher(payload);
        
        statusBox.style.display = 'block';
        statusBox.style.background = '#d4edda';
        statusBox.style.color = '#155724';
        statusBox.textContent = `Voucher ${result.voucherId} successfully posted!`;

        voucherForm.reset();
        document.getElementById('voucherDate').value = new Date().toISOString().split('T')[0];
        updateLog();

    } catch (err) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#f8d7da';
        statusBox.style.color = '#721c24';
        statusBox.textContent = `Validation Error: ${err.message}`;
    }
});

// Initial log update on page load
updateLog();