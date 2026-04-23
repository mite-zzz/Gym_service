import React, { Suspense, lazy } from 'react';

interface Props {
  loader: () => Promise<{ default: React.ComponentType }>;
}

export default function RemoteWrapper({ loader }: Props) {
  const Component = lazy(loader);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-pink-400 animate-pulse text-lg">Loading app...</div>}>
      <Component />
    </Suspense>
  );
}
