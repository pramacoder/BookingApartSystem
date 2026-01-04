// Mock data for the apartment management system

export interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  floor: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  yearlyRent: number;
  deposit: number;
  status: 'available' | 'occupied' | 'maintenance';
  images: string[];
  features: string[];
  description: string;
  orientation: string;
}

export interface Facility {
  id: string;
  name: string;
  category: 'Sports' | 'Leisure' | 'Services' | 'Commons';
  description: string;
  image: string;
  operationalHours: string;
  capacity: number;
  bookingFee: number;
  status: 'available' | 'maintenance' | 'booked';
}

export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitNumber: string;
  contractStart: string;
  contractEnd: string;
  status: 'active' | 'expired';
  avatar: string;
}

export interface Payment {
  id: string;
  invoiceNumber: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  amount: number;
  description: string;
  dueDate: string;
  paymentDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  residentId: string;
  residentName: string;
  date: string;
  timeSlot: string;
  duration: number;
  guests: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  bookingFee: number;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Important' | 'Maintenance' | 'Events' | 'General';
  excerpt: string;
  content: string;
  date: string;
  isRead: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  category: 'Maintenance' | 'Facility' | 'Payment' | 'Security' | 'Others';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdDate: string;
  lastUpdate: string;
  attachments?: string[];
}

// Mock Units Data
export const mockUnits: Unit[] = [
  {
    id: '1',
    unitNumber: 'A-1205',
    type: 'Studio',
    floor: 12,
    size: 35,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 4500000,
    yearlyRent: 50000000,
    deposit: 9000000,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1662454419736-de132ff75638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBiZWRyb29tJTIwbW9kZXJufGVufDF8fHx8MTc2NTQzNTQ0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjUzODI3NjN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    features: ['Fully Furnished', 'AC', 'Water Heater', 'Kitchen Set', 'Balcony'],
    description: 'Studio modern dengan desain minimalis, cocok untuk profesional muda. Dilengkapi dengan furniture berkualitas dan pemandangan kota.',
    orientation: 'Timur'
  },
  {
    id: '2',
    unitNumber: 'B-0807',
    type: '1 Bedroom',
    floor: 8,
    size: 45,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 6000000,
    yearlyRent: 68000000,
    deposit: 12000000,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjUzODI3NjN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    features: ['Fully Furnished', 'AC', 'Water Heater', 'Kitchen Set', 'Balcony', 'Washing Machine'],
    description: 'Apartemen 1 kamar tidur yang nyaman dengan ruang tamu luas. Ideal untuk pasangan atau small family.',
    orientation: 'Barat'
  },
  {
    id: '3',
    unitNumber: 'C-1501',
    type: '2 Bedroom',
    floor: 15,
    size: 65,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 8500000,
    yearlyRent: 95000000,
    deposit: 17000000,
    status: 'occupied',
    images: [
      'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjUzODI3NjN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    features: ['Fully Furnished', 'AC', 'Water Heater', 'Kitchen Set', 'Balcony', 'Washing Machine', 'Smart Home'],
    description: 'Unit premium 2 kamar tidur dengan pemandangan city view. Dilengkapi smart home system.',
    orientation: 'Utara'
  },
  {
    id: '4',
    unitNumber: 'A-0603',
    type: 'Studio',
    floor: 6,
    size: 32,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 4200000,
    yearlyRent: 47000000,
    deposit: 8400000,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1662454419736-de132ff75638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBiZWRyb29tJTIwbW9kZXJufGVufDF8fHx8MTc2NTQzNTQ0M3ww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    features: ['Fully Furnished', 'AC', 'Water Heater', 'Kitchen Set'],
    description: 'Studio compact dengan tata letak efisien. Strategis dan terjangkau.',
    orientation: 'Selatan'
  }
];

// Mock Facilities Data
export const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Fitness Center',
    category: 'Sports',
    description: 'Gym lengkap dengan peralatan modern, personal trainer tersedia',
    image: 'https://images.unsplash.com/photo-1757924284732-4189190321cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBneW0lMjBmaXRuZXNzfGVufDF8fHx8MTc2NTQ3MDM2MHww&ixlib=rb-4.1.0&q=80&w=1080',
    operationalHours: '06:00 - 22:00',
    capacity: 20,
    bookingFee: 0,
    status: 'available'
  },
  {
    id: '2',
    name: 'Swimming Pool',
    category: 'Sports',
    description: 'Kolam renang olympic size dengan area khusus anak-anak',
    image: 'https://images.unsplash.com/photo-1661333587575-25c87c14f398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBsdXh1cnl8ZW58MXx8fHwxNzY1NDcwMzYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    operationalHours: '06:00 - 20:00',
    capacity: 30,
    bookingFee: 0,
    status: 'available'
  },
  {
    id: '3',
    name: 'Co-working Space',
    category: 'Commons',
    description: 'Ruang kerja bersama dengan WiFi berkecepatan tinggi',
    image: 'https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBzcGFjZSUyMG1vZGVybnxlbnwxfHx8fDE3NjU0MjM1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    operationalHours: '24/7',
    capacity: 15,
    bookingFee: 50000,
    status: 'available'
  },
  {
    id: '4',
    name: 'Function Hall',
    category: 'Commons',
    description: 'Ruang serbaguna untuk acara, meeting, atau gathering',
    image: 'https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBzcGFjZSUyMG1vZGVybnxlbnwxfHx8fDE3NjU0MjM1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    operationalHours: '08:00 - 22:00',
    capacity: 50,
    bookingFee: 500000,
    status: 'available'
  },
  {
    id: '5',
    name: 'BBQ Area',
    category: 'Leisure',
    description: 'Area BBQ outdoor dengan pemandangan indah',
    image: 'https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBzcGFjZSUyMG1vZGVybnxlbnwxfHx8fDE3NjU0MjM1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    operationalHours: '10:00 - 22:00',
    capacity: 20,
    bookingFee: 250000,
    status: 'available'
  }
];

// Mock Residents Data
export const mockResidents: Resident[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    phone: '081234567890',
    unitNumber: 'C-1501',
    contractStart: '01/01/2024',
    contractEnd: '31/12/2024',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=164A41&color=fff'
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@email.com',
    phone: '081234567891',
    unitNumber: 'B-0807',
    contractStart: '15/03/2024',
    contractEnd: '14/03/2025',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Siti+Nurhaliza&background=4D774E&color=fff'
  }
];

// Mock Payments Data
export const mockPayments: Payment[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-12-001',
    residentId: '1',
    residentName: 'Budi Santoso',
    unitNumber: 'C-1501',
    amount: 8500000,
    description: 'Sewa Bulan Desember 2024',
    dueDate: '05/12/2024',
    status: 'paid',
    paymentDate: '03/12/2024',
    paymentMethod: 'Credit Card'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-01-001',
    residentId: '1',
    residentName: 'Budi Santoso',
    unitNumber: 'C-1501',
    amount: 8500000,
    description: 'Sewa Bulan Januari 2025',
    dueDate: '05/01/2025',
    status: 'pending'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-12-002',
    residentId: '2',
    residentName: 'Siti Nurhaliza',
    unitNumber: 'B-0807',
    amount: 6000000,
    description: 'Sewa Bulan Desember 2024',
    dueDate: '10/12/2024',
    status: 'overdue'
  }
];

// Mock Bookings Data
export const mockBookings: Booking[] = [
  {
    id: '1',
    facilityId: '3',
    facilityName: 'Co-working Space',
    residentId: '1',
    residentName: 'Budi Santoso',
    date: '15/12/2024',
    timeSlot: '09:00 - 12:00',
    duration: 3,
    guests: 5,
    status: 'upcoming',
    bookingFee: 50000
  },
  {
    id: '2',
    facilityId: '4',
    facilityName: 'Function Hall',
    residentId: '1',
    residentName: 'Budi Santoso',
    date: '20/12/2024',
    timeSlot: '18:00 - 22:00',
    duration: 4,
    guests: 30,
    status: 'upcoming',
    bookingFee: 500000
  }
];

// Mock Announcements Data
export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Pemeliharaan Lift Tower A',
    category: 'Maintenance',
    excerpt: 'Lift Tower A akan menjalani maintenance rutin pada tanggal 15 Desember 2024.',
    content: 'Kepada seluruh penghuni Tower A, kami informasikan bahwa lift akan menjalani pemeliharaan rutin pada tanggal 15 Desember 2024 pukul 08:00 - 17:00. Mohon gunakan lift cadangan atau tangga. Terima kasih atas pengertiannya.',
    date: '10/12/2024',
    isRead: false
  },
  {
    id: '2',
    title: 'Perayaan Tahun Baru 2025',
    category: 'Events',
    excerpt: 'Join us untuk perayaan tahun baru di Function Hall!',
    content: 'Kami mengundang seluruh penghuni untuk merayakan tahun baru bersama di Function Hall. Acara dimulai pukul 20:00. Akan ada live music, dinner, dan fireworks! RSVP sebelum 20 Desember.',
    date: '08/12/2024',
    isRead: true
  },
  {
    id: '3',
    title: 'Perubahan Jadwal Kolam Renang',
    category: 'Important',
    excerpt: 'Jadwal operasional kolam renang berubah mulai 1 Januari 2025.',
    content: 'Mulai 1 Januari 2025, kolam renang akan beroperasi dari pukul 06:00 - 21:00 (sebelumnya 06:00 - 20:00). Perubahan ini untuk memberikan waktu lebih kepada penghuni.',
    date: '07/12/2024',
    isRead: false
  }
];

// Mock Tickets Data
export const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-12-001',
    residentId: '1',
    residentName: 'Budi Santoso',
    unitNumber: 'C-1501',
    category: 'Maintenance',
    priority: 'High',
    subject: 'AC Tidak Dingin',
    description: 'AC di kamar tidur tidak dingin sejak 3 hari yang lalu. Sudah dibersihkan filter tapi tetap tidak dingin.',
    status: 'In Progress',
    createdDate: '08/12/2024',
    lastUpdate: '09/12/2024'
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-12-002',
    residentId: '2',
    residentName: 'Siti Nurhaliza',
    unitNumber: 'B-0807',
    category: 'Facility',
    priority: 'Medium',
    subject: 'Kartu Akses Tidak Berfungsi',
    description: 'Kartu akses untuk gym tidak bisa tap. Mohon dibantu untuk penggantian.',
    status: 'Open',
    createdDate: '10/12/2024',
    lastUpdate: '10/12/2024'
  }
];

// Current User Context (for demo)
export const currentUser = {
  id: '1',
  name: 'Budi Santoso',
  email: 'budi.santoso@email.com',
  role: 'resident', // 'guest' | 'resident' | 'admin'
  unitNumber: 'C-1501',
  avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=164A41&color=fff'
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Format date
export const formatDate = (dateString: string): string => {
  return dateString;
};
