'use client'
import HomeAssistantIframe from "@/components/home-assistant/home-assistant-iframe";
import { NAV_BAR_ITEMS, NavBar } from "@/components/nav-bar";
import SpotifyAPIMusicPage from "@/components/spotify-api-music-page";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export default function InnerPage() {
  const [api, setApi] = React.useState<CarouselApi>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPage = searchParams.get('page')
  const currentPageIndex = currentPage ? NAV_BAR_ITEMS.findIndex(item => item.key === currentPage) : 0
  const [current, setCurrent] = React.useState(currentPageIndex)
  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const currentNavBarItem = NAV_BAR_ITEMS[current]

  useEffect(() => {
    if (currentNavBarItem) {
      router.push(`/?page=${currentNavBarItem.key}`)
    }
  }, [currentNavBarItem, router])

  return (
    <div className="flex flex-col h-full justify-between w-full">
      <Carousel setApi={setApi} className="h-full" opts={{
        loop: true,
        watchDrag: false,
        startIndex: currentPageIndex
      }}>
        <CarouselContent className="h-full">
          {NAV_BAR_ITEMS.map((item) => {
            const { key } = item
            return (
              <CarouselItem key={key} className="flex items-center justify-center bg-background">
                {
                  key === 'home' && <HomeAssistantIframe view="default_view" className="w-full h-full" />
                }
                {
                  key === 'music' && <SpotifyAPIMusicPage />
                }
              </CarouselItem>)
          })}
        </CarouselContent>
      </Carousel>
      <NavBar currentPage={current} setCurrentPage={api?.scrollTo} goToNext={api?.scrollNext} goToPrev={api?.scrollPrev} />
    </div>
  )
}




