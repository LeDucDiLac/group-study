import { Routes, Route, Navigate } from 'react-router-dom'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// User
import TopicsPage from '@/pages/user/TopicsPage'
import TopicDetailPage from '@/pages/user/TopicDetailPage'
import CreateTopicPage from '@/pages/user/CreateTopicPage'
import TopicPendingPage from '@/pages/user/TopicPendingPage'
import LearnPage from '@/pages/user/LearnPage'
import SubmitSuccessPage from '@/pages/user/SubmitSuccessPage'
import PeerLearningPage from '@/pages/user/PeerLearningPage'
import CommentDetailPage from '@/pages/user/CommentDetailPage'

// Admin
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminPendingPage from '@/pages/admin/AdminPendingPage'
import AdminReviewPage from '@/pages/admin/AdminReviewPage'
import AdminTopicsPage from '@/pages/admin/AdminTopicsPage'

// Layouts
import UserLayout from '@/components/layout/UserLayout'
import AdminLayout from '@/components/layout/AdminLayout'

export default function App() {
  return (
    <Routes>
      {/* Auth — no layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* User routes — with Navbar */}
      <Route element={<UserLayout />}>
        <Route index element={<Navigate to="/topics" replace />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/topics/new" element={<CreateTopicPage />} />
        <Route path="/topics/:id" element={<TopicDetailPage />} />
        <Route path="/topics/:id/pending" element={<TopicPendingPage />} />
        <Route path="/topics/:id/learn" element={<LearnPage />} />
        <Route path="/topics/:id/success" element={<SubmitSuccessPage />} />
        <Route path="/topics/:id/peer" element={<PeerLearningPage />} />
        <Route path="/topics/:id/peer/:sid" element={<CommentDetailPage />} />
      </Route>

      {/* Admin routes — with Sidebar */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="topics/pending" element={<AdminPendingPage />} />
        <Route path="topics/pending/:id" element={<AdminReviewPage />} />
        <Route path="topics" element={<AdminTopicsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/topics" replace />} />
    </Routes>
  )
}
