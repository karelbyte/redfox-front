export const positionTranslations = {
  es: {
    title: "Puestos de Trabajo",
    description: "Define y gestiona los cargos y responsabilidades",
    newPosition: "Nuevo Puesto",
    editPosition: "Editar Puesto",
    deletePosition: "Eliminar Puesto",
    searchPositions: "Buscar puestos...",
    noPositions: "No hay puestos",
    noPositionsDesc: "Haz clic en 'Nuevo Puesto' para agregar uno.",
    noResults: "No se encontraron resultados",
    noResultsDesc: "No se encontraron puestos con los criterios de búsqueda.",
    title_col: "Cargo",
    deptDescription: "Descripción",
    department: "Departamento",
    salaryRange: "Rango Salarial",
    employees: "Empleados",
    date: "Fecha de Creación",
    actions: {
      title: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
    },
    cancel: "Cancelar",
    messages: {
      errorLoading: "Error al cargar puestos",
      errorDelete: "Error al eliminar puestos",
      success: "Operación exitosa",
      error: "Ha ocurrido un error",
      confirmDelete: "¿Estás seguro de que deseas eliminar el puesto \"{name}\"?"
    }
  },
  en: {
    title: "Job Positions",
    description: "Define and manage job roles and responsibilities",
    newPosition: "New Position",
    editPosition: "Edit Position",
    deletePosition: "Delete Position",
    searchPositions: "Search positions...",
    noPositions: "No positions",
    noPositionsDesc: "Click 'New Position' to add one.",
    noResults: "No results found",
    noResultsDesc: "No positions found with search criteria.",
    title_col: "Role",
    deptDescription: "Description",
    department: "Department",
    salaryRange: "Salary Range",
    employees: "Employees",
    date: "Creation Date",
    actions: {
      title: "Actions",
      edit: "Edit",
      delete: "Delete",
    },
    cancel: "Cancel",
    messages: {
      errorLoading: "Error loading positions",
      errorDelete: "Error deleting positions",
      success: "Operation successful",
      error: "An error occurred",
      confirmDelete: "Are you sure you want to delete the position \"{name}\"?"
    }
  },
  zh: {
    title: "工作职位",
    description: "定义和管理工作角色和职责",
    newPosition: "新职位",
    editPosition: "编辑职位",
    deletePosition: "删除职位",
    searchPositions: "搜索职位...",
    noPositions: "没有职位",
    noPositionsDesc: "点击'新职位'添加一个。",
    noResults: "未找到结果",
    noResultsDesc: "未找到符合搜索条件的职位。",
    title_col: "职位",
    deptDescription: "描述",
    department: "部门",
    salaryRange: "薪资范围",
    employees: "员工",
    date: "创建日期",
    actions: {
      title: "操作",
      edit: "编辑",
      delete: "删除",
    },
    cancel: "取消",
    messages: {
      errorLoading: "加载职位时出错",
      errorDelete: "删除职位时出错",
      success: "操作成功",
      error: "发生错误",
      confirmDelete: "您確定要刪除 \"{name}\" 職位嗎？"
    }
  }
};

export const getPositionTranslation = (locale: string, key: string, params?: Record<string, string>): string => {
  const translations = positionTranslations[locale as keyof typeof positionTranslations];
  
  if (!translations) {
    const fallbackValue = positionTranslations.es;
    return getFromObject(fallbackValue, key, params);
  }
  
  return getFromObject(translations, key, params);
};

const getFromObject = (obj: any, key: string, params?: Record<string, string>): string => {
  const keys = key.split('.');
  let value: any = obj;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') return key;
  
  if (params) {
    let result = value;
    Object.entries(params).forEach(([k, v]) => {
      result = result.replace(`{${k}}`, v);
    });
    return result;
  }
  
  return value;
};

export const usePositionTranslations = (locale: string) => {
  return (key: string, params?: Record<string, string>) => getPositionTranslation(locale, key, params);
};
