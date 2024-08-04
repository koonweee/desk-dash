'use client'

import { useSpotifyContext } from "@/components/spotify-api-music-page/spotify-provider";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MusicIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, Volume1Icon, Volume2Icon } from "lucide-react";
import Image from "next/image";
import React from "react";
import { type SwipeEventData, useSwipeable } from "react-swipeable";

const SPOTIFY_REFETCH_INTERVAL = 1000; // 1 second

export default function NowPlaying() {
  const spotifyContext = useSpotifyContext();
  const {
    isLoggedIn,
    controls: {
      onPause,
      onPlay,
      onNext,
      onPrevious,
      setPlaybackVolume,
    },
    spotifyFetchWithRefresh
  } = spotifyContext;

  const currentPlaybackQuery = useQuery({
    queryKey: ['currentPlayback'],
    queryFn: async () => {
      if (isLoggedIn) {
        return await spotifyFetchWithRefresh<SpotifyApi.CurrentPlaybackResponse>(['https://api.spotify.com/v1/me/player']);
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
  }

  const { album, artists } = item as SpotifyApi.TrackObjectFull ?? {
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
  }
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
    )
    setOverlayIconThenClear(overlay);
    setPlaybackVolume(roundedVolume);
  }

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



  return (
    <>
      <div className='flex flex-col items-center gap-1 w-[90%] z-10 '>
        <>
          <div className="relative aspect-square rounded overflow-hidden w-full" {...swipeHandlers} >
            {
              albumImage ? <Image
                src={albumImage}
                alt={album?.name}
                width={1280}
                height={1280}
                className="w-full aspect-square"
              /> : <div className="flex w-full aspect-square bg-muted flex-col items-center justify-center">
                <MusicIcon size={128} />
              </div>
            }
            <button className={
              cn(
                'opacity-0 absolute inset-0 flex items-center justify-center',
                'transition-all ease-in-out duration-500',
                {
                  'bg-black bg-opacity-55 opacity-80': !!showAlbumArtOverlay,
                }
              )
            } onClick={() => {
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
              {
                showAlbumArtOverlay
              }
            </button>
          </div>

          <div className="flex flex-row justify-between items-start w-full px-2 opacity-70">
            <div className="max-w-[60%] truncate">
              {item?.name}
            </div>
            <div className='max-w-[40%] truncate'>
              {artistsString}
            </div>
          </div>
        </>
        {/* <div className="w-full">
          {device?.volume_percent !== undefined &&
            <Slider max={100} step={1} value={[volume]} onValueChange={
              (value) => {
                setVolume(value[0] ?? volume);
              }
            }
              onValueCommit={(values) => {
                setPlaybackVolume(values[0] ?? volume);
              }}
            />}
        </div> */}
      </div>
      <div className="absolute top-0 w-full h-full overflow-hidden">
        {
          albumImage && <Image
            src={albumImage}
            alt={album?.name}
            width={640}
            height={640}
            className="h-full w-full object-cover blur-lg brightness-50 scale-125"
          />
        }
      </div>

    </>
  );
}
