import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface BottomStatusBarProps {
  status: 'connected' | 'reconnecting' | 'offline';
  latency?: number;
}

export default function BottomStatusBar({ status, latency }: BottomStatusBarProps) {
  return (
    <div className="h-[32px] bg-surface border-t border-border flex items-center justify-between px-4 text-xs text-secondary shrink-0">
      <div className="flex items-center">
        {status === 'connected' && (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
            <span>Connected</span>
          </>
        )}
        {status === 'reconnecting' && (
          <>
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
            <span>Reconnecting...</span>
          </>
        )}
        {status === 'offline' && (
          <>
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
            <span>Offline</span>
          </>
        )}
      </div>

      <div className="flex items-center">
        {status === 'connected' && latency !== undefined && (
          <span className="flex items-center">
            <span className="font-mono text-[10px] bg-background px-2 py-0.5 rounded border border-border">
              {latency}ms sync
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
