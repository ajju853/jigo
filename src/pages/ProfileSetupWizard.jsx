import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useToastStore from '../stores/toastStore';
import { profileAPI } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  User, Award, Clock, Camera, Tag,
  ArrowRight, ArrowLeft, Check 
} from 'lucide-react';

const ProfileSetupWizard = () => {
  const navigate = useNavigate();
  const { user, token, setAuth } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    // Step 1: Basic Info
    title: '',
    headline: '',
    bio: '',
    about: '',
    age: '',
    gender: user?.gender || '',
    
    // Step 2: Services & Pricing
    tags: [],
    specialties: [],
    languages: [],
    price_per_hour: '',
    packages: [],
    extras: [],
    
    // Step 3: Availability
    availability: { 'Monday': { start: '09:00', end: '17:00' } }, // Simple default
    
    // Step 4: Photos
    images: [],
    
    // Step 5: Verification (Skipped for now)
    kyc_documents: []
  });

  const steps = [
    { 
      id: 1, 
      title: 'Basic Info',
      icon: <User size={20} />,
      description: 'Tell us about yourself'
    },
    { 
      id: 2, 
      title: 'Services & Pricing',
      icon: <Tag size={20} />,
      description: 'Define your services and rates'
    },
    { 
      id: 3, 
      title: 'Availability',
      icon: <Clock size={20} />,
      description: 'Set your schedule'
    },
    { 
      id: 4, 
      title: 'Gallery',
      icon: <Camera size={20} />,
      description: 'Upload your photos'
    },
    { 
      id: 5, 
      title: 'Verification',
      icon: <Award size={20} />,
      description: 'Verify your identity'
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length) {
      if (!validateStep(currentStep)) return;
      setCurrentStep(currentStep + 1);
    } else {
      await submitProfile();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!profileData.title || !profileData.bio) {
          setError('Please fill in title and bio');
          return false;
        }
        break;
      case 2:
        if (!profileData.price_per_hour) {
          setError('Please set your pricing');
          return false;
        }
        break;
      case 3:
        if (!profileData.availability || Object.keys(profileData.availability).length === 0) {
          setError('Please set your availability');
          return false;
        }
        break;
      case 4:
        // Mocked upload validation
        break;
    }
    setError(null);
    return true;
  };

  const submitProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.create(profileData, token);
      if (response.success) {
        addToast('Profile created successfully!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to create profile');
      addToast('Failed to create profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={profileData} update={updateField} />;
      case 2:
        return <ServicesStep data={profileData} update={updateField} />;
      case 3:
        return <AvailabilityStep data={profileData} update={updateField} />;
      case 4:
        return <GalleryStep data={profileData} update={updateField} />;
      case 5:
        return <VerificationStep data={profileData} update={updateField} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 pt-24 min-h-screen">
      <Card className="p-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step.id === currentStep ? 'bg-brandPurple text-white' :
                    step.id < currentStep ? 'bg-emerald-500 text-white' :
                    'bg-slate-700 text-slate-400'
                  }`}
                >
                  {step.id < currentStep ? <Check size={18} /> : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step.id < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <h3 className="text-xl font-semibold text-white">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-slate-400">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-slate-700">
          <Button 
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <Button 
            variant="primary"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : (
              <>
                {currentStep === steps.length ? 'Complete' : 'Next'}
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// =============================================
// STEP COMPONENTS
// =============================================

const BasicInfoStep = ({ data, update }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Tell us about yourself</h3>
      <p className="text-slate-400 text-sm">
        This information helps others find and connect with you
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Title / Headline"
          placeholder="e.g., Professional Companion"
          value={data.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />
        <Input
          label="Short Headline"
          placeholder="e.g., Your trusted companion"
          value={data.headline}
          onChange={(e) => update('headline', e.target.value)}
        />
        <Input
          label="Age"
          type="number"
          placeholder="e.g., 25"
          value={data.age}
          onChange={(e) => update('age', e.target.value)}
          required
        />
        <Input
          label="Gender"
          placeholder="e.g., Male / Female"
          value={data.gender}
          onChange={(e) => update('gender', e.target.value)}
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">Bio</label>
        <textarea
          className="w-full px-4 py-2 bg-darkBg/50 border border-slate-700 rounded-lg focus:outline-none focus:border-brandPurple text-white h-24"
          placeholder="Tell people about yourself, your interests, and what you offer..."
          value={data.bio}
          onChange={(e) => update('bio', e.target.value)}
          required
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">About (Detailed)</label>
        <textarea
          className="w-full px-4 py-2 bg-darkBg/50 border border-slate-700 rounded-lg focus:outline-none focus:border-brandPurple text-white h-24"
          placeholder="Share more details about your background, experience, and what makes you unique..."
          value={data.about}
          onChange={(e) => update('about', e.target.value)}
        />
      </div>
    </div>
  );
};

const ServicesStep = ({ data, update }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Define your services</h3>
      
      <Input
        label="Price per hour (₹)"
        type="number"
        placeholder="e.g., 1000"
        value={data.price_per_hour}
        onChange={(e) => update('price_per_hour', e.target.value)}
        required
      />
      
      <Input
        label="Tags (comma separated)"
        placeholder="e.g., Dinner Date, Movie, Event Companion"
        value={data.tags.join(', ')}
        onChange={(e) => update('tags', e.target.value.split(',').map(t => t.trim()))}
      />
      
      <Input
        label="Languages (comma separated)"
        placeholder="e.g., English, Hindi, Spanish"
        value={data.languages.join(', ')}
        onChange={(e) => update('languages', e.target.value.split(',').map(l => l.trim()))}
      />
    </div>
  );
};

const AvailabilityStep = ({ data, update }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Set your availability</h3>
      <p className="text-slate-400 text-sm">When are you typically available for bookings?</p>
      
      <div className="p-4 bg-darkBg border border-slate-700 rounded-lg">
        <p className="text-white font-medium mb-2">Default Working Hours</p>
        <div className="flex gap-4 items-center">
            <span className="text-slate-300 w-20">Mon-Fri</span>
            <Input type="time" placeholder="Start" value="09:00" readOnly />
            <span className="text-slate-400">to</span>
            <Input type="time" placeholder="End" value="17:00" readOnly />
        </div>
        <p className="text-xs text-brandPurple mt-4">* Detailed availability calendar coming soon.</p>
      </div>
    </div>
  );
};

const GalleryStep = ({ data, update }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Upload Photos</h3>
      <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400 hover:border-brandPurple hover:text-brandPurple cursor-pointer transition-colors">
        <Camera size={48} className="mb-4 opacity-50" />
        <p className="font-medium text-white mb-1">Click to upload photos</p>
        <p className="text-sm">SVG, PNG, JPG or GIF (max. 800x400px)</p>
      </div>
      <p className="text-xs text-brandPurple">* Image upload will be connected to S3 in production.</p>
    </div>
  );
};

const VerificationStep = ({ data, update }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Identity Verification</h3>
      <div className="bg-brandPurple/10 border border-brandPurple/20 p-6 rounded-xl flex items-start gap-4">
        <Award size={32} className="text-brandPurple shrink-0 mt-1" />
        <div>
            <h4 className="font-semibold text-white mb-2">Almost there!</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                To maintain trust and safety on Jigo, all companions must complete a background check and identity verification. You can skip this step for now to explore the dashboard, but you won't be visible in search results until verified.
            </p>
            <Button variant="outline">Start KYC Process</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupWizard;
