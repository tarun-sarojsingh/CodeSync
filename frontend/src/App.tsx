import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-primary flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
