import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Comments from './pages/CommentsPage'; // Assuming you have a Comments page

import './styles/App.module.css'; // Global styles
import './styles/Header.module.css'; // Header styles
import './styles/Home.module.css'; // Home page styles

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/comments" element={<Comments />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
