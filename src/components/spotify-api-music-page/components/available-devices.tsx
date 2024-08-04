'use client';

import { useSpotifyContext } from '@/components/spotify-api-music-page/spotify-provider';
import { DelayedSelect, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { SpeakerIcon } from 'lucide-react';
import React, { useMemo } from 'react';

const DEVICES_REFRESH_INTERVAL = 1000 * 3; // 3 seconds

export function AvailableDevices() {
  const {
    isLoggedIn,
    spotifyFetchWithRefresh,
    controls: { setPlaybackDevice },
  } = useSpotifyContext();
  const getPlaybackDevicesQuery = useQuery({
    queryKey: ['getPlaybackDevices'],
    queryFn: async () => {
      if (isLoggedIn) {
        return await spotifyFetchWithRefresh<SpotifyApi.UserDevicesResponse>([
          'https://api.spotify.com/v1/me/player/devices',
          {
            method: 'GET',
          },
        ]);
      }
    },
    enabled: isLoggedIn,
    refetchInterval: DEVICES_REFRESH_INTERVAL,
  });
  const devices = getPlaybackDevicesQuery.data?.devices;
  const activeDevice = useMemo(() => devices?.find((device) => device.is_active), [devices]);
  const [selectedDevice, setSelectedDevice] = React.useState<SpotifyApi.UserDevice | undefined>(activeDevice);
  // Sync selected device with active device
  React.useEffect(() => {
    setSelectedDevice(activeDevice);
  }, [activeDevice, setSelectedDevice]);
  return !isLoggedIn || devices === undefined ? null : (
    <DelayedSelect
      value={selectedDevice ? getIdentifier(selectedDevice) : undefined}
      onValueChange={(identifier: string) => {
        const device = devices.find((device) => getIdentifier(device) === identifier);
        if (device) {
          setSelectedDevice(device);
          setPlaybackDevice(device);
        }
      }}
    >
      <SelectTrigger
        className="m-0 flex w-full flex-row items-center justify-center gap-2 border-0 px-4 py-6 focus:ring-0"
        asChild
      >
        <SpeakerIcon size="16" />
        {selectedDevice ? selectedDevice.name : 'Select a device'}
      </SelectTrigger>
      <SelectContent className="bg-background/70">
        {devices.map((device) => (
          <SelectItem key={device.id} value={getIdentifier(device)} className="bg-transparent">
            {device.name}
          </SelectItem>
        ))}
      </SelectContent>
    </DelayedSelect>
  );
}

function getIdentifier(device: SpotifyApi.UserDevice) {
  return `${device.id}-${device.name}`;
}
