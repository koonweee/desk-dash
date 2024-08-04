'use client';

import { useSpotifyContext } from '@/components/spotify-api-music-page/spotify-provider';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { PlayCircleIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export default function UserPlaylists() {
  const spotifyContext = useSpotifyContext();
  const {
    isLoggedIn,
    spotifyFetchWithRefresh,
    controls: { playURI },
  } = spotifyContext;

  const { data: userPlaylists, isLoading } = useQuery({
    queryKey: ['spotify-user-playlists'],
    queryFn: async () => {
      if (!isLoggedIn) {
        return;
      }
      const response = await spotifyFetchWithRefresh<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>([
        'https://api.spotify.com/v1/me/playlists',
        {
          method: 'GET',
        },
      ]);
      return response;
    },
  });

  const [selectedPlaylistURI, setSelectedPlaylistURI] = React.useState<string | undefined>(undefined);

  // Clear selected playlist after 3 seconds
  React.useEffect(() => {
    if (selectedPlaylistURI) {
      const timeout = setTimeout(() => {
        setSelectedPlaylistURI(undefined);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [selectedPlaylistURI, setSelectedPlaylistURI]);

  const { items } = userPlaylists ?? {};
  const playlistsFound = items?.length && items.length > 0;
  return (
    <div className="flex w-full justify-center p-0">
      {!playlistsFound && !isLoading && <div className="text-center text-muted-foreground">No playlists found</div>}
      {playlistsFound && (
        <Carousel className="w-[90%] overscroll-contain" opts={{ dragFree: true }}>
          <CarouselContent>
            {items.map((playlist, index) => {
              const { name, images, uri } = playlist;
              const playlistImage = images[0]?.url;
              return (
                <CarouselItem key={index} className="basis-1/4">
                  {playlistImage ? (
                    <button
                      onClick={() => setSelectedPlaylistURI(selectedPlaylistURI === uri ? undefined : uri)}
                      className="relative overflow-hidden rounded"
                    >
                      <Image
                        key={index}
                        src={playlistImage}
                        alt={name}
                        width={640}
                        height={640}
                        className="aspect-square object-cover"
                      />
                      <div
                        className={cn(
                          'linear absolute top-0 flex h-full w-full flex-col items-center justify-center gap-4 bg-background/70 p-4 text-sm transition-opacity duration-300',
                          {
                            'opacity-0': selectedPlaylistURI !== uri,
                          },
                        )}
                      >
                        {name}
                        <button
                          onClick={() => {
                            if (selectedPlaylistURI === uri) {
                              playURI(uri);
                            }
                          }}
                        >
                          <PlayCircleIcon size={24} />
                        </button>
                      </div>
                    </button>
                  ) : null}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}
