import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Applications from '@/pages/Applications';
import Bidding from '@/pages/Bidding';
import Projects from '@/pages/Projects';
import Tasks from '@/pages/Tasks';
import Materials from '@/pages/Materials';
import PurchaseOrders from '@/pages/PurchaseOrders';
import Finance from '@/pages/Finance';
import Changes from '@/pages/Changes';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/applications"
          element={
            <Layout>
              <Applications />
            </Layout>
          }
        />
        <Route
          path="/bidding"
          element={
            <Layout>
              <Bidding />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <Projects />
            </Layout>
          }
        />
        <Route
          path="/tasks"
          element={
            <Layout>
              <Tasks />
            </Layout>
          }
        />
        <Route
          path="/materials"
          element={
            <Layout>
              <Materials />
            </Layout>
          }
        />
        <Route
          path="/materials/purchase"
          element={
            <Layout>
              <PurchaseOrders />
            </Layout>
          }
        />
        <Route
          path="/finance"
          element={
            <Layout>
              <Finance />
            </Layout>
          }
        />
        <Route
          path="/changes"
          element={
            <Layout>
              <Changes />
            </Layout>
          }
        />
        <Route
          path="/users"
          element={
            <Layout>
              <Users />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
