'use client';

import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div style={{ height: '600px', width: '100%' }}>Loading map...</div>,
});

export function GeographicMap() {
  return <MapWithNoSSR />;
}

export default GeographicMap;
