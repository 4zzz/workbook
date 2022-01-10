import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import "bootstrap/dist/css/bootstrap.min.css";

import Navigation from './components/Navigation';
import SheetPage from './components/SheetPage';
import HomePage from './components/HomePage';
import RepoPage from './components/RepoPage';
import RepoListPage from './components/RepoListPage';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <div className="m-0 p-2">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/repos" element={<RepoListPage />} />
        <Route path="/repos/:page" element={<RepoListPage />} />
        <Route path="/repo/:repo" element={<RepoPage/>} />
        <Route path="/repo/:repo/tree/:branch" element={<RepoPage />} />
        <Route path="/repo/:repo/tree/:branch/*" element={<RepoPage />} />
        <Route path="/repo/:repo/blob/:branch/*" element={<RepoPage />} />
        <Route path="/sheet" element={<SheetPage/>} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
