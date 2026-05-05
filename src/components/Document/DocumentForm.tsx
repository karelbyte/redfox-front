"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { useLocale } from "next-intl";
import { Input, Select } from "@/components/atoms";
import { EmployeeDocument } from "@/types/employee";
import { Employee } from "@/types/employee";
import { documentsService } from "@/services/documents.service";
import { employeesService } from "@/services/employees.service";
import { toastService } from "@/services/toast.service";
import { API_BASE_URL } from "@/lib/config";
import { DocumentIcon, PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface DocumentFormRef {
  submit: () => void;
}

interface DocumentFormProps {
  document?: EmployeeDocument | null;
  onClose: () => void;
  onSuccess: () => void;
  onSavingChange: (isSaving: boolean) => void;
  onValidChange: (isValid: boolean) => void;
}

const dict = {
  es: {
    employee: "Empleado",
    selectEmployee: "Seleccionar empleado...",
    documentType: "Tipo de Documento",
    title_field: "Título",
    description: "Descripción",
    issueDate: "Fecha de Emisión",
    expiryDate: "Fecha de Vencimiento",
    isVerified: "Documento verificado",
    file: "Archivo",
    currentFile: "Archivo actual",
    changeFile: "Cambiar",
    clickToUpload: "Haz clic para subir un archivo",
    fileTypes: "PDF, JPG, PNG hasta 10MB",
    contract: "Contrato",
    idCard: "Identificación",
    passport: "Pasaporte",
    resume: "Currículum",
    certificate: "Certificado",
    medical: "Médico",
    policeRecord: "Antecedentes",
    fieldRequired: "es requerido",
    createSuccess: "Documento creado correctamente",
    updateSuccess: "Documento actualizado correctamente",
    errorSaving: "Error al guardar el documento",
  },
  en: {
    employee: "Employee",
    selectEmployee: "Select employee...",
    documentType: "Document Type",
    title_field: "Title",
    description: "Description",
    issueDate: "Issue Date",
    expiryDate: "Expiry Date",
    isVerified: "Document verified",
    file: "File",
    currentFile: "Current file",
    changeFile: "Change",
    clickToUpload: "Click to upload a file",
    fileTypes: "PDF, JPG, PNG up to 10MB",
    contract: "Contract",
    idCard: "ID Card",
    passport: "Passport",
    resume: "Resume",
    certificate: "Certificate",
    medical: "Medical",
    policeRecord: "Police Record",
    fieldRequired: "is required",
    createSuccess: "Document created successfully",
    updateSuccess: "Document updated successfully",
    errorSaving: "Error saving document",
  },
  zh: {
    employee: "员工",
    selectEmployee: "选择员工...",
    documentType: "文档类型",
    title_field: "标题",
    description: "描述",
    issueDate: "签发日期",
    expiryDate: "有效期",
    isVerified: "文档已验证",
    file: "文件",
    currentFile: "当前文件",
    changeFile: "更换",
    clickToUpload: "点击上传文件",
    fileTypes: "PDF、JPG、PNG，最大 10MB",
    contract: "合同",
    idCard: "身份证",
    passport: "护照",
    resume: "简历",
    certificate: "证书",
    medical: "医疗",
    policeRecord: "无犯罪记录",
    fieldRequired: "为必填项",
    createSuccess: "文档创建成功",
    updateSuccess: "文档更新成功",
    errorSaving: "保存文档时出错",
  },
};

const DocumentForm = forwardRef<DocumentFormRef, DocumentFormProps>(({
  document,
  onClose,
  onSuccess,
  onSavingChange,
  onValidChange,
}, ref) => {
  const locale = useLocale();
  const t = dict[locale as keyof typeof dict] ?? dict.es;

  const [formData, setFormData] = useState<Partial<EmployeeDocument>>({
    employee_id: "",
    document_type: "contract",
    title: "",
    description: "",
    issue_date: "",
    expiry_date: "",
    is_verified: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (document) {
      setFormData({
        employee_id: document.employee_id,
        document_type: document.document_type,
        title: document.title,
        description: document.description || "",
        issue_date: document.issue_date ? new Date(document.issue_date).toISOString().split("T")[0] : "",
        expiry_date: document.expiry_date ? new Date(document.expiry_date).toISOString().split("T")[0] : "",
        is_verified: document.is_verified,
      });
      setSelectedFile(null);
      setFilePreview(document.file_url ? `${API_BASE_URL}${document.file_url}` : null);
    } else {
      setFormData({
        employee_id: "",
        document_type: "contract",
        title: "",
        description: "",
        issue_date: "",
        expiry_date: "",
        is_verified: false,
      });
      setSelectedFile(null);
      setFilePreview(null);
    }
  }, [document]);

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
      newErrors.employee_id = `${t.employee} ${t.fieldRequired}`;
      isValid = false;
    }
    if (!formData.title?.trim()) {
      newErrors.title = `${t.title_field} ${t.fieldRequired}`;
      isValid = false;
    }
    if (!formData.document_type) {
      newErrors.document_type = `${t.documentType} ${t.fieldRequired}`;
      isValid = false;
    }

    setErrors(newErrors);
    onValidChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    onSavingChange(true);
    try {
      if (document) {
        await documentsService.updateDocument(document.id, formData, selectedFile);
        toastService.success(t.updateSuccess);
      } else {
        await documentsService.createDocument(formData, selectedFile);
        toastService.success(t.createSuccess);
      }
      onSuccess();
    } catch (error) {
      toastService.error(error instanceof Error ? error.message : t.errorSaving);
    } finally {
      onSavingChange(false);
    }
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  const handleInputChange = (field: keyof EmployeeDocument, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isImagePreview = selectedFile?.type.startsWith("image/") || (!selectedFile && filePreview && document?.file_url);

  return (
    <form className="space-y-6">
      <Select
        id="employee_id"
        label={`${t.employee} *`}
        value={formData.employee_id || ""}
        onChange={(e) => handleInputChange("employee_id", e.target.value)}
        placeholder={t.selectEmployee}
        options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))}
        error={errors.employee_id}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="document_type"
          label={`${t.documentType} *`}
          value={formData.document_type || "contract"}
          onChange={(e) => handleInputChange("document_type", e.target.value as any)}
          options={[
            { value: "contract", label: t.contract },
            { value: "id_card", label: t.idCard },
            { value: "passport", label: t.passport },
            { value: "resume", label: t.resume },
            { value: "certificate", label: t.certificate },
            { value: "medical", label: t.medical },
            { value: "police_record", label: t.policeRecord },
          ]}
          error={errors.document_type}
        />
        <Input
          type="text"
          id="title"
          label={`${t.title_field} *`}
          value={formData.title || ""}
          onChange={(e) => handleInputChange("title", e.target.value)}
          error={errors.title}
        />
      </div>

      <Input
        type="text"
        id="description"
        label={t.description}
        value={formData.description || ""}
        onChange={(e) => handleInputChange("description", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          id="issue_date"
          label={t.issueDate}
          value={formData.issue_date || ""}
          onChange={(e) => handleInputChange("issue_date", e.target.value)}
        />
        <Input
          type="date"
          id="expiry_date"
          label={t.expiryDate}
          value={formData.expiry_date || ""}
          onChange={(e) => handleInputChange("expiry_date", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.file}</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {(selectedFile || filePreview) ? (
          <div className="relative rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            {isImagePreview && filePreview ? (
              <img src={filePreview} alt="" className="h-16 w-16 object-cover rounded" />
            ) : (
              <div className="h-16 w-16 flex items-center justify-center bg-gray-50 rounded">
                <DocumentIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile ? selectedFile.name : t.currentFile}
              </p>
              {selectedFile && (
                <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-600 hover:text-blue-800">
                {t.changeFile}
              </button>
              <button type="button" onClick={handleRemoveFile} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors"
          >
            <PaperClipIcon className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{t.clickToUpload}</p>
            <p className="text-xs text-gray-300 mt-1">{t.fileTypes}</p>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_verified"
          checked={formData.is_verified}
          onChange={(e) => handleInputChange("is_verified", e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="is_verified" className="text-sm text-gray-700">{t.isVerified}</label>
      </div>
    </form>
  );
});

DocumentForm.displayName = "DocumentForm";

export default DocumentForm;
