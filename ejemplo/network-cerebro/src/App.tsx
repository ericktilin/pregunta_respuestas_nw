import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import ThreadView from './pages/ThreadView'
import KnowledgeBase from './pages/KnowledgeBase'
import ReusableModules from './pages/ReusableModules'
import SearchResults from './pages/SearchResults'
import MyQuestions from './pages/MyQuestions'
import Categories from './pages/Categories'
import NewQuestion from './pages/NewQuestion'
import NewModule from './pages/NewModule'
import Profile from './pages/Profile'
import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/thread/:id" element={<ThreadView />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/my-questions" element={<MyQuestions />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/reusable-modules" element={<ReusableModules />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/new-question" element={<NewQuestion />} />
            <Route path="/new-module" element={<NewModule />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App