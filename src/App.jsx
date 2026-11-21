import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoadingScreen from './components/LoadingScreen'

// Lazy load pages to improve initial load time
const StudentView = lazy(() => import('./pages/StudentView'))

// Only import EditorView if not in student mode
// This allows tree-shaking to remove the editor chunk entirely in student build
const showEditor = import.meta.env.VITE_APP_MODE !== 'student';
const EditorView = showEditor ? lazy(() => import('./pages/EditorView')) : null;

function App() {
  const basename = import.meta.env.VITE_BASE_URL || '/';
  const showEditor = import.meta.env.VITE_APP_MODE !== 'student';

  return (
    <Router basename={basename}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<StudentView />} />
          {showEditor && EditorView && <Route path="/editor" element={<EditorView />} />}
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App