"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useLocale } from "next-intl";
import { Input, Select } from "@/components/atoms";
import { Employee, Payroll } from "@/types/employee";
import { payrollService } from "@/services/payroll.service";
import { employeesService } from "@/services/employees.service";
import { toastService } from "@/services/toast.service";
import { usePayrollTranslations } from "./PayrollTranslations.i18n";

export interface PayrollFormRef {
  submit: () => void;
}

interface PayrollFormProps {
  payroll?: Payroll | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange: (isValid: boolean) => void;
}

const PayrollForm = forwardRef<PayrollFormRef, PayrollFormProps>(({
  payroll,
  onClose,
  onSuccess,
  onSavingChange,
  onValidChange
}, ref) => {
  const locale = useLocale();
  const t = usePayrollTranslations(locale);
  
  const [formData, setFormData] = useState<Partial<Payroll>>({
    employee_id: "",
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    base_salary: 0,
    status: "pending",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (payroll) {
      setFormData({
        employee_id: payroll.employee_id,
        period_start: new Date(payroll.period_start).toISOString().split('T')[0],
        period_end: new Date(payroll.period_end).toISOString().split('T')[0],
        base_salary: payroll.base_salary,
        net_pay: payroll.net_pay,
        status: payroll.status,
      });
    } else {
      setFormData({
        employee_id: "",
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        base_salary: 0,
        net_pay: 0,
        status: "pending",
      });
    }
  }, [payroll]);

  const loadEmployees = async () => {
    try {
      const response = await employeesService.getEmployees(1, undefined, true, 100);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error loading employees", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.employee_id) {
      newErrors.employee_id = `${t("employee")} ${t("required")}`;
      isValid = false;
    }

    if (!formData.period_start) {
      newErrors.period_start = `${t("periodStart")} ${t("required")}`;
      isValid = false;
    }

    if (!formData.period_end) {
      newErrors.period_end = `${t("periodEnd")} ${t("required")}`;
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
    if (!validateForm()) return;

    onSavingChange(true);

    try {
      if (payroll) {
        await payrollService.updatePayroll(payroll.id, formData);
        toastService.success(t("messages.updateSuccess"));
      } else {
        await payrollService.generatePayroll(formData);
        toastService.success(t("messages.createSuccess"));
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving payroll:", error);
      toastService.error(error instanceof Error ? error.message : t("messages.errorSaving"));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  const handleInputChange = (field: keyof Payroll, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : 'es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  return (
    <form className="space-y-6">
      <Select
        id="employee_id"
        label={t("employee")}
        value={formData.employee_id || ""}
        onChange={(e) => handleInputChange("employee_id", e.target.value)}
        options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
        placeholder={t("selectEmployee")}
        error={errors.employee_id}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          id="period_start"
          label={t("periodStart")}
          value={formData.period_start || ""}
          onChange={(e) => handleInputChange("period_start", e.target.value)}
          error={errors.period_start}
        />
        <Input
          type="date"
          id="period_end"
          label={t("periodEnd")}
          value={formData.period_end || ""}
          onChange={(e) => handleInputChange("period_end", e.target.value)}
          error={errors.period_end}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          id="base_salary"
          label={t("baseSalary")}
          value={formData.base_salary || 0}
          onChange={(e) => handleInputChange("base_salary", parseFloat(e.target.value))}
        />
        <Input
          type="number"
          id="net_pay"
          label={t("netPay")}
          value={formData.net_pay || 0}
          onChange={(e) => handleInputChange("net_pay", parseFloat(e.target.value))}
        />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{t("netPay")}</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(formData.net_pay || 0)}</span>
        </div>
      </div>

      <Select
        id="status"
        label={t("status")}
        value={formData.status || "pending"}
        onChange={(e) => handleInputChange("status", e.target.value)}
        options={[
          { value: "pending", label: t("statuses.pending") },
          { value: "paid", label: t("statuses.paid") },
          { value: "cancelled", label: t("statuses.cancelled") }
        ]}
        placeholder={t("selectStatus")}
      />
    </form>
  );
});

PayrollForm.displayName = "PayrollForm";

export default PayrollForm;
