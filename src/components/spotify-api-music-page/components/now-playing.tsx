'use client';

import { useBackgroundContext } from '@/components/background-provider';
import { useSpotifyContext } from '@/components/spotify-api-music-page/spotify-provider';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { MusicIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, Volume1Icon, Volume2Icon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { type SwipeEventData, useSwipeable } from 'react-swipeable';

const SPOTIFY_REFETCH_INTERVAL = 1000; // 1 second

export default function NowPlaying() {
  const spotifyContext = useSpotifyContext();
  const {
    isLoggedIn,
    controls: { onPause, onPlay, onNext, onPrevious, setPlaybackVolume },
    spotifyFetchWithRefresh,
  } = spotifyContext;

  const currentPlaybackQuery = useQuery({
    queryKey: ['currentPlayback'],
    queryFn: async () => {
      if (isLoggedIn) {
        return await spotifyFetchWithRefresh<SpotifyApi.CurrentPlaybackResponse>([
          'https://api.spotify.com/v1/me/player',
        ]);
      }
    },
    enabled: isLoggedIn,
    refetchInterval: SPOTIFY_REFETCH_INTERVAL,
  });
  const { data, isLoading } = currentPlaybackQuery;
  const { item, is_playing, device } = data ?? {};
  const { volume_percent } = device ?? {};

  const [showAlbumArtOverlay, setShowAlbumArtOverlay] = React.useState<React.ReactElement | null>(null);

  const setOverlayIconThenClear = (icon: React.ReactElement) => {
    setShowAlbumArtOverlay(icon);
    setTimeout(() => {
      setShowAlbumArtOverlay(null);
    }, 1000);
  };

  const { album, artists } = (item as SpotifyApi.TrackObjectFull) ?? {
    album: undefined,
    artists: [],
  };
  const albumImage = album?.images[0]?.url;
  const artistsString = artists.map((artist) => artist.name).join(', ');

  const [volume, setVolume] = React.useState(volume_percent ?? 0);

  // Keep volume state in sync with device volume
  React.useEffect(() => {
    if (volume_percent !== undefined && volume_percent !== null) {
      setVolume(volume_percent);
    }
  }, [volume_percent]);

  const onNoDevice = () => {
    setOverlayIconThenClear(<div className="text-xl">Select a device</div>);
  };
  const updateVolumeOnSwipe = (deltaY: number) => {
    if (!device) {
      return onNoDevice();
    }
    const factor = 0.02;
    const adjustment = -deltaY * factor;
    const newVolume = Math.min(100, Math.max(0, volume + adjustment));
    const roundedVolume = Math.round(newVolume);
    const overlayIcon = adjustment > 0 ? <Volume2Icon size={64} /> : <Volume1Icon size={64} />;
    const overlay = (
      <div className="flex flex-col justify-center gap-2 text-2xl">
        {overlayIcon}
        {roundedVolume}%
      </div>
    );
    setOverlayIconThenClear(overlay);
    setPlaybackVolume(roundedVolume);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!device) {
        return onNoDevice();
      }
      onNext();
      setOverlayIconThenClear(<SkipForwardIcon size={64} />);
    },
    onSwipedRight: () => {
      if (!device) {
        return onNoDevice();
      }
      onPrevious();
      setOverlayIconThenClear(<SkipBackIcon size={64} />);
    },
    onSwipedDown: (eventData: SwipeEventData) => {
      updateVolumeOnSwipe(eventData.deltaY);
    },
    onSwipedUp: (eventData: SwipeEventData) => {
      updateVolumeOnSwipe(eventData.deltaY);
    },
  });

  const { setBackgroundUrl } = useBackgroundContext();

  // Set background image to album art
  React.useEffect(() => {
    setBackgroundUrl(albumImage);
  }, [albumImage, setBackgroundUrl]);

  return (
    <>
      <div className="z-10 flex w-[90%] flex-col items-center gap-1">
        <>
          <div className="relative aspect-square w-full overflow-hidden rounded" {...swipeHandlers}>
            {albumImage ? (
              <Image src={albumImage} alt={album?.name} width={1280} height={1280} className="aspect-square w-full" />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center bg-muted">
                <MusicIcon size={128} />
              </div>
            )}
            <button
              className={cn(
                'absolute inset-0 flex items-center justify-center opacity-0',
                'linear transition-colors transition-opacity duration-300',
                {
                  'bg-black bg-opacity-55 opacity-80': !!showAlbumArtOverlay,
                },
              )}
              onClick={() => {
                if (!device) {
                  return onNoDevice();
                }
                if (is_playing) {
                  onPause();
                  setOverlayIconThenClear(<PauseIcon size={64} />);
                } else {
                  onPlay();
                  setOverlayIconThenClear(<PlayIcon size={64} />);
                }
              }}
            >
              {showAlbumArtOverlay}
            </button>
          </div>

          <div className="flex w-full flex-col items-center py-4 text-foreground/90">
            <div className="max-w-[75%] truncate text-xl">{item?.name ?? 'No music selected'}</div>
            <div className="max-w-[75%] truncate text-base">{artistsString ?? '-'}</div>
          </div>
        </>
      </div>
    </>
  );
}
