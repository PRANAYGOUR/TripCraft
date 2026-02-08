import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, User, Phone, MapPin, ChevronLeft } from 'lucide-react';

interface Page1Props {
  onSubmit: (data: any) => void;
  initialData: any;
  onBack?: () => void;
}

export default function Page1({ onSubmit, initialData, onBack }: Page1Props) {
  const [email, setEmail] = useState(initialData.email || '');
  const [name, setName] = useState(initialData.name || '');
  const [contact, setContact] = useState(initialData.contact || '');
  const [location, setLocation] = useState(initialData.location || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, name, contact, location });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1719777939202-697d5527f600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwdmFjYXRpb24lMjB0cmF2ZWx8ZW58MXx8fHwxNzcwMzUxNTk1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-pink-900/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          )}
          
          {/* Hero Text */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 tracking-tight">
              HEY GOOD LOOKIN'!
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/95 mb-6">
              WE JUST NEED A FEW DETAILS TO CRAFT YOUR TRIP
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Share your details with us, and we'll create an unforgettable experience tailored just for you
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8 md:p-10 backdrop-blur-sm bg-white/95 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-12"
                />
                <p className="text-sm text-gray-600">
                  This is where we will send you the details about your dream trip
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12"
                />
                <p className="text-sm text-gray-600">
                  What the world calls you
                </p>
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact"
                  type="tel"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-12"
                />
                <p className="text-sm text-gray-600">
                  This is where we will call you if we need any details to make your trip better. Don't worry, your information is always kept confidential.
                </p>
              </div>

              {/* Trip Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-600" />
                  Trip Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Bali, Indonesia"
                  className="h-12"
                />
                <p className="text-sm text-gray-600">
                  Location that you would want to explore
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg tracking-wide rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                PLAN MY TRIP!
              </button>
            </form>
          </Card>

          {/* Footer text */}
          <p className="text-center text-white/70 text-sm mt-6">
            Your privacy is important to us. We'll never share your information.
          </p>
        </div>
      </div>
    </div>
  );
}
