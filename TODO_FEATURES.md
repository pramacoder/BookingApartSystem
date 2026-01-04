# 📝 TODO Features - Development Checklist

Checklist detail untuk setiap fitur yang perlu diimplementasikan.

## 🔐 Authentication & Authorization

### Login/Register

- [ ] Integrate LoginPage dengan Supabase Auth
  - [ ] Handle email/password login
  - [ ] Error handling untuk invalid credentials
  - [ ] Loading states
  - [ ] Redirect berdasarkan role (admin/resident)
- [ ] Implement RegisterPage
  - [ ] Multi-step form (personal info, unit selection, verification)
  - [ ] Form validation
  - [ ] Supabase signup integration
  - [ ] Email verification flow
- [ ] Password Reset
  - [ ] Forgot password page
  - [ ] Reset password page
  - [ ] Email reset link
- [ ] Protected Routes
  - [ ] Route guards untuk resident routes
  - [ ] Route guards untuk admin routes
  - [ ] Redirect ke login jika belum authenticated
  - [ ] Redirect berdasarkan role

### Session Management

- [ ] Auto-refresh token
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Handle expired sessions

## 🏠 Public Pages

### Gallery Page

- [ ] Image gallery dengan grid layout
- [ ] Lightbox untuk view image detail
- [ ] Filter by category
- [ ] Lazy loading images
- [ ] Image upload (admin only)

### Contact Page

- [ ] Contact form dengan validation
- [ ] Google Maps integration
- [ ] Contact information display
- [ ] Form submission handling
- [ ] Success/error messages

### Register Page

- [ ] Multi-step registration form
  - [ ] Step 1: Personal Information
  - [ ] Step 2: Account Details
  - [ ] Step 3: Unit Selection
  - [ ] Step 4: Verification
- [ ] Form validation setiap step
- [ ] Progress indicator
- [ ] Supabase integration
- [ ] Email verification

### Unit Detail Page

- [ ] Image carousel/gallery
- [ ] Unit specifications display
- [ ] Floor plan viewer
- [ ] Pricing information
- [ ] Booking CTA button
- [ ] Related units section
- [ ] Share functionality

## 👤 Resident Portal

### My Unit Page

- [ ] Unit information display
  - [ ] Unit details (type, size, floor, etc.)
  - [ ] Contract details (start, end, rent)
  - [ ] Deposit information
- [ ] Contract document viewer
- [ ] Utilities information
- [ ] Parking slot information
- [ ] Edit request functionality

### Facility Bookings

- [ ] BookingsPage - List bookings
  - [ ] Active bookings
  - [ ] Past bookings
  - [ ] Cancelled bookings
  - [ ] Filter by facility, date, status
- [ ] Create Booking
  - [ ] Facility selection
  - [ ] Date & time picker
  - [ ] Duration selection
  - [ ] Guest count
  - [ ] Booking fee calculation
  - [ ] Payment integration
  - [ ] QR code generation
- [ ] Booking Management
  - [ ] View booking details
  - [ ] Cancel booking
  - [ ] Reschedule booking
  - [ ] Download booking receipt

### Announcements

- [ ] AnnouncementsPage - List announcements
  - [ ] All announcements
  - [ ] Filter by category
  - [ ] Search functionality
  - [ ] Mark as read
  - [ ] Important announcements highlight
- [ ] Announcement Detail
  - [ ] Full content view
  - [ ] Read status tracking
  - [ ] Share functionality

### Complaints/Tickets

- [ ] ComplaintsPage - List tickets
  - [ ] All tickets
  - [ ] Filter by status, category, priority
  - [ ] Search functionality
- [ ] Create Ticket
  - [ ] Category selection
  - [ ] Priority selection
  - [ ] Subject & description
  - [ ] File attachments
  - [ ] Submit ticket
- [ ] Ticket Detail
  - [ ] Ticket information
  - [ ] Updates/Conversation thread
  - [ ] Add update/comment
  - [ ] File attachments
  - [ ] Status tracking
  - [ ] Rating system

### Profile & Settings

- [ ] ProfilePage
  - [ ] Personal information display
  - [ ] Edit profile form
  - [ ] Profile picture upload
  - [ ] Change password
  - [ ] Contact information
- [ ] Settings
  - [ ] Notification preferences
  - [ ] Privacy settings
  - [ ] Account settings

## 👨‍💼 Admin Portal

### Unit Management

- [ ] AdminUnitsPage - List units
  - [ ] All units table
  - [ ] Filter by type, status, floor
  - [ ] Search functionality
  - [ ] Pagination
- [ ] Create Unit
  - [ ] Unit information form
  - [ ] Photo upload (multiple)
  - [ ] Floor plan upload
  - [ ] Features selection
  - [ ] Pricing setup
- [ ] Edit Unit
  - [ ] Edit form
  - [ ] Update photos
  - [ ] Status management
- [ ] Delete Unit
  - [ ] Confirmation dialog
  - [ ] Soft delete option

### Resident Management

- [ ] AdminResidentsPage - List residents
  - [ ] All residents table
  - [ ] Filter by status, unit
  - [ ] Search functionality
- [ ] Create Resident
  - [ ] User creation
  - [ ] Unit assignment
  - [ ] Contract setup
  - [ ] Deposit recording
- [ ] Edit Resident
  - [ ] Update information
  - [ ] Contract management
  - [ ] Unit reassignment
- [ ] Resident Detail
  - [ ] Full profile view
  - [ ] Payment history
  - [ ] Booking history
  - [ ] Ticket history

### Payment Management

- [ ] AdminPaymentsPage - List payments
  - [ ] All payments table
  - [ ] Filter by status, type, date
  - [ ] Search functionality
  - [ ] Export functionality
- [ ] Generate Invoice
  - [ ] Select resident
  - [ ] Payment type selection
  - [ ] Amount calculation
  - [ ] Due date setup
  - [ ] Generate invoice
- [ ] Payment Tracking
  - [ ] Overdue payments highlight
  - [ ] Payment status updates
  - [ ] Payment history
  - [ ] Receipt generation

### Facility Management

- [ ] AdminFacilitiesPage - List facilities
  - [ ] All facilities table
  - [ ] Filter by category, status
- [ ] Create Facility
  - [ ] Facility information form
  - [ ] Photo upload
  - [ ] Operational hours setup
  - [ ] Booking rules configuration
  - [ ] Pricing setup
- [ ] Edit Facility
  - [ ] Update information
  - [ ] Status management
- [ ] Booking Calendar
  - [ ] Calendar view
  - [ ] Booking management
  - [ ] Availability checking

### Complaint Management

- [ ] AdminComplaintsPage - List tickets
  - [ ] All tickets table
  - [ ] Filter by status, category, priority
  - [ ] Assign to admin
  - [ ] Search functionality
- [ ] Ticket Detail
  - [ ] Ticket information
  - [ ] Respond to ticket
  - [ ] Update status
  - [ ] Internal notes
  - [ ] Resolution notes
  - [ ] Rating view

### Content Management

- [ ] AdminContentPage
  - [ ] Announcements management
  - [ ] Gallery management
  - [ ] Create/edit/delete content

### Reports & Analytics

- [ ] AdminReportsPage
  - [ ] Financial reports
  - [ ] Occupancy reports
  - [ ] Payment analytics
  - [ ] Facility usage statistics
  - [ ] Export reports (PDF/Excel)

### System Settings

- [ ] AdminSettingsPage
  - [ ] General settings
  - [ ] Payment settings
  - [ ] Email settings
  - [ ] System configuration

## 💳 Payment Integration

### Midtrans Integration

- [ ] Setup Midtrans account
- [ ] Configure payment methods
- [ ] Create payment transaction
- [ ] Handle payment callback
- [ ] Update payment status
- [ ] Payment webhook handler

### Payment Features

- [ ] Payment history
- [ ] Invoice generation (PDF)
- [ ] Receipt download
- [ ] Payment reminders
- [ ] Overdue notifications

## 📁 File Upload

### Image Upload

- [ ] Unit photos upload
- [ ] Facility photos upload
- [ ] Gallery photos upload
- [ ] Profile picture upload
- [ ] Image optimization
- [ ] Image deletion

### Document Upload

- [ ] Ticket attachments
- [ ] Contract documents
- [ ] Payment proofs
- [ ] File validation
- [ ] File size limits

## 🔔 Notifications

### Real-time Notifications

- [ ] Payment notifications
- [ ] Booking confirmations
- [ ] Ticket updates
- [ ] Announcement notifications
- [ ] Notification center
- [ ] Mark as read

### Email Notifications

- [ ] Payment reminders
- [ ] Booking confirmations
- [ ] Ticket responses
- [ ] Announcement emails
- [ ] Welcome emails

## 🎨 UI/UX Enhancements

### Loading States

- [ ] Skeleton loaders
- [ ] Loading spinners
- [ ] Progress indicators

### Error Handling

- [ ] Error messages
- [ ] Error boundaries
- [ ] Retry mechanisms
- [ ] Fallback UI

### Responsive Design

- [ ] Mobile optimization
- [ ] Tablet optimization
- [ ] Desktop optimization
- [ ] Touch interactions

## 🧪 Testing

### Unit Tests

- [ ] Component tests
- [ ] Utility function tests
- [ ] Hook tests

### Integration Tests

- [ ] Authentication flow
- [ ] Payment flow
- [ ] Booking flow

### E2E Tests

- [ ] User journeys
- [ ] Admin workflows

---

**Note:** Checklist ini akan diupdate seiring dengan progress development.
