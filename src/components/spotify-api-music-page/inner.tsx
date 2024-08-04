'use client'
import { AvailableDevices } from "@/components/spotify-api-music-page/components/available-devices";
import NowPlaying from "@/components/spotify-api-music-page/components/now-playing";
import UserPlaylists from "@/components/spotify-api-music-page/components/user-playlists";
import { useSpotifyLogin } from "@/components/spotify-api-music-page/use-spotify-login";
import { useSpotifyContext } from "@/components/spotify-api-music-page/spotify-provider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CaretUpIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

export function SpotifyAPIMusicPageInner() {

  const spotifyContext = useSpotifyContext();

  const {
    isLoggedIn,
  } = spotifyContext;

  const { onLogin } = useSpotifyLogin();

  const [accordionValue, setAccordionValue] = React.useState<string | undefined>(undefined);

  const loginButton = <button onClick={onLogin}>Log in with Spotify</button>

  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 w-full">

      {
        isLoggedIn ? <>
          {/* Actual Spotify API */}
          <div className="flex flex-col items-center gap-0 w-full">
            <div className="w-[90%] z-10 opacity-50">
              <AvailableDevices />
            </div>
            <NowPlaying />
          </div>


          <Accordion type="single" collapsible className="z-10 w-full " value={accordionValue} onValueChange={setAccordionValue}>
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger asChild className="flex flex-row justify-center items-center w-full p-0">
                <CaretUpIcon className="h-12 w-12 opacity-50" />
              </AccordionTrigger>
              <AccordionContent>
                <UserPlaylists />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </> : loginButton
      }
    </div>
  );
}



