export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  hire_date: string;
  status: 'active' | 'inactive';
  department_id?: string;
  position_id?: string;
  manager_id?: string;
  user_id?: string;
  salary?: number;
  created_at: string;
  updated_at: string;
  department?: Department;
  position?: Position;
  manager?: Employee;
  user?: { id: string; name: string; email: string };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  manager?: Employee;
  employees?: Employee[];
  _count?: {
    employees: number;
  };
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  min_salary?: number;
  max_salary?: number;
  salary_range?: {
    min: number;
    max: number;
  };
  created_at: string;
  updated_at: string;
  department_id?: string;
  department?: Department;
  _count?: {
    employees: number;
  };
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  days_count: number;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface Payroll {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  net_pay: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  document_type: string;
  file_url: string;
  file_path?: string;
  issue_date?: string;
  expiry_date: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface EmployeeForm {
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  hire_date: string;
  status: 'active' | 'inactive';
  department_id?: string;
  position_id?: string;
  manager_id?: string;
  salary?: number;
}
