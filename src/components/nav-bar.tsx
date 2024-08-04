import { useGithubContext } from "@/components/github-provider";
import { cn } from "@/lib/utils";
import { House, LucideGithub, Music } from "lucide-react";
import React, { type ReactElement, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

export interface CarouselNavBarItem {
  title: string
  icon: ReactElement
  key: string
}

const ICON_SIZE = 20

export const NAV_BAR_ITEMS: CarouselNavBarItem[] = [
  {
    title: 'Home',
    icon: <House size={ICON_SIZE} />,
    key: 'home',
  },
  {
    title: 'Music',
    icon: <Music size={ICON_SIZE} />,
    key: 'music',
  },
  {
    title: 'Work',
    icon: <LucideGithub size={ICON_SIZE} />,
    key: 'work',
  }
]

export function NavBar(
  {
    currentPage,
    setCurrentPage,
    goToNext,
    goToPrev,
  }: {
    currentPage: number
    setCurrentPage?: (page: number, jump?: boolean) => void
    goToNext?: (jump?: boolean) => void
    goToPrev?: (jump?: boolean) => void
  }

) {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToPrev?.(true),
    onSwipedRight: () => goToNext?.(true),
  });

  const { notifications } = useGithubContext()

  return (
    <div className="absolute bottom-0 flex items-center justify-between w-full bg-background/20 text-white py-2 px-3" {...swipeHandlers}>
      <div className="flex items-center gap-2">
        {NAV_BAR_ITEMS.map((item, index) => {
          const { title, icon, key } = item
          const isActive = currentPage === index
          return (
            <button key={title} onClick={() => setCurrentPage?.(index, true)} className={
              cn(
                'relative bg-background/20 border rounded-md p-2',
                {
                  'bg-accent-foreground/10': isActive,
                }
              )
            }>
              {icon}
              {notifications.length > 0 && key === 'work' && (
                <div className="absolute top-[-2px] right-[-2px] bg-accent-foreground text-background rounded-full aspect-square w-2 opacity-50" />
              )}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <Clock />
      </div>
    </div>
  )
}

function Clock() {
  const [date, setDate] = React.useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="text-end" suppressHydrationWarning>
      {date.toLocaleTimeString(
        'en-US',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        }
      )}
    </div>
  )
}
