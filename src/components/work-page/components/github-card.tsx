import { type GithubNotification, useGithubContext } from '@/components/github-provider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircleIcon } from 'lucide-react';
import React from 'react';

export default function GitHubCard() {
  const { notifications, isLoading, markNotificationsDone } = useGithubContext();

  const [selectedNotificationIds, setSelectedNotificationIds] = React.useState<number[]>([]);

  return (
    <div className="flex flex-col items-center border border-white">
      <div
        className={cn('flex w-full flex-row items-center justify-between px-4 py-3 text-start text-sm', {
          'border-b border-white': isLoading || notifications.length > 0,
        })}
      >
        <div className="">GitHub ({notifications.length})</div>
        {selectedNotificationIds.length > 0 && (
          <div className="flex items-center gap-4">
            <button
              className="text-xs"
              onClick={() => {
                markNotificationsDone(selectedNotificationIds);
                setSelectedNotificationIds([]);
              }}
            >
              <CheckCircle size={18} />
            </button>
            <button className="text-xs" onClick={() => setSelectedNotificationIds([])}>
              <XCircleIcon size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="flex max-h-[335px] flex-col overflow-scroll">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonNotificationCard key={i} />)}
        {notifications.map((notification: GithubNotification, i) => {
          return (
            <NotificationCard
              key={notification.id}
              notification={notification}
              selectedNotificationIds={selectedNotificationIds}
              setSelectedNotificationIds={setSelectedNotificationIds}
              hideSeparator={i === notifications.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}

function SkeletonNotificationCard() {
  {
    /* Skeltonized notification card */
  }
  return (
    <div className="flex w-full flex-col items-start gap-1 border-b border-white p-3 text-start last:border-b-0">
      <div className="flex w-full flex-row justify-between text-sm text-muted-foreground">
        <Skeleton className="h-[40px] w-[220px]" />
        <Skeleton className="h-[20px] w-[60px]" />
      </div>

      <div className="flex w-full flex-row items-end justify-between">
        <Skeleton className="h-[48px] w-[400px]" />
        <Skeleton className="h-[16px] w-[94px]" />
      </div>
    </div>
  );
}

const NotificationCard = ({
  notification,
  selectedNotificationIds,
  setSelectedNotificationIds,
  hideSeparator,
}: {
  notification: GithubNotification;
  selectedNotificationIds: number[];
  setSelectedNotificationIds: (ids: number[]) => void;
  hideSeparator?: boolean;
}) => {
  const { subject, repository, unread, updated_at, reason } = notification;
  const nMinutesAgo = Math.floor((new Date().getTime() - new Date(updated_at).getTime()) / 1000 / 60);
  const timeString =
    nMinutesAgo < 1
      ? 'Just now'
      : nMinutesAgo < 60
        ? `${nMinutesAgo} minutes ago`
        : nMinutesAgo < 1440
          ? `${Math.floor(nMinutesAgo / 60)} hours ago`
          : `${Math.floor(nMinutesAgo / 1440)} days ago`;
  const idAsNumber = Number(notification.id);
  const isSelected = selectedNotificationIds.includes(idAsNumber);
  return (
    <div
      className={cn('flex flex-col items-center px-3', {
        'bg-accent': isSelected,
      })}
    >
      <button
        key={notification.id}
        className={'flex w-full flex-col items-start gap-1 py-3 text-start last:border-b-0'}
        onClick={() =>
          setSelectedNotificationIds(
            isSelected
              ? selectedNotificationIds.filter((id) => id !== idAsNumber)
              : [...selectedNotificationIds, idAsNumber],
          )
        }
      >
        <div className="flex w-full flex-col items-start">
          <div className="flex w-full flex-row justify-between text-sm text-muted-foreground">
            <div className="w-full truncate">{repository.full_name}</div>
            <div>{unread ? 'Unread' : 'Read'}</div>
          </div>
          <span className="text-xs text-muted-foreground">{timeString}</span>
        </div>

        <div className="flex w-full flex-row items-end justify-between">
          {subject.title}
          <div className="text-xs text-muted-foreground">{reason}</div>
        </div>
      </button>
      {!hideSeparator && <Separator className="w-full bg-white opacity-50" />}
    </div>
  );
};
