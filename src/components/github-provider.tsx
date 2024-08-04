import { Octokit, type RestEndpointMethodTypes } from '@octokit/rest';
import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';

const POLL_INTERVAL = 1000 * 60; // 1 minute

export type GithubNotification =
  RestEndpointMethodTypes['activity']['listNotificationsForAuthenticatedUser']['response']['data'][number];

export interface GithubContextType {
  notifications: GithubNotification[];
  markNotificationsDone: (notificationIds: number[]) => void;
  isLoading: boolean;
}

export const GithubContext = React.createContext<GithubContextType | null>(null);

const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_PERSONAL_ACCESS_TOKEN,
});

export function GithubContextProvider({ children }: { children: React.ReactNode }) {
  const notificationsQuery = useQuery<GithubNotification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const ghNotifications = await octokit.activity.listNotificationsForAuthenticatedUser({
        headers: {
          'If-None-Match': '', // Disable caching
        },
      });
      return ghNotifications.data;
    },
    refetchInterval: POLL_INTERVAL,
  });

  const markNotificationsDoneMutation = useMutation({
    mutationFn: async (notificationIds: number[]) => {
      const responses = await Promise.all(
        notificationIds.map((id) => octokit.activity.markThreadAsDone({ thread_id: id })),
      );
    },
    onSuccess: () => {
      void notificationsQuery.refetch();
    },
  });

  const { data: notifications = [], isLoading } = notificationsQuery;
  const { mutate: markNotificationsDone } = markNotificationsDoneMutation;

  return (
    <GithubContext.Provider value={{ notifications, isLoading, markNotificationsDone }}>
      {children}
    </GithubContext.Provider>
  );
}

export function useGithubContext() {
  const context = React.useContext(GithubContext);
  if (!context) {
    throw new Error('useGithubContext must be used within a GithubContextProvider');
  }
  return context;
}
