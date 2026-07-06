import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type User } from '../../types/user';
import { useCreateUserMutation, useUpdateUserMutation } from '../../redux/features/users/usersApi';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Manager', 'Employee']),
  isActive: z.boolean().default(true),
});

const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['Admin', 'Manager', 'Employee']),
  isActive: z.boolean(),
});

interface UserFormInputValues {
  name: string;
  email?: string;
  password?: string;
  role: 'Admin' | 'Manager' | 'Employee';
  isActive: boolean;
}

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ isOpen, onClose, user }) => {
  const isEdit = !!user;
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isLoading = isCreating || isUpdating;

  const [prevUser, setPrevUser] = useState<User | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormInputValues>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
  });

  if (isOpen !== prevIsOpen || user !== prevUser) {
    setPrevIsOpen(isOpen);
    setPrevUser(user);
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          role: 'Employee',
          isActive: true,
        });
      }
    }
  }

  const onSubmit = async (data: UserFormInputValues) => {
    try {
      if (isEdit && user) {
        await updateUser({
          id: user._id,
          userData: {
            name: data.name,
            role: data.role,
            isActive: data.isActive,
          },
        }).unwrap();
        toast.success('User updated successfully!');
      } else {
        await createUser({
          name: data.name,
          email: data.email ?? '',
          password: data.password ?? '',
          role: data.role,
          isActive: data.isActive,
        }).unwrap();
        toast.success('User created successfully!');
      }
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message ?? 'Failed to submit form data.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-backdrop-fade"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-xl flex flex-col max-h-[90vh] animate-modal-scale">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-950">
            {isEdit ? 'Edit User Account' : 'Register New User'}
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                disabled={isLoading}
                {...register('name')}
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                  errors.name
                    ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                    : 'border-slate-200'
                }`}
                placeholder="Jane Doe"
              />
              {errors.name?.message && (
                <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email (only on Create) */}
            {!isEdit && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  disabled={isLoading}
                  {...register('email')}
                  className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                    errors.email
                      ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                      : 'border-slate-200'
                  }`}
                  placeholder="jane.doe@company.com"
                />
                {errors.email?.message && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
            )}

            {/* Password (only on Create) */}
            {!isEdit && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  {...register('password')}
                  className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                    errors.password
                      ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                      : 'border-slate-200'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password?.message && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                Account Role
              </label>
              <select
                id="role"
                disabled={isLoading}
                {...register('role')}
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Employee">Employee (Staff)</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Administrator</option>
              </select>
              {errors.role?.message && (
                <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Active Switch (only on Edit) */}
            {isEdit && (
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="isActive"
                  type="checkbox"
                  disabled={isLoading}
                  {...register('isActive')}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Account Active / Enabled
                </label>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xs focus:outline-none disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Register User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserFormDialog;
