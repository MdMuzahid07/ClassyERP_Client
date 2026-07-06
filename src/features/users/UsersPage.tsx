import React, { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../../redux/features/users/usersApi';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchInput } from '../../components/shared/SearchInput';
import { Pagination } from '../../components/shared/Pagination';
import { RoleBadge } from '../../components/layout/RoleBadge';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { UserFormDialog } from './UserFormDialog';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UserX,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { type User } from '../../types/user';
import { UsersSkeleton } from '../../skeleton/UsersSkeleton';

export const UsersPage: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data, isLoading, error, refetch } = useGetUsersQuery({ search, page, limit });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Dialog & Prompt State
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    const isSelf = user._id === currentUser?._id;
    if (isSelf) {
      toast.error("You can't deactivate your own account.");
      return;
    }

    try {
      await updateUser({
        id: user._id,
        userData: { isActive: !user.isActive },
      }).unwrap();
      toast.success(`User account ${!user.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to update user status';
      toast.error(errorMsg);
    }
  };

  const handleDeletePrompt = (user: User) => {
    const isSelf = user._id === currentUser?._id;
    if (isSelf) {
      toast.error("You can't delete your own account.");
      return;
    }
    setUserToDelete(user);
    setDeleteUserOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete._id).unwrap();
      toast.success('User deleted successfully');
      setDeleteUserOpen(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete user';
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return <UsersSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-red-100 rounded-xl text-center space-y-4 shadow-xs">
        <div className="p-3 bg-red-50 text-red-600 rounded-full">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-800">Failed to Load User Registry</h3>
          <p className="text-xs text-slate-500">
            There was a problem communicating with the server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const { users = [], meta } = data ?? {
    users: [],
    meta: { page: 1, limit, total: 0, totalPage: 1 },
  };

  return (
    <div className="space-y-6 animate-page-entrance">
      <PageHeader
        title="User Management"
        description="Admin panel to add staff, manage roles, and toggle account activation states."
      >
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xs focus:outline-none transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </PageHeader>

      <div className="flex items-center gap-4 justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search users by Name or Email..."
        />
      </div>

      {users.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop/Tablet Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {users.map((user) => {
                    const isSelf = user._id === currentUser?._id;

                    return (
                      <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {user.name}{' '}
                          {isSelf && (
                            <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded ml-1">
                              (You)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              user.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2.5 items-center">
                            {/* Toggle active state */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              disabled={isSelf || isUpdating}
                              className={`p-1.5 rounded transition-colors ${
                                isSelf
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : user.isActive
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-slate-400 hover:bg-slate-50'
                              }`}
                              title={
                                isSelf
                                  ? "You can't deactivate yourself"
                                  : user.isActive
                                    ? 'Deactivate User'
                                    : 'Activate User'
                              }
                            >
                              {user.isActive ? (
                                <ToggleRight className="h-5 w-5" />
                              ) : (
                                <ToggleLeft className="h-5 w-5" />
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleEdit(user)}
                              disabled={isUpdating}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded"
                              title="Edit Details"
                            >
                              <Edit2 className="h-4.5 w-4.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeletePrompt(user)}
                              disabled={isSelf || isDeleting}
                              className={`p-1 rounded ${
                                isSelf
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : 'text-slate-500 hover:text-red-600 hover:bg-slate-50'
                              }`}
                              title={isSelf ? "You can't delete yourself" : 'Delete Account'}
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              limit={limit}
              total={meta?.total ?? 0}
              totalPage={meta?.totalPage ?? 1}
              onPageChange={setPage}
            />
          </div>

          {/* Mobile Stacked Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => {
                const isSelf = user._id === currentUser?._id;

                return (
                  <div
                    key={user._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-base">
                          {user.name}{' '}
                          {isSelf && (
                            <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded ml-1">
                              (You)
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                      <RoleBadge role={user.role} />
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500 block">Status</span>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            user.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex gap-2.5 items-center">
                        {/* Status Switch Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isSelf || isUpdating}
                          className={`p-1.5 rounded ${
                            isSelf
                              ? 'text-slate-200 cursor-not-allowed'
                              : user.isActive
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                          }`}
                        >
                          {user.isActive ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded border border-slate-100"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleDeletePrompt(user)}
                          className={`p-1 rounded border border-slate-100 ${
                            isSelf
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-500 hover:text-red-600'
                          }`}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <Pagination
                page={page}
                limit={limit}
                total={meta?.total ?? 0}
                totalPage={meta?.totalPage ?? 1}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center shadow-xs">
          <UserX className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No users registered</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or add a new staff account above.
          </p>
        </div>
      )}

      {/* Forms & Prompts */}
      <UserFormDialog isOpen={formOpen} onClose={() => setFormOpen(false)} user={selectedUser} />

      <ConfirmDialog
        isOpen={deleteUserOpen}
        onClose={() => setDeleteUserOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account?"
        description="Are you sure you want to permanently delete this user account? This action will completely remove their access and cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
};
export default UsersPage;
