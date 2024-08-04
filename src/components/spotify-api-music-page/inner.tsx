'use client';
import { AvailableDevices } from '@/components/spotify-api-music-page/components/available-devices';
import NowPlaying from '@/components/spotify-api-music-page/components/now-playing';
import UserPlaylists from '@/components/spotify-api-music-page/components/user-playlists';
import { useSpotifyLogin } from '@/components/spotify-api-music-page/use-spotify-login';
import { useSpotifyContext } from '@/components/spotify-api-music-page/spotify-provider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CaretUpIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { useSwipeable } from 'react-swipeable';

export function SpotifyAPIMusicPageInner() {
  const spotifyContext = useSpotifyContext();

  const { isLoggedIn } = spotifyContext;

  const { onLogin } = useSpotifyLogin();

  const [showPlaylists, setShowPlaylists] = React.useState(false);

  const loginButton = <button onClick={onLogin}>Log in with Spotify</button>;

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      setShowPlaylists(true);
    },
    onSwipedDown: () => {
      setShowPlaylists(false);
    },
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0">
      {isLoggedIn ? (
        <>
          {/* Actual Spotify API */}
          <div className="flex w-full flex-col items-center gap-0">
            <div className="z-10 w-[90%] opacity-50">
              <AvailableDevices />
            </div>
            <NowPlaying />
          </div>
          <div className="flex w-full flex-col gap-2" {...swipeHandlers}>
            <button className="flex w-full justify-center" onClick={() => setShowPlaylists(!showPlaylists)}>
              <CaretUpIcon
                className={cn('h-12 w-12 opacity-50 transition-all duration-500 ease-in-out', {
                  'rotate-180': showPlaylists,
                })}
              />
            </button>
            <div
              className={cn({
                hidden: !showPlaylists,
              })}
            >
              <UserPlaylists />
            </div>
          </div>
        </>
      ) : (
        loginButton
      )}
    </div>
  );
}
