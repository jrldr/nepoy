import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50 flex items-center justify-between gap-3 rounded-xl bg-amber-600/95 text-white px-4 py-2.5 shadow-xl backdrop-blur-md text-xs font-medium border border-amber-400/30">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
        <span>Offline Mode — All calculations & offline maps working</span>
      </div>
      <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono">PWA</span>
    </div>
  );
};
