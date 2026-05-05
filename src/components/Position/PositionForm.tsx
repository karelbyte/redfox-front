"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useLocale } from "next-intl";
import { Input, Select } from "@/components/atoms";
import { Position, Department } from "@/types/employee";
import { positionsService } from "@/services/positions.service";
import { departmentsService } from "@/services/departments.service";
import { toastService } from "@/services/toast.service";

export interface PositionFormRef {
  submit: () => void;
}

interface PositionFormProps {
  position?: Position | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange: (isValid: boolean) => void;
}

const PositionForm = forwardRef<PositionFormRef, PositionFormProps>(({
  position,
  onClose,
  onSuccess,
  onSavingChange,
  onValidChange
}, ref) => {
  const locale = useLocale() as 'es' | 'en' | 'zh';
  
  const translations = {
    es: {
      title: "Cargo",
      department: "Departamento",
      description: "Descripción",
      minSalary: "Salario Mínimo",
      maxSalary: "Salario Máximo",
      selectDepartment: "Seleccionar departamento...",
      required: "es requerido",
      mustBeGreater: "Debe ser mayor al salario mínimo",
      messages: {
        updateSuccess: "Puesto actualizado con éxito",
        createSuccess: "Puesto creado con éxito",
        errorSaving: "Error al guardar el puesto"
      }
    },
    en: {
      title: "Role",
      department: "Department",
      description: "Description",
      minSalary: "Min Salary",
      maxSalary: "Max Salary",
      selectDepartment: "Select department...",
      required: "is required",
      mustBeGreater: "Must be greater than min salary",
      messages: {
        updateSuccess: "Position updated successfully",
        createSuccess: "Position created successfully",
        errorSaving: "Error saving position"
      }
    },
    zh: {
      title: "职位",
      department: "部门",
      description: "描述",
      minSalary: "最低薪资",
      maxSalary: "最高薪资",
      selectDepartment: "选择部门...",
      required: "是必填项",
      mustBeGreater: "必须大于最低薪资",
      messages: {
        updateSuccess: "职位更新成功",
        createSuccess: "职位创建成功",
        errorSaving: "保存职位时出错"
      }
    }
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale];
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  };
  
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    department_id: "",
    min_salary: undefined,
    max_salary: undefined,
  });

  const [errors, setErrors] = useState<any>({});
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title,
        description: position.description || "",
        department_id: position.department_id || "",
        min_salary: position.min_salary,
        max_salary: position.max_salary,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        department_id: "",
        min_salary: undefined,
        max_salary: undefined,
      });
    }
  }, [position]);

  const loadDepartments = async () => {
    try {
      const response = await departmentsService.getDepartments(1, undefined, 100);
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error loading departments", error);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;
    
    if (!formData.title?.trim()) {
      newErrors.title = `${t("title")} ${t("required")}`;
      isValid = false;
    }

    if (formData.min_salary && formData.max_salary && Number(formData.min_salary) > Number(formData.max_salary)) {
      newErrors.max_salary = t("mustBeGreater");
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
      if (position) {
        await positionsService.updatePosition(position.id, formData);
        toastService.success(t("messages.updateSuccess"));
      } else {
        await positionsService.createPosition(formData);
        toastService.success(t("messages.createSuccess"));
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving position:", error);
      toastService.error(error instanceof Error ? error.message : t("messages.errorSaving"));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  const handleInputChange = (field: keyof Position | 'min_salary' | 'max_salary', value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-6">
      <Input
        type="text"
        id="title"
        label={t("title")}
        required
        value={formData.title || ""}
        onChange={(e) => handleInputChange("title", e.target.value)}
        error={errors.title as string}
      />

      <Select
        id="department_id"
        label={t("department")}
        value={formData.department_id || ""}
        onChange={(e) => handleInputChange("department_id", e.target.value)}
        placeholder={t("selectDepartment")}
        options={departments.map(d => ({ value: d.id, label: d.name }))}
      />

      <Input
        type="text"
        id="description"
        label={t("description")}
        value={formData.description || ""}
        onChange={(e) => handleInputChange("description", e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          id="min_salary"
          label={t("minSalary")}
          value={formData.min_salary || ""}
          onChange={(e) => handleInputChange("min_salary", e.target.value ? parseFloat(e.target.value) : undefined)}
          min="0"
          step="0.01"
          error={errors.min_salary as string}
        />

        <Input
          type="number"
          id="max_salary"
          label={t("maxSalary")}
          value={formData.max_salary || ""}
          onChange={(e) => handleInputChange("max_salary", e.target.value ? parseFloat(e.target.value) : undefined)}
          min="0"
          step="0.01"
          error={errors.max_salary as string}
        />
      </div>
    </form>
  );
});

PositionForm.displayName = "PositionForm";

export default PositionForm;
