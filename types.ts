

export enum AppView {
  DASHBOARD = 'dashboard',
  SOURCES = 'sources',
  OPERATIONS = 'operations',
  REPORTS = 'reports',
  EMPLOYEES = 'employees',
  ACCOUNTING = 'accounting',
  REGISTRY = 'registry',
  STATEMENTS = 'statements',
  USERS_MANAGEMENT = 'users_management'
}

export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  SALES = 'sales',
  WAREHOUSE = 'warehouse'
}

export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PRINT = 'print',
  EXPORT = 'export',
  VIEW_COSTS = 'view_costs',
  VIEW_PROFIT_LOSS = 'view_profit_loss',
  VIEW_ALERTS = 'view_alerts',
  GIVE_DISCOUNT = 'give_discount',
  MANAGE_PRICES = 'manage_prices',
  MANAGE_STOCKS = 'manage_stocks',
  VOID_TRANSACTION = 'void_transaction',
  EDIT_CLOSED_PERIOD = 'edit_closed_period'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  permissions?: PermissionAction[];
  avatar?: string;
}

export interface Supplier { id: string; name: string; contact: string; category: string; rating: number; }
export interface Customer { id: string; name: string; phone: string; address: string; }
export interface Warehouse { id: string; name: string; location: string; manager: string; }
export interface Branch { id: string; name: string; city: string; }
export interface Safe { id: string; name: string; balance: number; }

export interface WarehouseStock {
  warehouseId: string;
  quantity: number;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  baseSalary: number;
  phone: string;
  joiningDate: string;
  status: 'active' | 'on_leave' | 'terminated';
  branchId: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  bonus: number;
  deduction: number;
  netSalary: number;
  date: string;
  safeId: string;
}

export interface AccountingEntry {
  id: string;
  date: string;
  type: 'expense' | 'revenue';
  category: string;
  amount: number;
  safeId: string;
  note: string;
  branchId?: string;
  entityId?: string; 
  entityType?: 'customer' | 'supplier';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost?: number;
  minThreshold: number;
  stocks: WarehouseStock[];
  unit: string;
  packaging: string;
  itemsPerBox: number;
  branchId: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  boxQuantity?: number;
  pieceQuantity?: number;
  price: number;
  cost: number; 
  unit: string;
  packaging: string;
  lossQuantity?: number;
  discount?: number;
}

export interface Transaction {
  id: string;
  date: string;
  totalAmount: number;
  totalCost?: number; 
  type: 'sale' | 'purchase' | 'loss' | 'transfer' | 'salary' | 'accounting';
  items: TransactionItem[];
  entityId?: string; 
  entityName?: string;
  warehouseId?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  branchId?: string;
  safeId?: string;
}

// Added ChatMessage interface to resolve import errors in services/geminiService.ts and components/AIAssistant.tsx
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  groundingUrls?: { title: string; uri: string }[];
}
