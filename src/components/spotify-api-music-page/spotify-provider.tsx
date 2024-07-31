'use client'
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React, { createContext } from "react";

export interface SpotifyContext {
  isLoggedIn: boolean
  controls: {
    onPause: () => void
    onPlay: () => void
    onNext: () => void
    onPrevious: () => void
    setPlaybackVolume: (volume: number) => void
    playURI: (uri: string) => void
    setPlaybackDevice: (device: SpotifyApi.UserDevice) => void
  }
  spotifyFetchWithRefresh: <T>(fetchProps: Parameters<typeof fetch>) => Promise<T | null>
}

export const SpotifyContext = createContext<SpotifyContext | null>(null);

export function SpotifyContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [authToken, setAuthToken] = React.useState<string | undefined>();
  const [refreshToken, setRefreshToken] = React.useState<string | undefined>();

  // On mount, check for existings tokens in local storage and set them to state
  React.useEffect(() => {
    const storedAuthToken = window.localStorage.getItem('spotify_access_token');
    const storedRefreshToken = window.localStorage.getItem('spotify_refresh_token');
    if (storedAuthToken && storedRefreshToken) {
      setAuthToken(storedAuthToken);
      setRefreshToken(storedRefreshToken);
    }
  }, []);


  // To listen to login callback
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  React.useEffect(() => {
    if (!code) {
      console.info('no code')
      return
    }
    const code_verifier = window.localStorage.getItem('spotify_code_verifier')
    if (!code_verifier) {
      console.info('no code_verifier')
      return
    }
    const existing_access_token = window.localStorage.getItem('access_token')
    if (existing_access_token) {
      console.info('existing access token')
      return
    }
    // Throw if client id or redirect uri is not string
    if (typeof process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID !== 'string' || typeof process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI !== 'string') {
      throw new Error('Client id or redirect uri is not a string')
    }
    // POST to spotify to get and store auth tokens
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
        code_verifier
      })
    }
    const getAccessToken = async () => {
      const response = await fetch('https://accounts.spotify.com/api/token', payload)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: {
        access_token: string;
        refresh_token: string;
      } = await response.json()
      const { access_token, refresh_token } = data
      // Throw if access token or refresh token is not string
      if (typeof access_token !== 'string' || typeof refresh_token !== 'string') {
        throw new Error('Access token or refresh token is not a string')
      }

      window.localStorage.setItem('spotify_access_token', access_token)
      window.localStorage.setItem('spotify_refresh_token', refresh_token)
      setAuthToken(access_token)
      setRefreshToken(refresh_token)
    }
    getAccessToken().catch(console.error)
  }, [code])

  async function spotifyFetchWithRefresh<T>(fetchProps: Parameters<typeof fetch>): Promise<T | null> {
    const [url, init] = fetchProps;
    type ReturnType = T & {
      error?: {
        status: number,
        message: string,
      }
    }
    try {
      let json: null | ReturnType = null;
      let response: Response;
      response = await fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json = await response.json() as ReturnType;
      if (json.error && json.error.status === 401) {
        if (!refreshToken) {
          // Redirect to login page
          router.push('/api/spotify/login');
          throw new Error('Failed to refresh access token');
        }
        // Refresh token
        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");
        const formData = new URLSearchParams();
        formData.append("grant_type", "refresh_token");
        formData.append("refresh_token", refreshToken);
        formData.append("client_id", process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);
        const authResponse = await fetch("https://accounts.spotify.com/api/token", {
          headers,
          body: formData,
          method: "POST",
        });
        if (!authResponse.ok) {
          throw new Error('Failed to refresh access token');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const authData: {
          access_token: string;
          refresh_token: string;
        } = await authResponse.json();
        const { access_token, refresh_token } = authData;
        // store in local storage
        window.localStorage.setItem('spotify_access_token', access_token)
        window.localStorage.setItem('spotify_refresh_token', refresh_token)
        setAuthToken(access_token)
        setRefreshToken(refresh_token)
        response = await fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${access_token}`,
          },
        });
        json = await response.json() as ReturnType;
      }
      // if status code is 204, return null
      if (json?.error?.status === 204) {
        return null;
      }
      return json
    } catch (error) {
      throw error
    }
  }
  const isLoggedIn = !!authToken && !!refreshToken;
  const controls = useSpotifyControls(spotifyFetchWithRefresh, isLoggedIn);

  return <SpotifyContext.Provider value={
    {
      isLoggedIn,
      controls,
      spotifyFetchWithRefresh,
    }
  }>{children}</SpotifyContext.Provider>;
}

function useSpotifyControls(spotifyFetchWithRefresh: <T>(fetchProps: Parameters<typeof fetch>) => Promise<T | null>, isLoggedIn: boolean) {
  const pauseMutation = useMutation({
    mutationFn: async () => {
      if (isLoggedIn) {
        await spotifyFetchWithRefresh(['https://api.spotify.com/v1/me/player/pause', {
          method: 'PUT',
        }]);
      }
    },
  })

  const playMutation = useMutation({
    mutationFn: async () => {
      if (isLoggedIn) {
        await spotifyFetchWithRefresh(['https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
        }]);
      }
    },
  })

  const nextMutation = useMutation({
    mutationFn: async () => {
      if (isLoggedIn) {
        await spotifyFetchWithRefresh(['https://api.spotify.com/v1/me/player/next', {
          method: 'POST',
        }]);
      }
    },
  })

  const previousMutation = useMutation({
    mutationFn: async () => {
      if (isLoggedIn) {
        await spotifyFetchWithRefresh(['https://api.spotify.com/v1/me/player/previous', {
          method: 'POST',
        }]);
      }
    },
  })

  const setPlaybackVolumeMutation = useMutation({
    mutationFn: async (volume: number) => {
      const adjustedVolume = Math.min(100, Math.max(0, volume));
      if (isLoggedIn) {
        await spotifyFetchWithRefresh(['https://api.spotify.com/v1/me/player/volume' + `?volume_percent=${adjustedVolume}`, {
          method: 'PUT',
        }]);
      }
    },
  })

  const playURIMutation = useMutation({
    mutationFn: async (uri: string) => {
      if (isLoggedIn) {
        await spotifyFetchWithRefresh(['https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          body: JSON.stringify({
            context_uri: uri,
          }),
        }]);
      }
    },
  })

  const setPlaybackDeviceMutation = useMutation({
    mutationFn: async (device: SpotifyApi.UserDevice) => {
      if (isLoggedIn) {
        await spotifyFetchWithRefresh(['https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          body: JSON.stringify({
            device_ids: [device.id],
            play: true,
          }),
        }]);
      }
    },
  })



  return {
    onPause: pauseMutation.mutate,
    onPlay: playMutation.mutate,
    onNext: nextMutation.mutate,
    onPrevious: previousMutation.mutate,
    setPlaybackVolume: setPlaybackVolumeMutation.mutate,
    playURI: playURIMutation.mutate,
    setPlaybackDevice: setPlaybackDeviceMutation.mutate,
  }
}

export function useSpotifyContext() {
  const sdk = React.useContext(SpotifyContext);
  if (!sdk) {
    throw new Error("useSpotifyContext must be used within a SpotifyContextProvider");
  }
  return sdk;
}

