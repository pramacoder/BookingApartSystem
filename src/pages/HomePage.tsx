import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star, MapPin, Wifi, Dumbbell, Car, Shield, Users } from 'lucide-react';
import { mockUnits, mockFacilities } from '../data/mockData';
import { UnitCard } from '../components/UnitCard';
import { FacilityCard } from '../components/FacilityCard';

export function HomePage() {
  const featuredUnits = mockUnits.filter(u => u.status === 'available').slice(0, 3);
  const topFacilities = mockFacilities.slice(0, 4);

  const amenities = [
    { icon: Wifi, label: 'High-Speed WiFi', description: 'Koneksi internet cepat di seluruh area' },
    { icon: Dumbbell, label: 'Fitness Center', description: 'Gym lengkap dengan trainer profesional' },
    { icon: Car, label: 'Parking Area', description: 'Parkir luas dan aman 24/7' },
    { icon: Shield, label: '24/7 Security', description: 'Keamanan terjamin dengan CCTV' }
  ];

  const whyChooseUs = [
    { title: 'Lokasi Strategis', description: 'Dekat dengan pusat bisnis, mall, dan transportasi umum' },
    { title: 'Fasilitas Lengkap', description: 'Semua yang Anda butuhkan tersedia di dalam kompleks' },
    { title: 'Modern & Nyaman', description: 'Desain kontemporer dengan kenyamanan maksimal' },
    { title: 'Komunitas Aktif', description: 'Lingkungan ramah dengan berbagai kegiatan sosial' }
  ];

  const testimonials = [
    {
      name: 'Rina Wijaya',
      rating: 5,
      comment: 'Sangat puas tinggal di GreenView! Fasilitasnya lengkap dan pengelolaan sangat profesional.',
      avatar: 'https://ui-avatars.com/api/?name=Rina+Wijaya&background=4D774E&color=fff'
    },
    {
      name: 'Ahmad Hidayat',
      rating: 5,
      comment: 'Lokasi strategis, dekat dengan kantor. Keamanan 24 jam membuat saya merasa aman dan nyaman.',
      avatar: 'https://ui-avatars.com/api/?name=Ahmad+Hidayat&background=164A41&color=fff'
    },
    {
      name: 'Maya Putri',
      rating: 5,
      comment: 'Apartemen yang sempurna untuk keluarga muda. Anak-anak suka dengan playground dan pool!',
      avatar: 'https://ui-avatars.com/api/?name=Maya+Putri&background=9DC88D&color=fff'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjU0MzQyNDV8MA&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-primary/70" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-white mb-6">Temukan Hunian Ideal Anda</h1>
          <p className="text-xl text-tertiary mb-8 max-w-2xl mx-auto">
            Modern apartment dengan fasilitas premium di jantung Jakarta Selatan. 
            Hidup nyaman, aman, dan terhubung dengan segala yang Anda butuhkan.
          </p>
          <Link to="/catalogue" className="btn-primary inline-flex items-center gap-2">
            Explore Units
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Featured Units */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="mb-4">Unit Pilihan Kami</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Pilihan unit terbaik yang tersedia untuk Anda. Dari studio hingga 2 bedroom, 
              semua dilengkapi dengan furniture berkualitas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredUnits.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/catalogue" className="btn-outline inline-flex items-center gap-2">
              View All Units
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Preview */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="mb-4">Fasilitas Premium</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Nikmati berbagai fasilitas kelas dunia yang dirancang untuk kenyamanan dan gaya hidup Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="card text-center p-8 hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <amenity.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="mb-2">{amenity.label}</h4>
                <p className="text-text-secondary text-sm">{amenity.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/facilities" className="btn-outline inline-flex items-center gap-2">
              View All Facilities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-white mb-4">Mengapa Memilih GreenView?</h2>
            <p className="text-tertiary max-w-2xl mx-auto">
              Kami berkomitmen memberikan pengalaman tinggal terbaik dengan layanan dan fasilitas unggulan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white mb-2">{item.title}</h4>
                <p className="text-tertiary text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="mb-4">Apa Kata Penghuni Kami</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Testimoni dari penghuni yang puas dengan pelayanan dan fasilitas GreenView Apartment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-text-secondary mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-primary">{testimonial.name}</p>
                    <p className="text-sm text-text-secondary">Resident</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-4">Lokasi Strategis</h2>
              <p className="text-text-secondary mb-6">
                Terletak di jantung Jakarta Selatan dengan akses mudah ke berbagai fasilitas umum, 
                pusat bisnis, dan area komersial.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="mb-1">Alamat Lengkap</h5>
                    <p className="text-text-secondary">Jl. Sudirman No. 123, Jakarta Selatan 12920</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="mb-1">Nearby</h5>
                    <p className="text-text-secondary">
                      5 min to SCBD, 10 min to Senayan City, 15 min to Plaza Indonesia
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="card overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1234567890!2d106.8229!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNDknMjIuNCJF!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent">
        <div className="container-custom text-center">
          <h2 className="text-white mb-4">Siap Untuk Mulai Hidup Lebih Baik?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Jadilah bagian dari komunitas GreenView dan nikmati gaya hidup modern yang nyaman dan terhubung
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogue" className="btn-secondary inline-flex items-center gap-2 justify-center">
              Browse Units
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="bg-white text-accent hover:bg-white/90 rounded-full px-8 py-3 transition-all inline-flex items-center gap-2 justify-center">
              Schedule Viewing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
