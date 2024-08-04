'use client';

import { SpotifyAPIMusicPageInner } from '@/components/spotify-api-music-page/inner';
import { SpotifyContextProvider } from '@/components/spotify-api-music-page/spotify-provider';

export default function SpotifyAPIMusicPage() {
  return (
    <SpotifyContextProvider>
      <SpotifyAPIMusicPageInner />
    </SpotifyContextProvider>
  );
}
