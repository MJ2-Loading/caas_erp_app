// scripts/rbac.js
console.log("Initializing CAAS ERP Role-Based Access Control (RBAC)...");

const roles = {
  ADMIN: {
    roleName: "Administrator",
    permissions: [
      "CREATE_VOUCHER",
      "POST_VOUCHER",
      "CLOSE_PERIOD",
      "REOPEN_PERIOD",
      "VIEW_AUDIT_LOGS",
      "MANAGE_USERS",
      "EXPORT_FINANCIAL_STATEMENTS"
    ]
  },
  FINANCE_MANAGER: {
    roleName: "Finance Manager / CA",
    permissions: [
      "CREATE_VOUCHER",
      "POST_VOUCHER",
      "CLOSE_PERIOD",
      "VIEW_AUDIT_LOGS",
      "EXPORT_FINANCIAL_STATEMENTS"
    ]
  },
  ACCOUNTANT: {
    roleName: "Junior Accountant",
    permissions: [
      "CREATE_VOUCHER",
      "VIEW_REPORTS"
    ]
  },
  AUDITOR: {
    roleName: "External Auditor",
    permissions: [
      "VIEW_AUDIT_LOGS",
      "EXPORT_FINANCIAL_STATEMENTS",
      "VIEW_REPORTS"
    ]
  }
};

function hasPermission(role, requiredPermission) {
  if (!roles[role]) return false;
  return roles[role].permissions.includes(requiredPermission);
}

// Verification Sanity Check
console.log("Verifying RBAC Permissions Matrix:");
console.log(" - Admin can Close Period:", hasPermission("ADMIN", "CLOSE_PERIOD")); // true
console.log(" - Accountant can Close Period:", hasPermission("ACCOUNTANT", "CLOSE_PERIOD")); // false
console.log(" - Auditor can View Audit Logs:", hasPermission("AUDITOR", "VIEW_AUDIT_LOGS")); // true

console.log("RBAC Setup Successfully Initialized.");