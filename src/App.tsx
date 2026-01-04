import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ResidentSidebar } from './components/ResidentSidebar';
import { AdminSidebar } from './components/AdminSidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFound } from './pages/NotFound';

// Payment Status Pages
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { PaymentPending } from './pages/PaymentPending';

// Resident Pages
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { PaymentCenter } from './pages/resident/PaymentCenter';
import { MakePayment } from './pages/resident/MakePayment';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

import { currentUser } from './data/mockData';

// Layout Wrappers
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userRole="guest" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <ResidentSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

// Placeholder Pages
function GalleryPage() {
  return (
    <PublicLayout>
      <div className="container-custom py-20">
        <div className="card p-12 text-center">
          <h2 className="text-primary mb-4">Gallery Page</h2>
          <p className="text-text-secondary">This page will display image gallery with lightbox view.</p>
        </div>
      </div>
    </PublicLayout>
  );
}

function ContactPage() {
  return (
    <PublicLayout>
      <div className="container-custom py-20">
        <div className="card p-12 text-center">
          <h2 className="text-primary mb-4">Contact Page</h2>
          <p className="text-text-secondary">Contact form, map, and contact information will be displayed here.</p>
        </div>
      </div>
    </PublicLayout>
  );
}


function UnitDetailPage() {
  return (
    <PublicLayout>
      <div className="container-custom py-20">
        <div className="card p-12 text-center">
          <h2 className="text-primary mb-4">Unit Detail Page</h2>
          <p className="text-text-secondary">Detailed unit information with image gallery, floor plan, and booking options.</p>
        </div>
      </div>
    </PublicLayout>
  );
}

function MyUnitPage() {
  return (
    <ResidentLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">My Unit Page</h2>
        <p className="text-text-secondary">Unit information, contract details, and utilities for the current resident.</p>
      </div>
    </ResidentLayout>
  );
}

function BookingsPage() {
  return (
    <ResidentLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Facility Bookings Page</h2>
        <p className="text-text-secondary">View and manage facility bookings, create new bookings.</p>
      </div>
    </ResidentLayout>
  );
}

function AnnouncementsPage() {
  return (
    <ResidentLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Announcements Page</h2>
        <p className="text-text-secondary">View all announcements from management with filtering options.</p>
      </div>
    </ResidentLayout>
  );
}

function ComplaintsPage() {
  return (
    <ResidentLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Complaints & Tickets Page</h2>
        <p className="text-text-secondary">Submit and track maintenance requests and complaints.</p>
      </div>
    </ResidentLayout>
  );
}

function ProfilePage() {
  return (
    <ResidentLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Profile Page</h2>
        <p className="text-text-secondary">Edit personal information and account settings.</p>
      </div>
    </ResidentLayout>
  );
}

function AdminUnitsPage() {
  return (
    <AdminLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Unit Management Page</h2>
        <p className="text-text-secondary">Manage all apartment units, add, edit, and view unit details.</p>
      </div>
    </AdminLayout>
  );
}

function AdminResidentsPage() {
  return (
    <AdminLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Residents Management Page</h2>
        <p className="text-text-secondary">Manage resident information, contracts, and assignments.</p>
      </div>
    </AdminLayout>
  );
}

function AdminPaymentsPage() {
  return (
    <AdminLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Payment Management Page</h2>
        <p className="text-text-secondary">Monitor payments, generate invoices, track overdue payments.</p>
      </div>
    </AdminLayout>
  );
}

function AdminFacilitiesPage() {
  return (
    <AdminLayout>
      <div className="card p-12 text-center">
        <h2 className="text-primary mb-4">Facilities Management Page</h2>
        <p className="text-text-secondary">Manage facilities, view bookings, and set maintenance schedules.</p>
      </div>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/catalogue" element={<PublicLayout><CataloguePage /></PublicLayout>} />
        <Route path="/facilities" element={<PublicLayout><FacilitiesPage /></PublicLayout>} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/unit/:id" element={<UnitDetailPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Payment Status Routes (No Layout) */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/payment/pending" element={<PaymentPending />} />

        {/* Resident Routes */}
        <Route 
          path="/resident/dashboard" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><ResidentDashboard /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/unit" 
          element={
            <ProtectedRoute requiredRole="resident">
              <MyUnitPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/payment" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><PaymentCenter /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/payment/:id" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><MakePayment /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/payment/history" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><PaymentCenter /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/bookings" 
          element={
            <ProtectedRoute requiredRole="resident">
              <BookingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/bookings/new" 
          element={
            <ProtectedRoute requiredRole="resident">
              <BookingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/announcements" 
          element={
            <ProtectedRoute requiredRole="resident">
              <AnnouncementsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/complaints" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ComplaintsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/complaints/new" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ComplaintsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/profile" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/settings" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><AdminDashboard /></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/units" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUnitsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/units/new" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUnitsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/residents" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminResidentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/residents/new" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminResidentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/payments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPaymentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/payments/generate" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPaymentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/facilities" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminFacilitiesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/complaints" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><div className="card p-12 text-center"><h2 className="text-primary mb-4">Complaints Management</h2></div></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/content" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><div className="card p-12 text-center"><h2 className="text-primary mb-4">Content Management</h2></div></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><div className="card p-12 text-center"><h2 className="text-primary mb-4">Reports & Analytics</h2></div></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><div className="card p-12 text-center"><h2 className="text-primary mb-4">System Settings</h2></div></AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}