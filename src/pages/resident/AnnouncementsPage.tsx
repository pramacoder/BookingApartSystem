import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllAnnouncements, markAnnouncementAsRead, getAnnouncementReadStatus } from '../../lib/database';
import type { Announcement, AnnouncementCategory } from '../../lib/types/database';
import { Loader2, Bell, AlertCircle, CheckCircle, Filter, Calendar, X } from 'lucide-react';

export function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<AnnouncementCategory | 'all'>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, [user, filterCategory]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      
      // Only load published announcements
      const { data: announcementsData, error: announcementsError } = await getAllAnnouncements({
        status: 'published',
      });

      if (announcementsError) throw announcementsError;

      setAnnouncements(announcementsData || []);

      // Load read status
      if (user && announcementsData) {
        const announcementIds = announcementsData.map((a) => a.id);
        const { data: readStatusData } = await getAnnouncementReadStatus(user.id, announcementIds);
        setReadStatus(readStatusData || {});
      }

      setError(null);
    } catch (err: any) {
      console.error('Error loading announcements:', err);
      setError('Gagal memuat pengumuman. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    if (!user) return;

    try {
      await markAnnouncementAsRead(announcementId, user.id);
      setReadStatus((prev) => ({ ...prev, [announcementId]: true }));
    } catch (err: any) {
      console.error('Error marking announcement as read:', err);
    }
  };

  const handleOpenDetail = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailModal(true);
    if (!readStatus[announcement.id] && user) {
      handleMarkAsRead(announcement.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filterCategory !== 'all' && announcement.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const categories: (AnnouncementCategory | 'all')[] = [
    'all',
    'general',
    'maintenance',
    'event',
    'payment',
    'important',
    'other',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat pengumuman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-primary mb-2">Announcements</h1>
        <p className="text-text-secondary">Stay updated with the latest announcements from management</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-text-secondary" />
          <span className="text-sm font-medium text-text-secondary">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-primary mb-2">No Announcements</h3>
          <p className="text-text-secondary">There are no announcements at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const isRead = readStatus[announcement.id] || false;
            return (
              <div
                key={announcement.id}
                onClick={() => handleOpenDetail(announcement)}
                className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                  !isRead ? 'border-l-4 border-l-primary' : ''
                } ${announcement.is_important ? 'bg-yellow-50 border-yellow-200' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-primary font-semibold">{announcement.title}</h3>
                      {announcement.is_important && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Important
                        </span>
                      )}
                      {!isRead && (
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                        {announcement.category}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Published: {formatDate(announcement.publish_date)}</span>
                      </div>
                    </div>
                  </div>
                  {!isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-primary text-xl font-semibold">{selectedAnnouncement.title}</h2>
                  {selectedAnnouncement.is_important && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Important
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                    {selectedAnnouncement.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Published: {formatDateTime(selectedAnnouncement.publish_date)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
                  {selectedAnnouncement.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




