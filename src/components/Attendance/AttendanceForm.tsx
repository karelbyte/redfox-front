"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useLocale } from "next-intl";
import { Input, Select } from "@/components/atoms";
import { Employee, Attendance } from "@/types/employee";
import { attendanceService } from "@/services/attendance.service";
import { employeesService } from "@/services/employees.service";
import { toastService } from "@/services/toast.service";
import { useAttendanceTranslations } from "./AttendanceTranslations.i18n";

export interface AttendanceFormRef {
  submit: () => void;
}

interface AttendanceFormProps {
  attendance?: Attendance | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange: (isValid: boolean) => void;
}

const AttendanceForm = forwardRef<AttendanceFormRef, AttendanceFormProps>((
  { attendance, onClose, onSuccess, onSavingChange, onValidChange },
  ref
) => {
  const locale = useLocale();
  const t = useAttendanceTranslations(locale);

  const [formData, setFormData] = useState<Partial<Attendance>>({
    employee_id: "",
    date: new Date().toISOString().split('T')[0],
    check_in: "",
    check_out: "",
    status: "PRESENT",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (attendance) {
      setFormData({
        employee_id: attendance.employee_id,
        date: new Date(attendance.date).toISOString().split('T')[0],
        check_in: attendance.check_in ? new Date(attendance.check_in).toISOString().slice(0, 16) : "",
        check_out: attendance.check_out ? new Date(attendance.check_out).toISOString().slice(0, 16) : "",
        status: attendance.status,
        notes: attendance.notes || "",
      });
    } else {
      setFormData({
        employee_id: "",
        date: new Date().toISOString().split('T')[0],
        check_in: "",
        check_out: "",
        status: "PRESENT",
        notes: "",
      });
    }
  }, [attendance]);

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

    if (!formData.date) {
      newErrors.date = `${t("date")} ${t("required")}`;
      isValid = false;
    }

    if (!formData.status) {
      newErrors.status = `${t("status")} ${t("required")}`;
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
      const payload: any = {
        employee_id: formData.employee_id,
        date: formData.date,
        status: formData.status,
        notes: formData.notes,
      };

      if (formData.check_in) payload.check_in = new Date(formData.check_in).toISOString();
      if (formData.check_out) payload.check_out = new Date(formData.check_out).toISOString();

      if (attendance) {
        await attendanceService.updateAttendance(attendance.id, payload);
        toastService.success(t("messages.updateSuccess"));
      } else {
        await attendanceService.createAttendance(payload);
        toastService.success(t("messages.createSuccess"));
      }
      onSuccess();
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t("messages.errorSaving"));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  const handleInputChange = (field: keyof Attendance, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-6">
      <Select
        id="employee_id"
        label={t("employee")}
        value={formData.employee_id || ""}
        onChange={(e) => handleInputChange("employee_id", e.target.value)}
        options={[
          { value: "", label: t("selectEmployee") },
          ...employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))
        ]}
        error={errors.employee_id}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          id="date"
          label={t("date")}
          required
          value={formData.date || ""}
          onChange={(e) => handleInputChange("date", e.target.value)}
          error={errors.date}
        />

        <Select
          id="status"
          label={t("status")}
          value={formData.status || ""}
          onChange={(e) => handleInputChange("status", e.target.value)}
          options={[
            { value: "present",  label: t("present") },
            { value: "absent",   label: t("absent") },
            { value: "late",     label: t("late") },
            { value: "half_day", label: t("halfDay") },
          ]}
          error={errors.status}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="datetime-local"
          id="check_in"
          label={t("checkIn")}
          value={formData.check_in || ""}
          onChange={(e) => handleInputChange("check_in", e.target.value)}
        />

        <Input
          type="datetime-local"
          id="check_out"
          label={t("checkOut")}
          value={formData.check_out || ""}
          onChange={(e) => handleInputChange("check_out", e.target.value)}
        />
      </div>

      <Input
        type="text"
        id="notes"
        label={t("notes")}
        value={formData.notes || ""}
        onChange={(e) => handleInputChange("notes", e.target.value)}
      />
    </form>
  );
});

AttendanceForm.displayName = "AttendanceForm";

export default AttendanceForm;
