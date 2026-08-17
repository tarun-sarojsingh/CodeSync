import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Code2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');

  const handleCreateRoom = () => {
    const newRoomId = uuidv4();
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim()) {
      navigate(`/room/${joinId.trim()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center text-brand"
        >
          <Code2 size={64} className="animate-pulse" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold tracking-tight text-white"
        >
          Code together, instantly.
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-secondary"
        >
          No accounts. No setup. Just code.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 space-y-4"
        >
          <motion.button
            whileHover={{ y: -2, backgroundColor: 'rgba(137, 87, 229, 0.9)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateRoom}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-brand shadow-lg"
          >
            Create New Room
          </motion.button>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-secondary text-sm">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleJoinRoom} className="flex space-x-3">
            <input
              type="text"
              required
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="flex-1 min-w-0 block w-full px-4 rounded-md bg-surface border border-border text-primary placeholder-secondary focus:ring-brand focus:border-brand focus:outline-none transition-shadow"
              placeholder="Enter Room ID"
            />
            <motion.button
              whileHover={{ y: -1, backgroundColor: '#1f2937' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-white bg-surface"
            >
              Join <ArrowRight size={16} className="ml-2" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
