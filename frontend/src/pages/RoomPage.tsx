import { useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';
import EditorArea from '../components/EditorArea';
import BottomStatusBar from '../components/BottomStatusBar';
import { useState, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { generateRandomUser } from '../utils/user';
import type { UserInfo } from '../utils/user';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [language, setLanguage] = useState('javascript');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserInfo[]>([]);
  const [wsStatus, setWsStatus] = useState<'connected' | 'reconnecting' | 'offline'>('offline');
  const [isCopied, setIsCopied] = useState(false);
  
  // Ref for Yjs doc and awareness to persist across re-renders
  const yDocRef = useRef<Y.Doc | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  if (!yDocRef.current) {
    yDocRef.current = new Y.Doc();
    awarenessRef.current = new Awareness(yDocRef.current);
    
    // Set local user awareness
    const user = generateRandomUser();
    awarenessRef.current.setLocalStateField('user', user);

    // Offline persistence (keeps Yjs document saved in IndexedDB)
    new IndexeddbPersistence(roomId!, yDocRef.current);

    // Initialize WebsocketProvider
    const wsUrl = 'ws://localhost:8080/ws/room';
    providerRef.current = new WebsocketProvider(wsUrl, roomId!, yDocRef.current, {
      awareness: awarenessRef.current,
      connect: false // we will connect in useEffect
    });
  }

  useEffect(() => {
    const awareness = awarenessRef.current!;
    const provider = providerRef.current!;
    
    provider.connect();

    const updateActiveUsers = () => {
      const states = Array.from(awareness.getStates().values());
      const users = states.map((state) => state.user).filter(Boolean) as UserInfo[];
      setActiveUsers(users);
    };
    
    const handleStatus = (event: { status: string }) => {
      if (event.status === 'connected') {
        setWsStatus('connected');
      } else if (event.status === 'disconnected') {
        // y-websocket tries to reconnect automatically
        setWsStatus('reconnecting');
      }
    };
    
    updateActiveUsers();
    
    awareness.on('change', updateActiveUsers);
    provider.on('status', handleStatus);
    
    return () => {
      awareness.off('change', updateActiveUsers);
      provider.off('status', handleStatus);
      provider.disconnect();
    };
  }, [roomId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNav 
        roomId={roomId || ''} 
        language={language}
        setLanguage={setLanguage}
        onShareClick={() => setIsShareModalOpen(true)}
        activeUsers={activeUsers}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <EditorArea 
          language={language} 
          yDoc={yDocRef.current!} 
          awareness={awarenessRef.current!} 
        />
        
        {/* Share Modal - Framer Motion slide down implementation */}
        <AnimatePresence>
          {isShareModalOpen && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 right-4 mt-2 p-4 bg-surface border border-border rounded-lg shadow-xl z-50"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Share Room</h3>
                <button onClick={() => setIsShareModalOpen(false)} className="text-secondary hover:text-primary">&times;</button>
              </div>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={window.location.href} 
                  className="px-2 py-1 bg-background border border-border rounded text-sm w-64 text-primary focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className={`px-3 py-1 text-white text-sm rounded transition-colors w-20 ${isCopied ? 'bg-green-500' : 'bg-brand hover:bg-opacity-90'}`}
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomStatusBar status={wsStatus} latency={42} />
    </div>
  );
}
