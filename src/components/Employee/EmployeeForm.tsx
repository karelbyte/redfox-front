"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Employee, type EmployeeForm as EmployeeFormData } from "@/types/employee";
import { useEmployeeTranslations } from "./useEmployeeTranslations.i18n";
import { Input, Select } from "@/components/atoms";
import { departmentsService } from "@/services/departments.service";
import { positionsService } from "@/services/positions.service";
import { employeesService } from "@/services/employees.service";
import { toast } from "react-hot-toast";

export interface EmployeeFormRef {
  submit: () => void;
}

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange: (isValid: boolean) => void;
}

const EmployeeForm = forwardRef<EmployeeFormRef, EmployeeFormProps>(({
  employee,
  onClose,
  onSuccess,
  onSavingChange,
  onValidChange
}, ref) => {
  const t = useEmployeeTranslations();
  
  const [formData, setFormData] = useState<any>({
    employee_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    hire_date: "",
    status: "active",
    department_id: "",
    position_id: "",
    manager_id: "",
    salary: undefined,
  });

  const [errors, setErrors] = useState<any>({});
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([]);
  const [positions, setPositions] = useState<Array<{id: string, title: string}>>([]);
  const [managers, setManagers] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_code: employee.employee_code,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email || "",
        phone: employee.phone || "",
        hire_date: employee.hire_date,
        status: employee.status,
        department_id: employee.department_id || "",
        position_id: employee.position_id || "",
        manager_id: employee.manager_id || "",
        salary: employee.salary,
      });
    } else {
      setFormData({
        employee_code: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        hire_date: "",
        status: "active",
        department_id: "",
        position_id: "",
        manager_id: "",
        salary: undefined,
      });
    }

    loadDepartments();
    loadPositions();
    loadManagers();
  }, [employee]);

  const loadDepartments = async () => {
    try {
      const response = await departmentsService.getDepartments(1, "", 100);
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const loadPositions = async () => {
    try {
      const response = await positionsService.getPositions(1, "", 100);
      setPositions(response.data || []);
    } catch (error) {
      console.error("Error loading positions:", error);
    }
  };

  const loadManagers = async () => {
    try {
      // Los gerentes son otros empleados
      const response = await employeesService.getEmployees(1, "", undefined, 100);
      // Filtrar el empleado actual para que no sea su propio gerente
      const filteredManagers = employee
        ? response.data.filter((m: Employee) => m.id !== employee.id)
        : response.data;

      setManagers(filteredManagers.map((m: Employee) => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`
      })));
    } catch (error) {
      console.error("Error loading managers:", error);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;
    
    if (!formData.employee_code.trim()) {
      newErrors.employee_code = `${t("employeeCode")} ${t("required")}`;
      isValid = false;
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = `${t("firstName")} ${t("required")}`;
      isValid = false;
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = `${t("lastName")} ${t("required")}`;
      isValid = false;
    }
    if (!formData.hire_date) {
      newErrors.hire_date = `${t("hireDate")} ${t("required")}`;
      isValid = false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }
    if (formData.salary === undefined || formData.salary === null || isNaN(formData.salary)) {
      newErrors.salary = `${t("salary")} ${t("required")}`;
      isValid = false;
    }

    setErrors(newErrors);
    onValidChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    onSavingChange(true);

    try {
      if (employee?.id) {
        await employeesService.updateEmployee(employee.id, formData);
        toast.success(t("messages.success"));
      } else {
        await employeesService.createEmployee(formData);
        toast.success(t("messages.success"));
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast.error(error.message || t("messages.error"));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number | undefined) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-6">
      <Input
        type="text"
        id="employee_code"
        label={t("employeeCode")}
        required
        value={formData.employee_code}
        onChange={(e) => handleInputChange("employee_code", e.target.value)}
        error={errors.employee_code}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="text"
          id="first_name"
          label={t("firstName")}
          required
          value={formData.first_name}
          onChange={(e) => handleInputChange("first_name", e.target.value)}
          error={errors.first_name}
        />

        <Input
          type="text"
          id="last_name"
          label={t("lastName")}
          required
          value={formData.last_name}
          onChange={(e) => handleInputChange("last_name", e.target.value)}
          error={errors.last_name}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="email"
          id="email"
          label={t("email")}
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={errors.email}
        />

        <Input
          type="tel"
          id="phone"
          label={t("phone")}
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          id="hire_date"
          label={t("hireDate")}
          required
          value={formData.hire_date}
          onChange={(e) => handleInputChange("hire_date", e.target.value)}
          error={errors.hire_date}
        />

        <Select
          id="status"
          label={t("status")}
          value={formData.status}
          onChange={(e) => handleInputChange("status", e.target.value as 'active' | 'inactive')}
          options={[
            { value: "active", label: t("active") },
            { value: "inactive", label: t("inactive") }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="department_id"
          label={t("department")}
          value={formData.department_id}
          onChange={(e) => handleInputChange("department_id", e.target.value)}
          placeholder={t("selectDepartment") || "Seleccionar..."}
          options={departments.map(d => ({ value: d.id, label: d.name }))}
        />

        <Select
          id="position_id"
          label={t("position")}
          value={formData.position_id}
          onChange={(e) => handleInputChange("position_id", e.target.value)}
          placeholder={t("selectPosition") || "Seleccionar..."}
          options={positions.map(p => ({ value: p.id, label: p.title }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="manager_id"
          label={t("manager")}
          value={formData.manager_id}
          onChange={(e) => handleInputChange("manager_id", e.target.value)}
          placeholder={t("selectManager") || "Seleccionar..."}
          options={managers.map(m => ({ value: m.id, label: m.name }))}
        />

        <Input
          type="number"
          id="salary"
          label={t("salary")}
          required
          value={formData.salary || ""}
          onChange={(e) => handleInputChange("salary", e.target.value ? parseFloat(e.target.value) : undefined)}
          error={errors.salary}
          min="0"
          step="0.01"
        />
      </div>
    </form>
  );
});

EmployeeForm.displayName = "EmployeeForm";

export default EmployeeForm;
