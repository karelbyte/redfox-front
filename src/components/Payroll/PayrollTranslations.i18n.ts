export const payrollTranslations = {
  es: {
    title: "Nómina",
    description: "Gestión de nóminas y pagos",
    generatePayroll: "Generar Nómina",
    searchPayroll: "Buscar nómina...",
    employee: "Empleado",
    period: "Periodo",
    periodStart: "Inicio del Periodo",
    periodEnd: "Fin del Periodo",
    baseSalary: "Salario Base",
    netPay: "Pago Neto",
    status: "Estado",
    actions: "Acciones",
    required: "es requerido",
    selectEmployee: "Seleccionar empleado...",
    selectStatus: "Seleccionar estado...",
    statuses: {
      pending: "Pendiente",
      paid: "Pagado",
      cancelled: "Cancelado"
    },
    actionsTitle: "Acciones",
    cancel: "Cancelar",
    delete: "Eliminar",
    noPayroll: "No hay registros de nómina",
    noPayrollDesc: "Comienza generando la primera nómina.",
    noResults: "No se encontraron resultados",
    noResultsDesc: "No hay coincidencias para tu búsqueda.",
    messages: {
      errorLoading: "Error al cargar la nómina",
      createSuccess: "Nómina generada exitosamente",
      updateSuccess: "Nómina actualizada exitosamente",
      errorSaving: "Error al guardar la nómina",
      deleteSuccess: "Nómina eliminada exitosamente",
      confirmDelete: "¿Estás seguro de que deseas eliminar este registro de nómina?",
    }
  },
  en: {
    title: "Payroll",
    description: "Payroll and payments management",
    generatePayroll: "Generate Payroll",
    searchPayroll: "Search payroll...",
    employee: "Employee",
    period: "Period",
    periodStart: "Period Start",
    periodEnd: "Period End",
    baseSalary: "Base Salary",
    netPay: "Net Pay",
    status: "Status",
    actions: "Actions",
    required: "is required",
    selectEmployee: "Select employee...",
    selectStatus: "Select status...",
    statuses: {
      pending: "Pending",
      paid: "Paid",
      cancelled: "Cancelled"
    },
    actionsTitle: "Actions",
    cancel: "Cancel",
    delete: "Delete",
    noPayroll: "No payroll records found",
    noPayrollDesc: "Start by generating the first payroll.",
    noResults: "No matching records",
    noResultsDesc: "No results found for your search.",
    messages: {
      errorLoading: "Error loading payroll",
      createSuccess: "Payroll generated successfully",
      updateSuccess: "Payroll updated successfully",
      errorSaving: "Error saving the payroll",
      deleteSuccess: "Payroll deleted successfully",
      confirmDelete: "Are you sure you want to delete this payroll record?",
    }
  },
  zh: {
    title: "工资单",
    description: "工资单和付款管理",
    generatePayroll: "生成工资单",
    searchPayroll: "搜索工资单...",
    employee: "员工",
    period: "期间",
    periodStart: "期间开始",
    periodEnd: "期间结束",
    baseSalary: "基本工资",
    netPay: "净实发工资",
    status: "状态",
    actions: "操作",
    required: "是必填项",
    selectEmployee: "选择员工...",
    selectStatus: "选择状态...",
    statuses: {
      pending: "待处理",
      paid: "已支付",
      cancelled: "已取消"
    },
    actionsTitle: "操作",
    cancel: "取消",
    delete: "删除",
    noPayroll: "未找到工资单记录",
    noPayrollDesc: "通过生成第一个工资单开始。",
    noResults: "没有匹配的记录",
    noResultsDesc: "未找到搜索结果。",
    messages: {
      errorLoading: "加载工资单时出错",
      createSuccess: "工资单生成成功",
      updateSuccess: "工资单更新成功",
      errorSaving: "保存工资单时出错",
      deleteSuccess: "工资单删除成功",
      confirmDelete: "您确定要删除此工资单记录吗？",
    }
  }
};

const getFromObject = (obj: any, key: string, params?: Record<string, string>): string => {
  const keys = key.split(".");
  let value: any = obj;
  for (const k of keys) {
    value = value?.[k];
  }
  if (typeof value !== "string") return key;
  if (params) {
    let result = value;
    Object.entries(params).forEach(([k, v]) => {
      result = result.replace(`{${k}}`, v);
    });
    return result;
  }
  return value;
};

export const usePayrollTranslations = (locale: string) => {
  const translations =
    payrollTranslations[locale as keyof typeof payrollTranslations] ??
    payrollTranslations.es;
  return (key: string, params?: Record<string, string>) =>
    getFromObject(translations, key, params);
};
