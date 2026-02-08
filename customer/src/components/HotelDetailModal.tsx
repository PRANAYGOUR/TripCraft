import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Star, DollarSign, Coffee } from 'lucide-react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface HotelDetailModalProps {
  hotel: {
    id: string;
    name: string;
    location: string;
    city: string;
    star_rating?: number;
    rating?: number;
    images?: string[];
    description?: string;
    price_per_night?: number;
    amenities?: string[];
    meal_options?: string[];
    room_types?: any;
    total_rooms?: number;
  };
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isCustomerView?: boolean;
  isLoading?: boolean;
}

const HotelDetailModal: React.FC<HotelDetailModalProps> = ({
  hotel,
  onClose,
  onApprove,
  onReject,
  isCustomerView = false,
  isLoading = false,
}) => {
  console.log('🎬 HotelDetailModal RENDERING with hotel:', hotel.name);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>(
    hotel.images && Array.isArray(hotel.images)
      ? hotel.images
      : hotel.image_url
      ? [hotel.image_url]
      : []
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rejectNote, setRejectNote] = useState('');
  const [isRejectingWithNote, setIsRejectingWithNote] = useState(false);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const initialImages = hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0
      ? hotel.images
      : hotel.image_url
      ? [hotel.image_url]
      : [];
    
    console.log('🏨 HotelDetailModal opened for:', hotel.name);
    console.log('📸 Images received:', initialImages);
    console.log('🔗 image_url:', hotel.image_url);
    console.log('📷 images array:', hotel.images);
    console.log('🎯 Full hotel object:', hotel);
    
    setImages(initialImages);

    const fetchHotel = async () => {
      if ((hotel.images && hotel.images.length > 0) || images.length > 0) return;
      if (!hotel.id) return;
      try {
        const mod = await import('../services/supabaseClient');
        const supabase = mod.supabase;
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', hotel.id)
          .single();
        if (error) {
          console.error('Supabase fetch hotel error', error);
          return;
        }
        if (data) {
          const fetchedImages: string[] = Array.isArray(data.images) ? data.images : data.image_url ? [data.image_url] : [];
          setImages(fetchedImages);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchHotel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel.id]);
  const rating = hotel.star_rating || hotel.rating || 4;
  const price = hotel.price_per_night || 150;
  const amenities = hotel.amenities || [];
  const mealOptions = hotel.meal_options || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  console.log('✅ About to render HotelDetailModal JSX for:', hotel.name);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          maxWidth: '768px',
          width: '95%',
          minHeight: '300px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* TEST: Visible indicator that modal is rendering */}
        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
          ✅ MODAL IS OPEN - {hotel.name}
        </div>

        {/* Close Button */}
        <div className="sticky top-0 flex justify-end p-4 bg-white border-b">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image Gallery */}
        <div className="relative bg-gray-100 h-[70vh]">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-zoom-in"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://via.placeholder.com/800x400?text=Hotel+Image';
                }}
                onClick={() => {
                  setLightboxIndex(currentImageIndex);
                  setZoom(1);
                  setIsLightboxOpen(true);
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-200 transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-200 transition"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

        {isLightboxOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-60 flex items-center justify-center p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white"
              aria-label="Close image"
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={() => setLightboxIndex((i) => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <div className="max-h-full max-w-full overflow-auto">
              <img
                src={images[lightboxIndex]}
                alt={`${hotel.name} - Enlarged`}
                style={{ transform: `scale(${zoom})` }}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 items-center">
              <button
                onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                className="p-2 bg-white rounded text-gray-800"
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-3 py-2 bg-white rounded text-gray-800 font-medium"
                aria-label="Reset zoom"
              >
                Reset
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                className="p-2 bg-white rounded text-gray-800"
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          </div>
        )}
        {/* Hotel Details */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
                <span className="ml-2 font-semibold">{rating}.0</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{hotel.location}, {hotel.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                <span className="font-semibold">${price}/night</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {hotel.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>
          )}

          {/* Room Types */}
          {hotel.room_types && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Available Rooms</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(hotel.room_types).map(([roomType, count]: [string, any]) => (
                  count > 0 && (
                    <div key={roomType} className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 capitalize">{roomType}</p>
                      <p className="text-xs text-blue-600">{count} available</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meal Options */}
          {mealOptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Meal Options</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mealOptions.map((meal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg text-orange-900"
                  >
                    <Coffee size={16} />
                    <span className="text-sm capitalize">{meal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Rooms */}
          {hotel.total_rooms && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-900">
                <span className="font-semibold">Total Rooms Available: </span>
                {hotel.total_rooms}
              </p>
            </div>
          )}

          {/* Action Buttons - Only for Customer */}
          {isCustomerView && (onApprove || onReject) && (
            <div className="pt-4 border-t space-y-3">
              {!isRejectingWithNote ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRejectingWithNote(true)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={onApprove}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Add a note (optional) for the admin:</p>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="E.g., Too expensive, looking for budget options..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        onReject?.(rejectNote);
                        setRejectNote('');
                        setIsRejectingWithNote(false);
                      }}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                    <button
                      onClick={() => {
                        setRejectNote('');
                        setIsRejectingWithNote(false);
                      }}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailModal;
