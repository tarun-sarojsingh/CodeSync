import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      await login(username);
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="p-8 bg-surface rounded-xl border border-border shadow-2xl w-96">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Join CodeSync</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-secondary mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-primary focus:outline-none focus:border-brand"
              placeholder="Enter a username..."
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-brand text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
