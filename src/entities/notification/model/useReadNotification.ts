import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  readAllNotifications,
  readNotification,
} from '../api/notificationsApi';

export function useReadNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useReadAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
