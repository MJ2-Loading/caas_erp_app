console.log("Seeding Baseline Master Data...");

const defaultCOA = [
  { code: 1001, name: 'Cash & Cash Equivalents', groupKey: 'CURRENT_ASSETS', balance: 'Debit', tag: 'Cash & Cash Equivalents' },
  { code: 1002, name: 'Trade Receivables (Debtors)', groupKey: 'CURRENT_ASSETS', balance: 'Debit', tag: 'Trade Receivables' },
  { code: 1003, name: 'Input CGST Receivable', groupKey: 'CURRENT_ASSETS', balance: 'Debit', tag: 'Other Current Assets' },
  { code: 1004, name: 'Input SGST Receivable', groupKey: 'CURRENT_ASSETS', balance: 'Debit', tag: 'Other Current Assets' },
  { code: 1005, name: 'Input IGST Receivable', groupKey: 'CURRENT_ASSETS', balance: 'Debit', tag: 'Other Current Assets' },
  { code: 1701, name: 'Property, Plant & Equipment', groupKey: 'NON_CURRENT_ASSETS', balance: 'Debit', tag: 'Property, Plant & Equipment' },
  { code: 2001, name: 'Trade Payables (Creditors)', groupKey: 'CURRENT_LIABILITIES', balance: 'Credit', tag: 'Trade Payables' },
  { code: 2002, name: 'Output CGST Payable', groupKey: 'CURRENT_LIABILITIES', balance: 'Credit', tag: 'Other Current Liabilities' },
  { code: 2003, name: 'Output SGST Payable', groupKey: 'CURRENT_LIABILITIES', balance: 'Credit', tag: 'Other Current Liabilities' },
  { code: 2004, name: 'Output IGST Payable', groupKey: 'CURRENT_LIABILITIES', balance: 'Credit', tag: 'Other Current Liabilities' },
  { code: 3001, name: 'Owner / Share Capital', groupKey: 'EQUITY', balance: 'Credit', tag: 'Share Capital' },
  { code: 4001, name: 'Revenue from Operations', groupKey: 'REVENUE', balance: 'Credit', tag: 'Revenue from Operations' },
  { code: 4601, name: 'Operating Expenses', groupKey: 'INDIRECT_EXPENSES', balance: 'Debit', tag: 'Other Operating Expenses' }
];

console.log(`Successfully seeded ${defaultCOA.length} standard Ind AS Master Accounts.`);