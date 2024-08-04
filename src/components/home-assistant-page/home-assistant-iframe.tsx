'use client';
import React from 'react';
import { useEffect } from 'react';

interface Props {
  view?: string;
  className?: string;
}

export default function HomeAssistantIframe({ view, className }: Props) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const src = `http://10.0.0.172:8123/lovelace/${view ? view : 'default_view'}?kiosk`;
  return <iframe id="home-assistant-iframe" title="Home Assistant" src={src} className={className} ref={iframeRef} />;
}
