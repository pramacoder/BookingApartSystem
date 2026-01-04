# GreenView Apartment Management System

A comprehensive apartment management website with 3 user roles (Public/Guest, Resident, Admin) integrated with Midtrans payment gateway for rent payments and facility bookings.

## 🎨 Design System

### Color Palette (Modern Earthy Tone)
- **Primary**: #164A41 (Deep Green - headers, CTA)
- **Secondary**: #4D774E (Medium Green - accents)
- **Tertiary**: #9DC88D (Light Green - backgrounds, cards)
- **Accent**: #F1B24A (Warm Orange - buttons, highlights)
- **Neutral Light**: #FFFFFF (White - backgrounds)
- **Text Primary**: #2C3E50 (Dark Gray)
- **Text Secondary**: #7F8C8D (Medium Gray)

### Typography
- **Headings**: Sans-serif bold (Inter)
- **Body**: Sans-serif regular/medium
- **Hierarchy**: H1 (3.5rem), H2 (2.5rem), H3 (1.75rem), Body (1rem)

### Visual Style
- Modern minimalist with natural/organic feel
- Rounded corners (8-16px for cards, 24px for buttons)
- Subtle shadows and depth
- Generous whitespace
- Micro-interactions (hover states, transitions)

## 🚀 Features

### Public Pages (Guest/Visitor)
1. **Landing Page** - Hero section, featured units, amenities preview, testimonials, location
2. **Catalogue** - Unit listing with filters (type, price, status) and grid/list view
3. **Unit Detail** - Gallery, specifications, pricing, floor plan, booking CTA
4. **Facilities** - Facility cards with categories, operational hours, booking info
5. **Gallery** - Image gallery with filters
6. **Contact** - Contact form and information
7. **Login/Register** - Authentication pages

### Resident Portal
1. **Dashboard** - Overview cards, quick stats, upcoming payments, bookings, announcements
2. **My Unit** - Unit information, contract details, parking slot
3. **Payment Center** 
   - Outstanding bills and payment history
   - Make payment with method selection
   - Saved payment methods
4. **Facility Booking** - Browse facilities, create bookings, view booking history
5. **Announcements** - View updates from management
6. **Complaints/Tickets** - Submit and track maintenance requests
7. **Profile & Settings** - Personal information, account settings

### Admin Dashboard
1. **Dashboard** - Key metrics, occupancy rate, revenue, recent activities
2. **Unit Management** - Add, edit, view all units
3. **Resident Management** - Manage residents, contracts, assignments
4. **Payment Management** - Monitor payments, generate invoices, track overdue
5. **Facility Management** - Manage facilities and booking schedules
6. **Complaint Management** - View and respond to tickets
7. **Reports & Analytics** - Financial reports, occupancy reports, usage statistics

### Payment Integration (Midtrans)
- **Payment Flow**: Review → Midtrans Gateway → Status Pages
- **Success Page**: Transaction summary, receipt download, next steps
- **Failed Page**: Error details, retry options, support contact
- **Pending Page**: Processing status, auto-refresh, estimated time

## 📁 Project Structure

```
/
├── App.tsx                          # Main app with routing
├── data/
│   └── mockData.ts                  # Mock data for demo
├── components/
│   ├── Navbar.tsx                   # Public navigation
│   ├── Footer.tsx                   # Footer with links
│   ├── UnitCard.tsx                 # Unit display card
│   ├── FacilityCard.tsx             # Facility display card
│   ├── ResidentSidebar.tsx          # Resident portal sidebar
│   └── AdminSidebar.tsx             # Admin panel sidebar
├── pages/
│   ├── HomePage.tsx                 # Landing page
│   ├── CataloguePage.tsx            # Units listing
│   ├── FacilitiesPage.tsx           # Facilities listing
│   ├── LoginPage.tsx                # Login form
│   ├── NotFound.tsx                 # 404 error page
│   ├── PaymentSuccess.tsx           # Payment success
│   ├── PaymentFailed.tsx            # Payment failed
│   ├── PaymentPending.tsx           # Payment pending
│   ├── resident/
│   │   ├── ResidentDashboard.tsx    # Resident overview
│   │   ├── PaymentCenter.tsx        # Payment management
│   │   └── MakePayment.tsx          # Payment form
│   └── admin/
│       └── AdminDashboard.tsx       # Admin overview
└── styles/
    └── globals.css                  # Global styles & design system
```

## 🎯 Key Pages Implemented

### ✅ Fully Implemented
- **Public**: Home, Catalogue, Facilities, Login
- **Resident**: Dashboard, Payment Center, Make Payment
- **Admin**: Dashboard
- **Payment Status**: Success, Failed, Pending
- **Error**: 404 Not Found

### 📋 Placeholder Pages (Structure Ready)
- Gallery, Contact, Register
- Unit Detail, About Us, Terms & Conditions
- Resident: My Unit, Bookings, Announcements, Complaints, Profile
- Admin: Units, Residents, Payments, Facilities, Reports

## 🧩 Reusable Components

### Cards
- **UnitCard** - Grid and list view variants with all unit details
- **FacilityCard** - With availability status, operational hours, booking CTA

### Navigation
- **Navbar** - Responsive with mobile menu, role-based display
- **ResidentSidebar** - Collapsible sidebar with active states
- **AdminSidebar** - Collapsible sidebar with active states
- **Footer** - Multi-column with quick links and contact info

### Forms & Inputs
- **input-field** - Consistent styled inputs with icons
- **btn-primary** - Primary CTA button with hover effects
- **btn-secondary** - Secondary button variant
- **btn-outline** - Outlined button variant
- **badge** - Status badges (success, warning, error, info)

## 🎨 Design System Classes

### Buttons
- `.btn-primary` - Accent color with white text
- `.btn-secondary` - Primary color with white text
- `.btn-outline` - Bordered button

### Cards
- `.card` - Base card with shadow and rounded corners
- `.card-hover` - Card with hover lift effect

### Badges
- `.badge` - Base badge style
- `.badge-success` - Green badge
- `.badge-warning` - Orange badge
- `.badge-error` - Red badge
- `.badge-info` - Blue badge

### Inputs
- `.input-field` - Styled form input with focus states

### Layout
- `.container-custom` - Max-width container with padding

## 🔐 Authentication Demo

### Login Credentials
- **Admin**: admin@greenview.com (any password)
- **Resident**: any other email (any password)

The app will route to the appropriate dashboard based on the email used.

## 💳 Payment Flow Demo

1. Navigate to Resident Dashboard
2. Click "Pay Now" on pending payment
3. Select payment method
4. Click "Proceed to Payment"
5. App simulates Midtrans redirect
6. Random outcome: Success, Failed, or Pending

## 📱 Responsive Design

- **Desktop**: 1440px (main design)
- **Laptop**: 1024px
- **Tablet**: 768px
- **Mobile**: 375px

All pages are fully responsive with mobile-optimized layouts.

## 🌐 Routes

### Public Routes
- `/` - Home
- `/catalogue` - Units listing
- `/facilities` - Facilities listing
- `/gallery` - Image gallery
- `/contact` - Contact page
- `/unit/:id` - Unit details
- `/login` - Login page
- `/register` - Registration page

### Resident Routes
- `/resident/dashboard` - Dashboard
- `/resident/unit` - My unit
- `/resident/payment` - Payment center
- `/resident/payment/:id` - Make payment
- `/resident/bookings` - Facility bookings
- `/resident/announcements` - Announcements
- `/resident/complaints` - Submit complaints
- `/resident/profile` - Profile settings

### Admin Routes
- `/admin/dashboard` - Dashboard
- `/admin/units` - Unit management
- `/admin/residents` - Resident management
- `/admin/payments` - Payment management
- `/admin/facilities` - Facility management
- `/admin/complaints` - Complaint management
- `/admin/reports` - Reports & analytics

### Payment Status Routes
- `/payment/success` - Payment successful
- `/payment/failed` - Payment failed
- `/payment/pending` - Payment processing

## 🎯 Next Steps for Full Implementation

1. **Complete Placeholder Pages**
   - Gallery with lightbox
   - Contact form with validation
   - Multi-step registration
   - Unit detail with image carousel

2. **Resident Features**
   - My Unit with contract details
   - Facility booking flow
   - Announcement detail view
   - Ticket submission form

3. **Admin Features**
   - CRUD operations for units
   - Resident management interface
   - Invoice generation
   - Facility calendar view
   - Report charts and exports

4. **Backend Integration**
   - Real Midtrans API integration
   - Database connection
   - Authentication system
   - File upload for documents/images

5. **Enhancements**
   - Real-time notifications
   - Email notifications
   - PDF generation for receipts
   - Advanced search and filters
   - Data export functionality

## 🎨 Design Highlights

- **Modern Earthy Color Palette** with natural greens and warm accents
- **Consistent Card Design** with hover effects and shadows
- **Smooth Transitions** and micro-interactions throughout
- **Clear Visual Hierarchy** with proper spacing and typography
- **Accessible Design** with good color contrast and readable fonts
- **Professional Layout** suitable for real estate/property management

## 📊 Mock Data

The app includes comprehensive mock data:
- 4 Sample Units (Studio, 1BR, 2BR)
- 5 Facilities (Gym, Pool, Coworking, Function Hall, BBQ)
- 2 Residents
- 3 Payments (Paid, Pending, Overdue)
- 2 Bookings
- 3 Announcements
- 2 Support Tickets

## 🚀 Getting Started

The app is ready to run! Simply view the website and navigate through:

1. **Public Pages**: Browse home, catalogue, facilities
2. **Login**: Use admin@greenview.com for admin or any email for resident
3. **Resident Portal**: View dashboard, make payments, manage bookings
4. **Admin Panel**: View dashboard and management overview
5. **Payment Flow**: Try the payment simulation with status pages

---

Built with React, TypeScript, Tailwind CSS, and Lucide Icons. Designed for modern apartment management with a focus on user experience and professional aesthetics.
