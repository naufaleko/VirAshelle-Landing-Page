export type ProjectStatus = 'briefing' | 'concept' | 'production' | 'review' | 'completed' | 'on_hold';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Project = {
  id: string;
  title: string;
  client: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  description: string;
  start_date: string | null;
  deadline: string | null;
  completed_at: string | null;
  progress: number;
  team: string[];
  budget: number | null;
  tags: string[];
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectUpdate = {
  id: string;
  project_id: string;
  message: string;
  author: string;
  old_status: ProjectStatus | null;
  new_status: ProjectStatus | null;
  progress: number | null;
  created_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  avatar_url: string | null;
};

// Financial Reporting & Role Types

export type UserRole = 'superadmin' | 'c_level' | 'marketing' | 'production' | 'staff';

export interface UserProfile {
  email: string;
  role: UserRole;
  name: string;
  display_alias?: string;
}

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'confirmed' | 'pending' | 'reconciled';

export type IncomeCategory = 
  | 'client_invoice'
  | 'down_payment'
  | 'final_payment'
  | 'retainer'
  | 'capital_injection'
  | 'other_income';

export type ExpenseCategory = 
  | 'project_production'
  | 'software_licenses'
  | 'equipment_rental'
  | 'marketing_ads'
  | 'office_operations'
  | 'salaries_honorarium'
  | 'sppd_travel'
  | 'petty_cash'
  | 'tax_legal'
  | 'other_expense';

export type FinancialCategory = IncomeCategory | ExpenseCategory | string;

export interface FinancialTransaction {
  id: string;
  transaction_date: string;
  type: TransactionType;
  category: FinancialCategory;
  amount: number;
  account: string;
  reference_no?: string | null;
  reference_id?: string | null;
  description: string;
  attachment_url?: string | null;
  status: TransactionStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyCashflowPoint {
  month: string;
  label: string;
  fullLabel: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  pendingReceivables: number;
  monthlyCashflow: MonthlyCashflowPoint[];
  categoryBreakdown: CategoryBreakdown[];
}
