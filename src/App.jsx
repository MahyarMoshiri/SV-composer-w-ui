import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import TopBar from '@/components/TopBar';
import LeftNav from '@/components/LeftNav';
import BiblePage from '@/pages/BiblePage';
import RetrievalPage from '@/pages/RetrievalPage';
import ComposePage from '@/pages/ComposePage';
import GeneratePage from '@/pages/GeneratePage';
import BlendPage from '@/pages/BlendPage';
import EvaluatePage from '@/pages/EvaluatePage';
import ControlPage from '@/pages/ControlPage';
import GoldPage from '@/pages/GoldPage';
import FilmPlanPage from '@/pages/FilmPlanPage';
import BanksPage from '@/pages/BanksPage';
import StatusPage from '@/pages/StatusPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <TopBar />
          <div className="flex">
            <LeftNav />
            <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
              <Routes>
                <Route path="/" element={<Navigate to="/bible" replace />} />
                <Route path="/bible" element={<BiblePage />} />
                <Route path="/retrieval" element={<RetrievalPage />} />
                <Route path="/compose" element={<ComposePage />} />
                <Route path="/generate" element={<GeneratePage />} />
                <Route path="/blend" element={<BlendPage />} />
                <Route path="/evaluate" element={<EvaluatePage />} />
                <Route path="/control" element={<ControlPage />} />
                <Route path="/gold" element={<GoldPage />} />
                <Route path="/filmplan" element={<FilmPlanPage />} />
                <Route path="/banks" element={<BanksPage />} />
                <Route path="/status" element={<StatusPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
