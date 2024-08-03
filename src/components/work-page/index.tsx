import { Octokit } from "@octokit/rest";
import { type GetResponseTypeFromEndpointMethod } from "@octokit/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
const POLL_INTERVAL = 1000 * 60; // 1 minute

export default function WorkPage() {
  const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_PERSONAL_ACCES_TOKEN,
  });

  type GetNotificationsResponseType = GetResponseTypeFromEndpointMethod<
    typeof octokit.activity.listNotificationsForAuthenticatedUser
  >;
  type GetNotificationsResponseDataType =
    GetNotificationsResponseType["data"][number];

  const notificationsQuery = useQuery<GetNotificationsResponseType>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const ghNotifications = await octokit.activity.listNotificationsForAuthenticatedUser({
        headers: {
          'If-None-Match': ''
        }
      });
      return ghNotifications;
    },
    refetchInterval: POLL_INTERVAL,
  });

  const { data: notificationsResponse, dataUpdatedAt } = notificationsQuery;

  return (
    <div className="flex h-full w-[90%] flex-col items-center justify-center">
      <div className="flex w-full flex-row justify-between p-2 text-start">
        <span>GitHub Notifications ({notificationsResponse?.data.length})</span>
        <span>{new Date(dataUpdatedAt).toLocaleString()}</span>
      </div>
      <div className="flex h-[40%] w-full flex-col gap-4 overflow-scroll">
        {notificationsResponse?.data.map(
          (notification: GetNotificationsResponseDataType) => {
            const { subject, repository, unread, updated_at, reason } =
              notification;
            const nMinutesAgo = Math.floor(
              (new Date().getTime() - new Date(updated_at).getTime()) /
              1000 /
              60,
            );
            const timeString =
              nMinutesAgo < 1
                ? "Just now"
                : nMinutesAgo < 60
                  ? `${nMinutesAgo} minutes ago`
                  : nMinutesAgo < 1440
                    ? `${Math.floor(nMinutesAgo / 60)} hours ago`
                    : `${Math.floor(nMinutesAgo / 1440)} days ago`;
            return (
              <div
                key={notification.id}
                className="flex w-full flex-col items-start gap-2 rounded border border-white p-4"
              >
                <div className="flex w-full flex-col items-start">
                  <div className="flex w-full flex-row justify-between text-sm text-muted-foreground">
                    <div className="w-full truncate">
                      {repository.full_name}
                    </div>
                    <div>{unread ? "Unread" : "Read"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {timeString}
                  </span>
                </div>

                <div className="flex w-full flex-row items-end justify-between">
                  <div className="">{subject.title}</div>
                  <div className="flex flex-col items-end text-xs text-muted-foreground">
                    {reason}
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
