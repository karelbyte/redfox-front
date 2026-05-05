"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useLocale } from "next-intl";
import { useLeaveRequestTranslations } from "./LeaveRequestTranslations.i18n";
import { Input, Select } from "@/components/atoms";
import { Employee, LeaveRequest } from "@/types/employee";
import { leaveRequestsService } from "@/services/leave-requests.service";
import { employeesService } from "@/services/employees.service";
import { toastService } from "@/services/toast.service";

export interface LeaveRequestFormRef {
  submit: () => void;
}

interface LeaveRequestFormProps {
  leaveRequest?: LeaveRequest | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange: (isValid: boolean) => void;
}

const LeaveRequestForm = forwardRef<LeaveRequestFormRef, LeaveRequestFormProps>(({
  leaveRequest,
  onClose,
  onSuccess,
  onSavingChange,
  onValidChange
}, ref) => {
  const locale = useLocale();
  const t = useLeaveRequestTranslations(locale);
  
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    employee_id: "",
    leave_type: "vacation",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    days_count: 1,
    status: "pending",
    reason: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        employee_id: leaveRequest.employee_id,
        leave_type: leaveRequest.leave_type,
        start_date: new Date(leaveRequest.start_date).toISOString().split('T')[0],
        end_date: new Date(leaveRequest.end_date).toISOString().split('T')[0],
        days_count: leaveRequest.days_count,
        status: leaveRequest.status,
        reason: leaveRequest.reason || "",
      });
    } else {
      setFormData({
        employee_id: "",
        leave_type: "vacation",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        days_count: 1,
        status: "pending",
        reason: "",
      });
    }
  }, [leaveRequest]);

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

    if (!formData.start_date) {
      newErrors.start_date = `${t("startDate")} ${t("required")}`;
      isValid = false;
    }

    if (!formData.end_date) {
      newErrors.end_date = `${t("endDate")} ${t("required")}`;
      isValid = false;
    }

    if (new Date(formData.start_date!) > new Date(formData.end_date!)) {
      newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
      isValid = false;
    }

    if (!formData.days_count || formData.days_count <= 0) {
      newErrors.days_count = "Debe ser mayor a 0";
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
      const payload: any = {
        employee_id: formData.employee_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days_count: formData.days_count,
        status: formData.status,
        reason: formData.reason,
      };

      if (leaveRequest) {
        await leaveRequestsService.updateLeaveRequest(leaveRequest.id, payload);
        toastService.success(t("messages.updateSuccess"));
      } else {
        await leaveRequestsService.createLeaveRequest(payload);
        toastService.success(t("messages.createSuccess"));
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving leave request:", error);
      toastService.error(error instanceof Error ? error.message : t("messages.errorSaving"));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  const handleInputChange = (field: keyof LeaveRequest, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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
        disabled={!!leaveRequest} // Don't allow changing employee after creation
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="leave_type"
          label={t("leaveType")}
          value={formData.leave_type || ""}
          onChange={(e) => handleInputChange("leave_type", e.target.value)}
          options={[
            { value: "vacation", label: t("types.vacation") },
            { value: "sick", label: t("types.sick_leave") },
            { value: "personal", label: t("types.personal_leave") },
            { value: "maternity", label: t("types.maternity_leave") },
            { value: "paternity", label: t("types.paternity_leave") }
          ]}
          placeholder={t("selectLeaveType")}
          error={errors.leave_type}
        />

        <Input
          type="number"
          id="days_count"
          label={t("days")}
          required
          value={formData.days_count || ""}
          onChange={(e) => handleInputChange("days_count", parseInt(e.target.value, 10))}
          error={errors.days_count}
          min="1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          id="start_date"
          label={t("startDate")}
          required
          value={formData.start_date || ""}
          onChange={(e) => handleInputChange("start_date", e.target.value)}
          error={errors.start_date}
        />

        <Input
          type="date"
          id="end_date"
          label={t("endDate")}
          required
          value={formData.end_date || ""}
          onChange={(e) => handleInputChange("end_date", e.target.value)}
          error={errors.end_date}
        />
      </div>

      <Select
        id="status"
        label={t("status")}
        value={formData.status || ""}
        onChange={(e) => handleInputChange("status", e.target.value)}
        options={[
          { value: "pending", label: t("statuses.pending") },
          { value: "approved", label: t("statuses.approved") },
          { value: "rejected", label: t("statuses.rejected") },
          { value: "cancelled", label: t("statuses.cancelled") },
        ]}
        placeholder={t("selectStatus")}
        error={errors.status}
      />

      <Input
        type="text"
        id="reason"
        label={t("reason")}
        value={formData.reason || ""}
        onChange={(e) => handleInputChange("reason", e.target.value)}
      />
    </form>
  );
});

LeaveRequestForm.displayName = "LeaveRequestForm";

export default LeaveRequestForm;
