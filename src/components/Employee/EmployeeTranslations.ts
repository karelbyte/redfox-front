// Traducciones aisladas para el módulo de empleados
// Evita saturar los archivos JSON principales

export const employeeTranslations = {
  es: {
    title: "Empleados",
    description: "Gestión de empleados del sistema",
    newEmployee: "Nuevo Empleado",
    editEmployee: "Editar Empleado",
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
    manager: "Gerente",
    salary: "Salario",
    "actions": "Acciones",
    "actions.edit": "Editar",
    "actions.delete": "Eliminar",
    messages: {
      errorLoading: "Error al cargar empleados",
      errorDelete: "Error al eliminar empleados",
      success: "Operación exitosa",
      error: "Ha ocurrido un error"
    }
  },
  en: {
    title: "Employees",
    description: "Employee management system",
    newEmployee: "New Employee",
    editEmployee: "Edit Employee",
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
    manager: "Manager",
    salary: "Salary",
    "actions": "Actions",
    "actions.edit": "Edit",
    "actions.delete": "Delete",
    messages: {
      errorLoading: "Error loading employees",
      errorDelete: "Error deleting employees",
      success: "Operation successful",
      error: "An error occurred"
    }
  },
  zh: {
    title: "员工",
    description: "员工管理系统",
    newEmployee: "新员工",
    editEmployee: "编辑员工",
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
    manager: "经理",
    salary: "薪资",
    "actions": "操作",
    "actions.edit": "编辑",
    "actions.delete": "删除",
    messages: {
      errorLoading: "加载员工时出错",
      errorDelete: "删除员工时出错",
      success: "操作成功",
      error: "发生错误"
    }
  }
};

export const getEmployeeTranslation = (locale: string, key: string) => {
  const translations = employeeTranslations[locale as keyof typeof employeeTranslations] || employeeTranslations.es;
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
