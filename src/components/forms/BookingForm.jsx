import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Calendar, Clock, CreditCard, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { paymentAPI } from '../../api/client';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import useAuthStore from '../../stores/authStore';
import useBookingStore from '../../stores/bookingStore';
import useToastStore from '../../stores/toastStore';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export const BookingForm = ({ profile, onComplete }) => {
  const { user, token } = useAuthStore();
  const { createBooking } = useBookingStore();
  const { addToast } = useToastStore();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(profile?.services?.[0] || null);
  const [clientSecret, setClientSecret] = useState(null);
  const intentCreated = useRef(false);

  useEffect(() => {
    if (step === 4 && !intentCreated.current) {
      intentCreated.current = true;
      paymentAPI.createIntent({ amount: (selectedPackage?.price || 0) * 100 }, token)
        .then(data => {
          const result = data.data || data;
          setClientSecret(result.clientSecret);
        })
        .catch(err => addToast('Failed to initialize payment', 'error'));
    }
  }, [step, token]);

  const timeslots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      specialRequests: '',
      agreeTerms: false
    }
  });

  const nextStep = () => {
    if (step === 1 && (!selectedDate || !selectedTime)) {
      addToast("Please select a date and time slot first.", "warning");
      return;
    }
    if (step === 2 && !selectedPackage) {
      addToast("Please select a service package.", "warning");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const StripePaymentForm = ({ onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleStripeSubmit = async (e) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setIsProcessing(true);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        addToast(error.message, 'error');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        try {
          const values = watch();
          await createBooking({
            jigoloId: profile.userId,
            profileId: profile.id,
            date: selectedDate,
            startTime: selectedTime,
            endTime: selectedTime,
            package: selectedPackage?.name,
            totalPrice: selectedPackage?.price,
            specialRequests: values.specialRequests,
          });
          onSuccess();
        } catch (err) {
          addToast(err.message || 'Booking failed', 'error');
        }
      }
      setIsProcessing(false);
    };

    return (
      <form onSubmit={handleStripeSubmit}>
        <PaymentElement />
        <div className="flex justify-between pt-4">
          <Button onClick={prevStep} variant="secondary" iconLeft={ArrowLeft} disabled={isProcessing}>Back</Button>
          <Button type="submit" variant="primary" isLoading={isProcessing}>Pay & Confirm Booking</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="w-full">
      {step < 5 && (
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                step >= s
                  ? 'bg-gradient-to-r from-brandIndigo to-brandPurple text-white shadow-neon-purple'
                  : 'bg-white/5 border border-white/10 text-slate-500'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s ? 'bg-brandIndigo' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-0">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brandIndigo" /> Select Date & Time
            </h3>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Choose Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3.5 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo focus:ring-4 focus:ring-brandIndigo/25 transition-all duration-200"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Available Time Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeslots.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      selectedTime === t
                        ? 'bg-gradient-to-r from-brandIndigo to-brandPurple border-transparent text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={nextStep} variant="primary" iconRight={ArrowRight}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-lg font-heading font-semibold text-white">Select Service Package</h3>
            <div className="space-y-3">
              {(profile?.services || []).map(pkg => (
                <label key={pkg.id || pkg.name} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id ? 'border-brandIndigo bg-brandIndigo/10' : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="selected_package"
                      className="text-brandIndigo focus:ring-brandIndigo/50 bg-transparent border-white/20 w-4 h-4"
                      checked={selectedPackage?.id === pkg.id}
                      onChange={() => setSelectedPackage(pkg)}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{pkg.name}</h4>
                      <span className="text-xs text-slate-400">{pkg.duration} {pkg.duration === 1 ? 'Hour' : 'Hours'}</span>
                    </div>
                  </div>
                  <div className="text-md font-heading font-bold text-brandIndigo">₹{pkg.price}</div>
                </label>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button onClick={prevStep} variant="secondary" iconLeft={ArrowLeft}>Back</Button>
              <Button onClick={nextStep} variant="primary" iconRight={ArrowRight}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-lg font-heading font-semibold text-white">Special Requests & Terms</h3>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Special Requests / Notes</label>
              <textarea
                className="w-full min-h-[120px] p-4 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brandIndigo focus:ring-4 focus:ring-brandIndigo/25 transition-all duration-200"
                placeholder="Mention any preferences, location details, or specific outfits you want your companion to wear..."
                {...register('specialRequests')}
              />
            </div>
            <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer hover:text-white pt-2">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded bg-white/5 border-white/10 text-brandIndigo focus:ring-brandIndigo/50"
                {...register('agreeTerms', { required: 'You must agree to safety and cancellation terms' })}
              />
              <div>
                I agree to the safety guidelines, booking terms, and acknowledge a 24-hour cancellation policy.
                {errors.agreeTerms && <p className="text-rose-400 text-[10px] font-semibold mt-0.5">{errors.agreeTerms.message}</p>}
              </div>
            </label>
            <div className="flex justify-between pt-4">
              <Button onClick={prevStep} variant="secondary" iconLeft={ArrowLeft}>Back</Button>
              <Button onClick={handleSubmit(() => { if (watch('agreeTerms')) nextStep(); else addToast("You must agree to the terms.", "warning"); })} variant="primary" iconRight={ArrowRight}>Go to Payment</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brandIndigo" /> Payment
            </h3>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl mb-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-white text-base">₹{selectedPackage?.price}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
                <span>Companion:</span>
                <span>{profile?.user?.name || profile?.name} ({selectedPackage?.name})</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                <span>Date & Time:</span>
                <span>{selectedDate} at {selectedTime}</span>
              </div>
            </div>
            {clientSecret === 'mock_secret' ? (
              <div className="p-6 border border-brandIndigo/20 bg-brandIndigo/5 rounded-2xl text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-brandIndigo/20 text-brandIndigo">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Simulated Checkout</h4>
                  <p className="text-xs text-slate-400">Stripe keys are not configured. This is a simulated payment flow.</p>
                </div>
                <div className="flex justify-between pt-4">
                  <Button onClick={prevStep} variant="secondary" iconLeft={ArrowLeft}>Back</Button>
                  <Button onClick={async () => {
                    try {
                      await createBooking({
                        jigoloId: profile.userId,
                        profileId: profile.id,
                        date: selectedDate,
                        startTime: selectedTime,
                        endTime: selectedTime,
                        package: selectedPackage?.name,
                        totalPrice: selectedPackage?.price,
                        specialRequests: watch('specialRequests'),
                      });
                      setStep(5);
                    } catch (err) {
                      addToast(err.message || 'Booking failed', 'error');
                    }
                  }} variant="primary">Confirm Mock Payment</Button>
                </div>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm onSuccess={() => setStep(5)} />
              </Elements>
            ) : (
              <div className="flex justify-center py-8">
                <Spinner className="w-6 h-6 text-brandIndigo" />
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-10 space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-heading font-bold text-white">Booking Confirmed!</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Your booking request has been successfully processed and sent to {profile?.user?.name || profile?.name} for confirmation.
              </p>
            </div>
            <div className="p-5 glass-panel bg-white/5 max-w-md mx-auto text-left text-xs space-y-2.5">
              <div className="flex justify-between"><span className="text-slate-500">Booking ID:</span><span className="text-white font-semibold">BKG-{Date.now().toString().slice(-6)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Companion:</span><span className="text-white font-semibold">{profile?.user?.name || profile?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Schedule:</span><span className="text-white font-semibold">{selectedDate} at {selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Service:</span><span className="text-white font-semibold">{selectedPackage?.name}</span></div>
              <div className="flex justify-between border-t border-white/5 pt-2 mt-2"><span className="text-slate-400 font-semibold">Total Paid:</span><span className="text-brandIndigo font-bold text-sm">₹{selectedPackage?.price}</span></div>
            </div>
            <div className="pt-4">
              <Button onClick={onComplete} variant="primary">Go to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
