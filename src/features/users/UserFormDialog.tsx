import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type User } from '../../types/user';
import { useCreateUserMutation, useUpdateUserMutation } from '../../redux/features/users/usersApi';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

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
    control,
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 animate-backdrop-fade" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-xl bg-card border border-border shadow-xl flex flex-col max-h-[90vh] animate-modal-scale text-foreground">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border flex-shrink-0">
          <h3 className="text-lg font-bold text-foreground">
            {isEdit ? 'Edit User Account' : 'Register New User'}
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-semibold text-foreground">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                disabled={isLoading}
                {...register('name')}
                className={
                  errors.name
                    ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                    : ''
                }
                placeholder="Diana Ross"
              />
              {errors.name && (
                <p className="text-[10px] font-semibold text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email (only editable on creation) */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-semibold text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                disabled={isLoading || isEdit}
                {...register('email')}
                className={`${isEdit ? 'bg-muted text-muted-foreground cursor-not-allowed border-border' : ''} ${
                  errors.email
                    ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                    : ''
                }`}
                placeholder="diana.emp@classyerp.com"
              />
              {errors.email && (
                <p className="text-[10px] font-semibold text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password (only visible on creation) */}
            {!isEdit && (
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-semibold text-foreground">
                  Login Password
                </label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  {...register('password')}
                  className={
                    errors.password
                      ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                      : ''
                  }
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-[10px] font-semibold text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            {/* Role Select */}
            <div className="space-y-1">
              <label htmlFor="role" className="block text-xs font-semibold text-foreground">
                System Role
              </label>
              <select
                id="role"
                disabled={isLoading}
                {...register('role')}
                className={`block w-full h-9 rounded-lg border border-input px-3 text-sm text-foreground bg-card focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all ${
                  errors.role ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500' : ''
                }`}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && (
                <p className="text-[10px] font-semibold text-red-600 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Account Status Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <label className="text-xs font-semibold text-foreground">Account Status</label>
                <p className="text-[10px] text-muted-foreground">
                  Allows user to login and access system features.
                </p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field: { value, onChange } }) => (
                  <Checkbox disabled={isLoading} checked={!!value} onCheckedChange={onChange} />
                )}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0 bg-muted/30">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Register User'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
export default UserFormDialog;
