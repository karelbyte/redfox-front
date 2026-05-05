"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/atoms";
import { Department } from "@/types/employee";
import { departmentsService } from "@/services/departments.service";
import { toastService } from "@/services/toast.service";

export interface DepartmentFormRef {
  submit: () => void;
}

interface DepartmentFormProps {
  department?: Department | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange: (isValid: boolean) => void;
}

const DepartmentForm = forwardRef<DepartmentFormRef, DepartmentFormProps>(({
  department,
  onClose,
  onSuccess,
  onSavingChange,
  onValidChange
}, ref) => {
  const locale = useLocale() as 'es' | 'en' | 'zh';
  
  const translations = {
    es: {
      name: "Nombre",
      description: "Descripción",
      messages: {
        updateSuccess: "Departamento actualizado con éxito",
        createSuccess: "Departamento creado con éxito",
        errorSaving: "Error al guardar el departamento",
        required: "es requerido"
      }
    },
    en: {
      name: "Name",
      description: "Description",
      messages: {
        updateSuccess: "Department updated successfully",
        createSuccess: "Department created successfully",
        errorSaving: "Error saving department",
        required: "is required"
      }
    },
    zh: {
      name: "名称",
      description: "描述",
      messages: {
        updateSuccess: "部门更新成功",
        createSuccess: "部门创建成功",
        errorSaving: "保存部门时出错",
        required: "是必填项"
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
  
  const [formData, setFormData] = useState<Partial<Department>>({
    name: "",
    description: "",
  });
  
  const [errors, setErrors] = useState<Partial<Department>>({});

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        description: department.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [department]);

  const validateForm = () => {
    const newErrors: Partial<Department> = {};
    let isValid = true;
    
    if (!formData.name?.trim()) {
      newErrors.name = `${t("name")} ${t("messages.required")}`;
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
      if (department) {
        await departmentsService.updateDepartment(department.id, formData);
        toastService.success(t("messages.updateSuccess"));
      } else {
        await departmentsService.createDepartment(formData);
        toastService.success(t("messages.createSuccess"));
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving department:", error);
      toastService.error(error instanceof Error ? error.message : t("messages.errorSaving"));
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  const handleInputChange = (field: keyof Department, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-6">
      <Input
        type="text"
        id="name"
        label={t("name")}
        required
        value={formData.name || ""}
        onChange={(e) => handleInputChange("name", e.target.value)}
        error={errors.name}
      />

      <Input
        type="text"
        id="description"
        label={t("description")}
        value={formData.description || ""}
        onChange={(e) => handleInputChange("description", e.target.value)}
      />
    </form>
  );
});

DepartmentForm.displayName = "DepartmentForm";

export default DepartmentForm;
