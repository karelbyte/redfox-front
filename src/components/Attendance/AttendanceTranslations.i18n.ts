export const attendanceTranslations = {
  es: {
    title: "Asistencia",
    clockIn: "Registrar Entrada",
    editAttendance: "Editar Registro",
    searchAttendance: "Buscar asistencia...",
    employee: "Empleado",
    date: "Fecha",
    checkIn: "Hora de Entrada",
    checkOut: "Hora de Salida",
    status: "Estado",
    notes: "Notas",
    present: "Presente",
    absent: "Ausente",
    late: "Tarde",
    halfDay: "Medio Día",
    required: "es requerido",
    selectEmployee: "Seleccionar empleado...",
    actions: {
      title: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
    },
    cancel: "Cancelar",
    noAttendance: "No hay registros de asistencia",
    noAttendanceDesc: "Haz clic en 'Registrar Entrada' para agregar el primer registro.",
    noResults: "No se encontraron registros",
    noResultsDesc: "No hay resultados para tu búsqueda.",
    messages: {
      errorLoading: "Error al cargar los registros de asistencia",
      createSuccess: "Entrada registrada exitosamente",
      updateSuccess: "Registro actualizado exitosamente",
      errorSaving: "Error al guardar el registro",
      deleteSuccess: "Registro eliminado exitosamente",
      confirmDelete: "¿Estás seguro de que deseas eliminar este registro de asistencia?",
    },
  },
  en: {
    title: "Attendance",
    clockIn: "Clock In",
    editAttendance: "Edit Record",
    searchAttendance: "Search attendance...",
    employee: "Employee",
    date: "Date",
    checkIn: "Check In Time",
    checkOut: "Check Out Time",
    status: "Status",
    notes: "Notes",
    present: "Present",
    absent: "Absent",
    late: "Late",
    halfDay: "Half Day",
    required: "is required",
    selectEmployee: "Select employee...",
    actions: {
      title: "Actions",
      edit: "Edit",
      delete: "Delete",
    },
    cancel: "Cancel",
    noAttendance: "No attendance records",
    noAttendanceDesc: "Click 'Clock In' to add the first record.",
    noResults: "No records found",
    noResultsDesc: "No results found for your search.",
    messages: {
      errorLoading: "Error loading attendance records",
      createSuccess: "Clock in registered successfully",
      updateSuccess: "Record updated successfully",
      errorSaving: "Error saving the record",
      deleteSuccess: "Record deleted successfully",
      confirmDelete: "Are you sure you want to delete this attendance record?",
    },
  },
  zh: {
    title: "出勤",
    clockIn: "打卡上班",
    editAttendance: "编辑记录",
    searchAttendance: "搜索出勤...",
    employee: "员工",
    date: "日期",
    checkIn: "上班时间",
    checkOut: "下班时间",
    status: "状态",
    notes: "备注",
    present: "出席",
    absent: "缺席",
    late: "迟到",
    halfDay: "半天",
    required: "是必填项",
    selectEmployee: "选择员工...",
    actions: {
      title: "操作",
      edit: "编辑",
      delete: "删除",
    },
    cancel: "取消",
    noAttendance: "没有出勤记录",
    noAttendanceDesc: "点击'打卡上班'添加第一条记录。",
    noResults: "未找到记录",
    noResultsDesc: "未找到搜索结果。",
    messages: {
      errorLoading: "加载出勤记录时出错",
      createSuccess: "打卡上班注册成功",
      updateSuccess: "记录更新成功",
      errorSaving: "保存记录时出错",
      deleteSuccess: "记录删除成功",
      confirmDelete: "您确定要删除此出勤记录吗？",
    },
  },
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

export const useAttendanceTranslations = (locale: string) => {
  const translations =
    attendanceTranslations[locale as keyof typeof attendanceTranslations] ??
    attendanceTranslations.es;
  return (key: string, params?: Record<string, string>) =>
    getFromObject(translations, key, params);
};
