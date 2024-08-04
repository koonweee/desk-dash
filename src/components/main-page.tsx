'use client';
import { BackgroundProvider } from '@/components/background-provider';
import { GithubContextProvider } from '@/components/github-provider';
import HomeAssistantIframe from '@/components/home-assistant-page/home-assistant-iframe';
import { NAV_BAR_ITEMS, NavBar } from '@/components/nav-bar';
import SpotifyAPIMusicPage from '@/components/spotify-api-music-page';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import WorkPage from '@/components/work-page';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function MainPage() {
  const [api, setApi] = React.useState<CarouselApi>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = searchParams.get('page');
  const currentPageIndex = currentPage ? NAV_BAR_ITEMS.findIndex((item) => item.key === currentPage) : 0;
  const [current, setCurrent] = React.useState(currentPageIndex);
  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const currentNavBarItem = NAV_BAR_ITEMS[current];

  useEffect(() => {
    if (currentNavBarItem) {
      router.push(`/?page=${currentNavBarItem.key}`);
    }
  }, [currentNavBarItem, router]);

  console.count('MainPage render');

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <BackgroundProvider>
        <GithubContextProvider>
          <Carousel
            setApi={setApi}
            className="h-full pb-14"
            opts={{
              loop: true,
              watchDrag: false,
              startIndex: currentPageIndex,
            }}
          >
            <CarouselContent className="h-full">
              {NAV_BAR_ITEMS.map((item) => {
                const { key } = item;
                return (
                  <CarouselItem key={key} className="flex justify-center">
                    {key === 'home' && <HomeAssistantIframe view="default_view" className="h-full w-full px-2 py-4" />}
                    {key === 'music' && <SpotifyAPIMusicPage />}
                    {key === 'work' && <WorkPage />}
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
          <NavBar
            currentPage={current}
            setCurrentPage={api?.scrollTo}
            goToNext={api?.scrollNext}
            goToPrev={api?.scrollPrev}
          />
        </GithubContextProvider>
      </BackgroundProvider>
    </div>
  );
}
