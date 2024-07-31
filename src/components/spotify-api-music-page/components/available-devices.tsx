'use client'

import { useSpotifyContext } from "@/components/spotify-api-music-page/spotify-provider";
import {
  DelayedSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query";
import { SpeakerIcon } from "lucide-react";
import React from "react";

const DEVICES_REFRESH_INTERVAL = 1000 * 3 // 3 seconds

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
        return await spotifyFetchWithRefresh<SpotifyApi.UserDevicesResponse>(['https://api.spotify.com/v1/me/player/devices', {
          method: 'GET',
        }]);
      }
    },
    enabled: isLoggedIn,
    refetchInterval: DEVICES_REFRESH_INTERVAL
  })
  const devices = getPlaybackDevicesQuery.data?.devices;
  const activeDevice = devices?.find((device) => device.is_active);
  console.log(activeDevice)
  const [selectedDevice, setSelectedDevice] = React.useState<SpotifyApi.UserDevice | undefined>(activeDevice);
  // Sync selected device with active device
  React.useEffect(() => {
    if (activeDevice) {
      setSelectedDevice(activeDevice);
    }
  }, [activeDevice, setSelectedDevice])
  return !isLoggedIn || devices === undefined ? null : (
    <DelayedSelect value={selectedDevice ? getIdentifier(selectedDevice) : undefined} onValueChange={(identifier: string) => {
      const device = devices.find((device) => getIdentifier(device) === identifier);
      if (device) {
        setSelectedDevice(device);
        setPlaybackDevice(device);
      }
    }}>
      <SelectTrigger className="border-0 flex flex-row justify-normal gap-2 p-2 m-0 w-[160px] focus:ring-0 items-center" asChild>
        <SpeakerIcon size='16' />
        {selectedDevice ? selectedDevice.name : 'Select a device'}
      </SelectTrigger>
      <SelectContent>
        {/* <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem> */}
        {devices.map((device) => (
          <SelectItem key={device.id} value={getIdentifier(device)}>
            {device.name}
          </SelectItem>
        ))}
      </SelectContent>
    </DelayedSelect>
  )
}

function getIdentifier(device: SpotifyApi.UserDevice) {
  return `${device.id}-${device.name}`;
}
