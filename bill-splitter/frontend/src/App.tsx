import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GroupDashboard from './pages/GroupDashboard';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/group/:id" element={<GroupDashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
