import React from 'react';
import Image from 'next/image';

type BackgroundContextType = {
  backgroundUrl?: string;
  setBackgroundUrl: (url?: string) => void;
};

const BackgroundContext = React.createContext<BackgroundContextType | null>(null);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgroundUrl, setBackgroundUrl] = React.useState<string | undefined>(undefined);

  return (
    <BackgroundContext.Provider
      value={{
        backgroundUrl,
        setBackgroundUrl,
      }}
    >
      {backgroundUrl && (
        <div className="absolute top-0 h-full w-full overflow-hidden">
          <Image
            src={backgroundUrl}
            alt={'background-image'}
            width={640}
            height={640}
            className="h-full w-full scale-125 object-cover blur-lg brightness-50"
          />
        </div>
      )}
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackgroundContext() {
  const context = React.useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackgroundContext must be used within a BackgroundProvider');
  }
  return context;
}
