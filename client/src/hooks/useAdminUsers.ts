import { useState, useEffect, useCallback } from 'react';
import type { AdminUser, CreateUserInput, UpdateUserInput } from '../types/admin';
import { userService } from '../services/user.service';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    userService
      .getAllUsers()
      .then((data) => {
        if (!ignore) {
          setUsers(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  }, []);

  const toggleStatus = useCallback(async (targetUser: AdminUser) => {
    const originalStatus = targetUser.isActive;
    const newStatus = !originalStatus;

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.userId === targetUser.userId ? { ...u, isActive: newStatus } : u))
    );

    try {
      await userService.toggleUserStatus(targetUser.userId, newStatus);
    } catch (err: unknown) {
      // Rollback to original status on failure
      setUsers((prev) =>
        prev.map((u) => (u.userId === targetUser.userId ? { ...u, isActive: originalStatus } : u))
      );
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể thay đổi trạng thái tài khoản. Đã hoàn tác thao tác.'
      );
    }
  }, []);

  const saveUser = useCallback(
    async (formData: CreateUserInput | UpdateUserInput, editingUserId?: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        if (editingUserId) {
          const updated = await userService.updateUser(editingUserId, formData as UpdateUserInput);
          setUsers((prev) =>
            prev.map((u) => (u.userId === editingUserId ? updated : u))
          );
        } else {
          const created = await userService.createUser(formData as CreateUserInput);
          setUsers((prev) => [created, ...prev]);
        }
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Không thể lưu thông tin người dùng.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    users,
    isLoading,
    error,
    isSubmitting,
    clearError: () => setError(null),
    refresh,
    toggleStatus,
    saveUser,
  };
}

export default useAdminUsers;
