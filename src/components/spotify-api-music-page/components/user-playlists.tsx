'use client'

import { useSpotifyContext } from "@/components/spotify-api-music-page/spotify-provider";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query"
import Image from "next/image";

export default function UserPlaylists() {
  const spotifyContext = useSpotifyContext();
  const {
    isLoggedIn,
    spotifyFetchWithRefresh,
    controls: {
      playURI,
    }
  } = spotifyContext;

  const { data: userPlaylists, isLoading, error } = useQuery(
    {

      queryKey: ['spotify-user-playlists'],
      queryFn: async () => {
        if (!isLoggedIn) {
          return;
        }
        const response = await spotifyFetchWithRefresh<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(['https://api.spotify.com/v1/me/playlists', {
          method: 'GET',
        }]);
        return response;
      },
    },
  )

  const { items } = userPlaylists ?? {};
  const playlistsFound = items?.length && items.length > 0;
  return (
    <div className="flex w-full p-0 justify-center">
      {
        !playlistsFound && !isLoading && <div className="text-center text-muted-foreground">No playlists found</div>
      }
      {
        playlistsFound && (
          <Carousel
            className="w-[90%] overscroll-contain"
            opts={
              { dragFree: true }
            }
          >
            <CarouselContent>
              {items.map((playlist, index) => {
                const { name, images, uri } = playlist;
                const playlistImage = images[0]?.url;
                return (
                  <CarouselItem key={index} className="basis-1/4">
                    {
                      playlistImage ? (
                        <button onClick={() => playURI(uri)}>
                          <Image key={index} src={playlistImage} alt={name} width={640} height={640} className="aspect-square object-cover" />
                        </button>
                      ) : null
                    }
                  </CarouselItem>)
              })}
            </CarouselContent>
          </Carousel>
        )
      }
    </div>
  );
}

