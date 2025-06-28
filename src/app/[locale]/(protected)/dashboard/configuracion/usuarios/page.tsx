'use client'

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Btn, SearchInput, EmptyState } from '@/components/atoms';
import { PlusIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { usersService } from '@/services/users.service';
import { toastService } from '@/services/toast.service';
import Loading from '@/components/Loading/Loading';
import Drawer from '@/components/Drawer/Drawer';
import UserForm, { UserFormRef } from '@/components/User/UserForm';
import UserTable from '@/components/User/UserTable';
import DeleteUserModal from '@/components/User/DeleteUserModal';
import Pagination from '@/components/Pagination/Pagination';

export default function UsersPage() {
  const t = useTranslations('pages.users');
  const router = useRouter();
  const locale = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInitialData, setHasInitialData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef<UserFormRef>(null);

  const fetchUsers = async (page: number = 1, term?: string) => {
    try {
      setIsLoading(true);
      const response = await usersService.getUsers(page);
      setUsers(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);

      // Si es la primera carga y no hay término de búsqueda, marcamos que ya tenemos datos iniciales
      if (!hasInitialData && !term) {
        setHasInitialData(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        toastService.error(error.message);
      } else {
        toastService.error(t('messages.errorLoading'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowDrawer(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedUser(null);
    setShowDrawer(false);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    fetchUsers(currentPage, searchTerm);
  };

  const handleDeleteModalClose = () => {
    setSelectedUser(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    handleDeleteModalClose();
    fetchUsers(currentPage, searchTerm);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-xl font-semibold"
          style={{ color: `rgb(var(--color-primary-800))` }}
        >
          {t('title')}
        </h1>
        <Btn
          onClick={() => {
            setSelectedUser(null);
            setShowDrawer(true);
          }}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          {t('newUser')}
        </Btn>
      </div>
      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <SearchInput
          placeholder={t('searchUsers')}
          onSearch={(term: string) => {
            setSearchTerm(term);
            fetchUsers(1, term);
          }}
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : users && users.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          title={t('noUsers')}
          description={t('noUsersDesc')}
          searchDescription={t('noResultsDesc')}
        />
      ) : (
        <>
          <div className="mt-6">
            <UserTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-6"
            />
          )}
        </>
      )}

      <Drawer
        id="user-drawer"
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        title={selectedUser ? t('editUser') : t('newUser')}
        onSave={handleSave}
        isSaving={isSaving}
        isFormValid={isFormValid}
      >
        <UserForm
          ref={formRef}
          user={selectedUser}
          onClose={handleDrawerClose}
          onSuccess={handleFormSuccess}
          onSavingChange={setIsSaving}
          onValidChange={setIsFormValid}
        />
      </Drawer>

      {isDeleteModalOpen && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={handleDeleteModalClose}
          onSuccess={handleDeleteSuccess}
          onDeletingChange={setIsSaving}
        />
      )}
    </div>
  );
} 