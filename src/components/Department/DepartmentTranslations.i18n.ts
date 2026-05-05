export const departmentTranslations = {
  es: {
    title: "Departamentos",
    description: "Gestión de las áreas y departamentos de la organización",
    newDepartment: "Nuevo Departamento",
    editDepartment: "Editar Departamento",
    deleteDepartment: "Eliminar Departamento",
    searchDepartments: "Buscar departamentos...",
    noDepartments: "No hay departamentos",
    noDepartmentsDesc: "Haz clic en 'Nuevo Departamento' para agregar uno.",
    noResults: "No se encontraron resultados",
    noResultsDesc: "No se encontraron departamentos con los criterios de búsqueda.",
    name: "Nombre",
    deptDescription: "Descripción",
    manager: "Gerente / Responsable",
    employees: "Empleados",
    date: "Fecha de Creación",
    actions: {
      title: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
    },
    cancel: "Cancelar",
    messages: {
      errorLoading: "Error al cargar departamentos",
      errorDelete: "Error al eliminar departamentos",
      success: "Operación exitosa",
      error: "Ha ocurrido un error",
      confirmDelete: "¿Estás seguro de que deseas eliminar el departamento \"{name}\"?"
    }
  },
  en: {
    title: "Departments",
    description: "Organization's areas and departments management",
    newDepartment: "New Department",
    editDepartment: "Edit Department",
    deleteDepartment: "Delete Department",
    searchDepartments: "Search departments...",
    noDepartments: "No departments",
    noDepartmentsDesc: "Click 'New Department' to add one.",
    noResults: "No results found",
    noResultsDesc: "No departments found with search criteria.",
    name: "Name",
    deptDescription: "Description",
    manager: "Manager / Responsible",
    employees: "Employees",
    date: "Creation Date",
    actions: {
      title: "Actions",
      edit: "Edit",
      delete: "Delete",
    },
    cancel: "Cancel",
    messages: {
      errorLoading: "Error loading departments",
      errorDelete: "Error deleting departments",
      success: "Operation successful",
      error: "An error occurred",
      confirmDelete: "Are you sure you want to delete the department \"{name}\"?"
    }
  },
  zh: {
    title: "部门",
    description: "组织区域和部门管理",
    newDepartment: "新部门",
    editDepartment: "编辑部门",
    deleteDepartment: "删除部门",
    searchDepartments: "搜索部门...",
    noDepartments: "没有部门",
    noDepartmentsDesc: "点击'新部门'添加一个。",
    noResults: "未找到结果",
    noResultsDesc: "未找到符合搜索条件的部门。",
    name: "名称",
    deptDescription: "描述",
    manager: "经理 / 负责人",
    employees: "员工",
    date: "创建日期",
    actions: {
      title: "操作",
      edit: "编辑",
      delete: "删除",
    },
    cancel: "取消",
    messages: {
      errorLoading: "加载部门时出错",
      errorDelete: "删除部门时出错",
      success: "操作成功",
      error: "发生错误",
      confirmDelete: "您確定要刪除 \"{name}\" 部門嗎？"
    }
  }
};

export const getDepartmentTranslation = (locale: string, key: string, params?: Record<string, string>): string => {
  const translations = departmentTranslations[locale as keyof typeof departmentTranslations];
  
  if (!translations) {
    const fallbackValue = departmentTranslations.es;
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

export const useDepartmentTranslations = (locale: string) => {
  return (key: string, params?: Record<string, string>) => getDepartmentTranslation(locale, key, params);
};
