'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Btn, SearchInput } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Role } from '@/types/role';
import { rolesService } from '@/services/roles.service';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';
import EmptyState from '@/components/atoms/EmptyState';
import Drawer from '@/components/Drawer/Drawer';
import RoleForm, { RoleFormRef } from '@/components/Role/RoleForm';
import RoleTable from '@/components/Role/RoleTable';
import DeleteRoleModal from '@/components/Role/DeleteRoleModal';
import Pagination from '@/components/Pagination/Pagination';

export default function RolesPage() {
  const t = useTranslations('pages.roles');
  const router = useRouter();
  const locale = useLocale();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const formRef = useRef<RoleFormRef>(null);

  const fetchRoles = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await rolesService.getRoles(page);
      setRoles(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toastService.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRoles(currentPage);
  }, [fetchRoles, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    // Implement search functionality if needed
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowDrawer(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowDrawer(true);
  };

  const handleViewDetails = (role: Role) => {
    router.push(`/${locale}/dashboard/configuracion/roles/${role.id}`);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await rolesService.deleteRole(roleToDelete.id);
      toastService.success(t('messages.successDeleted', { item: t('title') }));
      fetchRoles(currentPage);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      toastService.error(t('messages.errorDeleting'));
    }
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingRole(null);
    setIsSaving(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchRoles(currentPage);
    toastService.success(
      editingRole 
        ? t('messages.successUpdated', { item: t('title') })
        : t('messages.successCreated', { item: t('title') })
    );
  };

  const handleFormSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  if (loading && roles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600">{t('subtitle')}</p>
            </div>
            <Btn
              onClick={handleCreateRole}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              {t('actions.create')}
            </Btn>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchInput
            placeholder={t('searchPlaceholder')}
            onSearch={handleSearch}
            value={searchTerm}
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {roles.length === 0 ? (
            <EmptyState
              title={t('noData')}
              description={t('noDataDesc')}
            />
          ) : (
            <>
              <RoleTable
                roles={roles}
                onViewDetails={handleViewDetails}
                onEdit={handleEditRole}
                onDelete={handleDeleteRole}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drawer for create/edit */}
      <Drawer
        id="role-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={editingRole ? t('editTitle') : t('createTitle')}
        onSave={handleFormSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <RoleForm
          ref={formRef}
          role={editingRole}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {/* Delete confirmation modal */}
      <DeleteRoleModal
        role={roleToDelete}
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
} 