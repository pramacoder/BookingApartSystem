import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllGalleryPhotos,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
} from '../../lib/database';
import type { Announcement, GalleryPhoto, AnnouncementCategory, AnnouncementStatus } from '../../lib/types/database';
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Calendar,
  Bell,
} from 'lucide-react';

type TabType = 'announcements' | 'gallery';

export function AdminContentPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('announcements');

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    category: 'general' as AnnouncementCategory,
    publish_date: new Date().toISOString().split('T')[0],
    is_important: false,
    status: 'published' as AnnouncementStatus,
  });
  const [announcementsSubmitting, setAnnouncementsSubmitting] = useState(false);

  // Gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [galleryFormData, setGalleryFormData] = useState({
    photo_url: '',
    caption: '',
    category: '',
    is_featured: false,
    tags: [] as string[],
  });
  const [gallerySubmitting, setGallerySubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'announcements') {
      loadAnnouncements();
    } else {
      loadGalleryPhotos();
    }
  }, [activeTab]);

  const loadAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const { data, error: fetchError } = await getAllAnnouncements();

      if (fetchError) throw fetchError;
      setAnnouncements(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading announcements:', err);
      setError('Gagal memuat announcements.');
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadGalleryPhotos = async () => {
    try {
      setGalleryLoading(true);
      const { data, error: fetchError } = await getAllGalleryPhotos();

      if (fetchError) throw fetchError;
      setGalleryPhotos(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading gallery photos:', err);
      setError('Gagal memuat gallery photos.');
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setAnnouncementsSubmitting(true);
      setError(null);

      const { data, error: createError } = await createAnnouncement({
        ...announcementFormData,
        created_by: user.id,
        target_audience: {},
      });

      if (createError) throw createError;

      setShowAnnouncementModal(false);
      resetAnnouncementForm();
      setSuccess('Announcement berhasil dibuat!');
      setTimeout(() => setSuccess(null), 3000);
      await loadAnnouncements();
    } catch (err: any) {
      console.error('Error creating announcement:', err);
      setError('Gagal membuat announcement. Silakan coba lagi.');
    } finally {
      setAnnouncementsSubmitting(false);
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;

    try {
      setAnnouncementsSubmitting(true);
      setError(null);

      const { error: updateError } = await updateAnnouncement(editingAnnouncement.id, announcementFormData);

      if (updateError) throw updateError;

      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      resetAnnouncementForm();
      setSuccess('Announcement berhasil diupdate!');
      setTimeout(() => setSuccess(null), 3000);
      await loadAnnouncements();
    } catch (err: any) {
      console.error('Error updating announcement:', err);
      setError('Gagal update announcement. Silakan coba lagi.');
    } finally {
      setAnnouncementsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus announcement ini?')) return;

    try {
      const { error: deleteError } = await deleteAnnouncement(id);
      if (deleteError) throw deleteError;

      setSuccess('Announcement berhasil dihapus!');
      setTimeout(() => setSuccess(null), 3000);
      await loadAnnouncements();
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      setError('Gagal menghapus announcement. Silakan coba lagi.');
    }
  };

  const handleCreateGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setGallerySubmitting(true);
      setError(null);

      const { data, error: createError } = await createGalleryPhoto({
        ...galleryFormData,
        uploaded_by: user.id,
        tags: galleryFormData.tags,
      });

      if (createError) throw createError;

      setShowGalleryModal(false);
      resetGalleryForm();
      setSuccess('Photo berhasil ditambahkan!');
      setTimeout(() => setSuccess(null), 3000);
      await loadGalleryPhotos();
    } catch (err: any) {
      console.error('Error creating gallery photo:', err);
      setError('Gagal menambahkan photo. Silakan coba lagi.');
    } finally {
      setGallerySubmitting(false);
    }
  };

  const handleUpdateGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    try {
      setGallerySubmitting(true);
      setError(null);

      const { error: updateError } = await updateGalleryPhoto(editingPhoto.id, galleryFormData);

      if (updateError) throw updateError;

      setShowGalleryModal(false);
      setEditingPhoto(null);
      resetGalleryForm();
      setSuccess('Photo berhasil diupdate!');
      setTimeout(() => setSuccess(null), 3000);
      await loadGalleryPhotos();
    } catch (err: any) {
      console.error('Error updating gallery photo:', err);
      setError('Gagal update photo. Silakan coba lagi.');
    } finally {
      setGallerySubmitting(false);
    }
  };

  const handleDeleteGalleryPhoto = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus photo ini?')) return;

    try {
      const { error: deleteError } = await deleteGalleryPhoto(id);
      if (deleteError) throw deleteError;

      setSuccess('Photo berhasil dihapus!');
      setTimeout(() => setSuccess(null), 3000);
      await loadGalleryPhotos();
    } catch (err: any) {
      console.error('Error deleting gallery photo:', err);
      setError('Gagal menghapus photo. Silakan coba lagi.');
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementFormData({
      title: '',
      content: '',
      category: 'general',
      publish_date: new Date().toISOString().split('T')[0],
      is_important: false,
      status: 'published',
    });
  };

  const resetGalleryForm = () => {
    setGalleryFormData({
      photo_url: '',
      caption: '',
      category: '',
      is_featured: false,
      tags: [],
    });
  };

  const openEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      publish_date: announcement.publish_date.split('T')[0],
      is_important: announcement.is_important,
      status: announcement.status,
    });
    setShowAnnouncementModal(true);
  };

  const openEditGalleryPhoto = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setGalleryFormData({
      photo_url: photo.photo_url,
      caption: photo.caption || '',
      category: photo.category || '',
      is_featured: photo.is_featured,
      tags: photo.tags || [],
    });
    setShowGalleryModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary mb-2">Content Management</h1>
          <p className="text-text-secondary">Manage announcements and gallery photos</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="card p-4 bg-green-50 border border-green-200 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="card p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              Announcements
            </div>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Gallery
            </div>
          </button>
        </div>
      </div>

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-primary text-xl font-semibold">Announcements</h2>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                resetAnnouncementForm();
                setShowAnnouncementModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>

          {announcementsLoading ? (
            <div className="card p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="card p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-primary mb-2">No Announcements</h3>
              <p className="text-text-secondary mb-4">Create your first announcement</p>
              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  resetAnnouncementForm();
                  setShowAnnouncementModal(true);
                }}
                className="btn-primary"
              >
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-primary font-semibold">{announcement.title}</h3>
                        {announcement.is_important && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Important
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                          {announcement.category}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                          {announcement.status}
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
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditAnnouncement(announcement)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-primary text-xl font-semibold">Gallery Photos</h2>
            <button
              onClick={() => {
                setEditingPhoto(null);
                resetGalleryForm();
                setShowGalleryModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Photo
            </button>
          </div>

          {galleryLoading ? (
            <div className="card p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading gallery photos...</p>
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="card p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-primary mb-2">No Photos</h3>
              <p className="text-text-secondary mb-4">Add your first photo to the gallery</p>
              <button
                onClick={() => {
                  setEditingPhoto(null);
                  resetGalleryForm();
                  setShowGalleryModal(true);
                }}
                className="btn-primary"
              >
                Add Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="card p-0 overflow-hidden">
                  <div className="relative aspect-square bg-gray-200">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Gallery photo'}
                      className="w-full h-full object-cover"
                    />
                    {photo.is_featured && (
                      <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditGalleryPhoto(photo)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryPhoto(photo.id)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  {photo.caption && (
                    <div className="p-4">
                      <p className="text-primary text-sm font-medium">{photo.caption}</p>
                      {photo.category && (
                        <p className="text-text-secondary text-xs mt-1">{photo.category}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setEditingAnnouncement(null);
                  resetAnnouncementForm();
                }}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Title *</label>
                <input
                  type="text"
                  value={announcementFormData.title}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">Content *</label>
                <textarea
                  value={announcementFormData.content}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                  className="input-field resize-none"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Category *</label>
                  <select
                    value={announcementFormData.category}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, category: e.target.value as AnnouncementCategory })}
                    className="input-field"
                    required
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="event">Event</option>
                    <option value="payment">Payment</option>
                    <option value="important">Important</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Status *</label>
                  <select
                    value={announcementFormData.status}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, status: e.target.value as AnnouncementStatus })}
                    className="input-field"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Publish Date *</label>
                  <input
                    type="date"
                    value={announcementFormData.publish_date}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, publish_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementFormData.is_important}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, is_important: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-primary">Mark as Important</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={announcementsSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {announcementsSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Saving...
                    </>
                  ) : editingAnnouncement ? (
                    'Update Announcement'
                  ) : (
                    'Create Announcement'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setEditingAnnouncement(null);
                    resetAnnouncementForm();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">
                {editingPhoto ? 'Edit Photo' : 'Add Photo'}
              </h2>
              <button
                onClick={() => {
                  setShowGalleryModal(false);
                  setEditingPhoto(null);
                  resetGalleryForm();
                }}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingPhoto ? handleUpdateGalleryPhoto : handleCreateGalleryPhoto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Photo URL *</label>
                <input
                  type="url"
                  value={galleryFormData.photo_url}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, photo_url: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/photo.jpg"
                  required
                />
                <p className="text-xs text-text-secondary mt-1">Note: File upload will be implemented later</p>
              </div>

              {galleryFormData.photo_url && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={galleryFormData.photo_url}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary mb-2">Caption</label>
                <input
                  type="text"
                  value={galleryFormData.caption}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, caption: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">Category</label>
                <input
                  type="text"
                  value={galleryFormData.category}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, category: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Building, Facilities, Events"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={galleryFormData.is_featured}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_featured" className="text-sm text-primary cursor-pointer">
                  Mark as Featured
                </label>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={gallerySubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {gallerySubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Saving...
                    </>
                  ) : editingPhoto ? (
                    'Update Photo'
                  ) : (
                    'Add Photo'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGalleryModal(false);
                    setEditingPhoto(null);
                    resetGalleryForm();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




