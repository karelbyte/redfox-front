// TRADUCCIONES COMPLETAS DEL MÓDULO EMPLEADOS
// USANDO I18N PARA DETECTAR EL IDIOMA DEL USUARIO

export const employeeTranslations = {
  es: {
    title: "Empleados",
    description: "Gestión de empleados del sistema",
    newEmployee: "Nuevo Empleado",
    editEmployee: "Editar Empleado",
    deleteEmployee: "Eliminar Empleado",
    searchEmployees: "Buscar empleados...",
    noEmployees: "No hay empleados",
    noEmployeesDesc: "Haz clic en 'Nuevo Empleado' para agregar uno.",
    noResults: "No se encontraron resultados",
    noResultsDesc: "No se encontraron empleados con los criterios de búsqueda.",
    employeeCode: "Código",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    phone: "Teléfono",
    department: "Departamento",
    position: "Puesto",
    status: "Estado",
    hireDate: "Fecha de Contratación",
    active: "Activo",
    inactive: "Inactivo",
    manager: "Gerente / Supervisor",
    salary: "Salario",
    selectDepartment: "Seleccionar departamento...",
    selectPosition: "Seleccionar puesto...",
    selectManager: "Seleccionar gerente...",
    required: "es requerido",
    actions: {
      title: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
    },
    cancel: "Cancelar",
    messages: {
      errorLoading: "Error al cargar empleados",
      errorDelete: "Error al eliminar empleados",
      success: "Operación exitosa",
      error: "Ha ocurrido un error",
      confirmDelete: "¿Estás seguro de que deseas eliminar este empleado?"
    }
  },
  en: {
    title: "Employees",
    description: "Employee management system",
    newEmployee: "New Employee",
    editEmployee: "Edit Employee",
    deleteEmployee: "Delete Employee",
    searchEmployees: "Search employees...",
    noEmployees: "No employees",
    noEmployeesDesc: "Click 'New Employee' to add one.",
    noResults: "No results found",
    noResultsDesc: "No employees found with search criteria.",
    employeeCode: "Code",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    department: "Department",
    position: "Position",
    status: "Status",
    hireDate: "Hire Date",
    active: "Active",
    inactive: "Inactive",
    manager: "Manager / Supervisor",
    salary: "Salary",
    selectDepartment: "Select department...",
    selectPosition: "Select position...",
    selectManager: "Select manager...",
    required: "is required",
    actions: {
      title: "Actions",
      edit: "Edit",
      delete: "Delete",
    },
    cancel: "Cancel",
    messages: {
      errorLoading: "Error loading employees",
      errorDelete: "Error deleting employees",
      success: "Operation successful",
      error: "An error occurred",
      confirmDelete: "Are you sure you want to delete this employee?"
    }
  },
  zh: {
    title: "员工",
    description: "员工管理系统",
    newEmployee: "新员工",
    editEmployee: "编辑员工",
    deleteEmployee: "删除员工",
    searchEmployees: "搜索员工...",
    noEmployees: "没有员工",
    noEmployeesDesc: "点击'新员工'添加一个。",
    noResults: "未找到结果",
    noResultsDesc: "未找到符合搜索条件的员工。",
    employeeCode: "代码",
    firstName: "名字",
    lastName: "姓氏",
    email: "邮箱",
    phone: "电话",
    department: "部门",
    position: "职位",
    status: "状态",
    hireDate: "入职日期",
    active: "在职",
    inactive: "离职",
    manager: "经理 / 主管",
    salary: "薪资",
    selectDepartment: "选择部门...",
    selectPosition: "选择职位...",
    selectManager: "选择经理...",
    required: "是必填项",
    actions: {
      title: "操作",
      edit: "编辑",
      delete: "删除",
    },
    cancel: "取消",
    messages: {
      errorLoading: "加载员工时出错",
      errorDelete: "删除员工时出错",
      success: "操作成功",
      error: "发生错误",
      confirmDelete: "您确定要删除这位员工吗？"
    }
  }
};

// FUNCIÓN PARA OBTENER TRADUCCIONES SEGÚN EL IDIOMA DEL USUARIO
export const getEmployeeTranslation = (locale: string, key: string): string => {
  const translations = employeeTranslations[locale as keyof typeof employeeTranslations];
  
  if (!translations) {
    console.warn(`Locale ${locale} not found in employee translations, falling back to Spanish`);
    const fallbackValue = employeeTranslations.es[key as keyof typeof employeeTranslations.es];
    return typeof fallbackValue === 'string' ? fallbackValue : key;
  }
  
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return typeof value === 'string' ? value : key;
};
