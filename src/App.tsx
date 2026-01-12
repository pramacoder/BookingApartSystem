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
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { UnitDetailPage } from './pages/UnitDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFound } from './pages/NotFound';

// Payment Status Pages
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { PaymentPending } from './pages/PaymentPending';

// Resident Pages
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { PaymentCenter } from './pages/resident/PaymentCenter';
import { MakePayment } from './pages/resident/MakePayment';
import { MyUnitPage } from './pages/resident/MyUnitPage';
import { BookingsPage } from './pages/resident/BookingsPage';
import { UnitBookingPage } from './pages/resident/UnitBookingPage';
import { ChatPage } from './pages/resident/ChatPage';
import { ComplaintsPage } from './pages/resident/ComplaintsPage';
import { AnnouncementsPage } from './pages/resident/AnnouncementsPage';
import { ProfilePage } from './pages/resident/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUnitsPage } from './pages/admin/AdminUnitsPage';
import { AdminResidentsPage } from './pages/admin/AdminResidentsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminChatPage } from './pages/admin/AdminChatPage';

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
        <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/unit/:id" element={<PublicLayout><UnitDetailPage /></PublicLayout>} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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
              <ResidentLayout><MyUnitPage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/unit-booking" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><UnitBookingPage /></ResidentLayout>
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
          path="/resident/payment/unit-booking/:bookingId" 
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
              <ResidentLayout><BookingsPage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/bookings/new" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><BookingsPage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/announcements" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><AnnouncementsPage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/complaints" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><ComplaintsPage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/complaints/new" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><ComplaintsPage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/chat" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><ChatPage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/profile" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><ProfilePage /></ResidentLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resident/settings" 
          element={
            <ProtectedRoute requiredRole="resident">
              <ResidentLayout><ProfilePage /></ResidentLayout>
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
              <AdminLayout><AdminUnitsPage /></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/units/new" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><AdminUnitsPage /></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/residents" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><AdminResidentsPage /></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/residents/new" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><AdminResidentsPage /></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/payments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><AdminPaymentsPage /></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/payments/generate" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><AdminPaymentsPage /></AdminLayout>
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
              <AdminLayout><AdminContentPage /></AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/chat" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout><AdminChatPage /></AdminLayout>
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