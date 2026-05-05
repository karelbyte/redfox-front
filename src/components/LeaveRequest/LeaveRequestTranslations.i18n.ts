export const leaveRequestTranslations = {
  es: {
    title: "Ausencias y Permisos",
    description: "Gestiona las solicitudes de vacaciones, permisos y bajas",
    newRequest: "Nueva Solicitud",
    editRequest: "Editar Solicitud",
    searchRequests: "Buscar solicitudes...",
    employee: "Empleado",
    leaveType: "Tipo de Ausencia",
    startDate: "Fecha Inicio",
    endDate: "Fecha Fin",
    dates: "Fechas",
    status: "Estado",
    days: "Días",
    reason: "Motivo",
    required: "es requerido",
    selectEmployee: "Seleccionar empleado...",
    selectLeaveType: "Seleccionar tipo...",
    selectStatus: "Seleccionar estado...",
    statuses: {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      cancelled: "Cancelado"
    },
    types: {
      vacation: "Vacaciones",
      sick_leave: "Baja Médica",
      personal_leave: "Asuntos Propios",
      maternity_leave: "Baja por Maternidad",
      paternity_leave: "Baja por Paternidad",
      unpaid_leave: "Permiso no Remunerado",
      other: "Otro"
    },
    actions: {
      title: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
    },
    cancel: "Cancelar",
    noRequests: "No hay solicitudes de ausencia",
    noRequestsDesc: "Comienza creando la primera solicitud.",
    noResults: "No se encontraron solicitudes",
    noResultsDesc: "No hay resultados para tu búsqueda.",
    delete: "Eliminar",
    messages: {
      errorLoading: "Error al cargar las ausencias",
      createSuccess: "Solicitud creada exitosamente",
      updateSuccess: "Solicitud actualizada exitosamente",
      errorSaving: "Error al guardar la solicitud",
      deleteSuccess: "Solicitud eliminada exitosamente",
      confirmDelete: "¿Estás seguro de que deseas eliminar esta solicitud de ausencia?",
    }
  },
  en: {
    title: "Leave Requests",
    description: "Manage vacation, leave and time off requests",
    newRequest: "New Request",
    editRequest: "Edit Request",
    searchRequests: "Search requests...",
    employee: "Employee",
    leaveType: "Leave Type",
    startDate: "Start Date",
    endDate: "End Date",
    dates: "Dates",
    status: "Status",
    days: "Days",
    reason: "Reason",
    required: "is required",
    selectEmployee: "Select employee...",
    selectLeaveType: "Select leave type...",
    selectStatus: "Select status...",
    statuses: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled"
    },
    types: {
      vacation: "Vacation",
      sick_leave: "Sick Leave",
      personal_leave: "Personal Leave",
      maternity_leave: "Maternity Leave",
      paternity_leave: "Paternity Leave",
      unpaid_leave: "Unpaid Leave",
      other: "Other"
    },
    actions: {
      title: "Actions",
      edit: "Edit",
      delete: "Delete",
    },
    cancel: "Cancel",
    noRequests: "No leave requests found",
    noRequestsDesc: "Start by creating the first request.",
    noResults: "No matching requests",
    noResultsDesc: "No results found for your search.",
    delete: "Delete",
    messages: {
      errorLoading: "Error loading leave requests",
      createSuccess: "Request created successfully",
      updateSuccess: "Request updated successfully",
      errorSaving: "Error saving the request",
      deleteSuccess: "Request deleted successfully",
      confirmDelete: "Are you sure you want to delete this leave request?",
    }
  },
  zh: {
    title: "请假申请",
    description: "管理休假、请假和调休申请",
    newRequest: "新申请",
    editRequest: "编辑申请",
    searchRequests: "搜索申请...",
    employee: "员工",
    leaveType: "休假类型",
    startDate: "开始日期",
    endDate: "结束日期",
    dates: "日期",
    status: "状态",
    days: "天数",
    reason: "原因",
    required: "是必填项",
    selectEmployee: "选择员工...",
    selectLeaveType: "选择类型...",
    selectStatus: "选择状态...",
    statuses: {
      pending: "待处理",
      approved: "已批准",
      rejected: "已拒绝",
      cancelled: "已取消"
    },
    types: {
      vacation: "年假",
      sick_leave: "病假",
      personal_leave: "事假",
      maternity_leave: "产假",
      paternity_leave: "陪产假",
      unpaid_leave: "无薪假",
      other: "其他"
    },
    actions: {
      title: "操作",
      edit: "编辑",
      delete: "删除",
    },
    cancel: "取消",
    noRequests: "未找到请假申请",
    noRequestsDesc: "通过创建第一个申请开始。",
    noResults: "没有匹配的申请",
    noResultsDesc: "未找到搜索结果。",
    delete: "删除",
    messages: {
      errorLoading: "加载请假申请时出错",
      createSuccess: "申请创建成功",
      updateSuccess: "申请更新成功",
      errorSaving: "保存申请时出错",
      deleteSuccess: "申请删除成功",
      confirmDelete: "您确定要删除此请假申请吗？",
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

export const useLeaveRequestTranslations = (locale: string) => {
  const translations =
    leaveRequestTranslations[locale as keyof typeof leaveRequestTranslations] ??
    leaveRequestTranslations.es;
  return (key: string, params?: Record<string, string>) =>
    getFromObject(translations, key, params);
};
