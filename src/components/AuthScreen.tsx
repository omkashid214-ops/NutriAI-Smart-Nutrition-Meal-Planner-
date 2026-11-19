import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, Leaf, Lock, Mail, User as UserIcon } from 'lucide-react';
import {
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from '../services/firebaseService';
import { FoodImage } from './FoodImage';

interface AuthScreenProps {
  onStartDemo: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onStartDemo }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const validateForm = (): string | null => {
    const trimmedEmail = email.trim();
    if (mode === 'register' && fullName.trim().length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (mode === 'register' && password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(fullName, email, password);
        setInfoMsg(
          'Account created. Please check your inbox to verify your email, or use Google Sign-In / Demo Mode for instant cloud sync.'
        );
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.includes('operation-not-allowed')) {
        setErrorMsg(
          'Email/Password sign-in is not yet enabled in your Firebase Console Authentication settings. Use "Continue with Google" for live Firebase sync or "Explore Local Demo Mode" below.'
        );
      } else if (msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        setErrorMsg('Invalid email or password. Please double-check your credentials.');
      } else if (msg.includes('email-already-in-use')) {
        setErrorMsg('An account with this email already exists. Switch to Sign In.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Editorial Visual Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 bg-[#14532D] text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative"
        >
          <div>
            <div className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#E6F4EC] text-[#14532D] flex items-center justify-center">
                <Leaf className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">NutriAI</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-balance mb-4">
              Personalized nutrition built around your body and goals.
            </h1>
            <p className="text-[#D4E7DA] text-sm sm:text-base leading-relaxed max-w-md mb-8">
              Calculate your BMI and Mifflin-St Jeor calorie target, discover tailored Vegetarian,
              Vegan, and Non-Vegetarian meals, and plan every day with real-time macro tracking.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/15">
              <FoodImage
                imageKey="veg_paneer_bowl"
                alt="Grilled Paneer Tikka Quinoa Bowl"
                className="w-full h-52 sm:h-60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#C7E2CF]">
              <span>BMI &amp; TDEE Calculator</span>
              <span aria-hidden="true">·</span>
              <span>Rule-Based Meal Engine</span>
              <span aria-hidden="true">·</span>
              <span>Firebase Cloud Sync</span>
            </div>
          </div>
        </motion.div>

        {/* Right Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 bg-white border border-[#E2E8DF] rounded-3xl p-7 sm:p-10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#14231A]">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-[#526458] mt-1">
                  {mode === 'login'
                    ? 'Sign in to access your nutrition plan and meal logs.'
                    : 'Start tracking calories, macros, and personalized meals.'}
                </p>
              </div>
            </div>

            {/* Segmented Mode Switch */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#F1F5EE] rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-white text-[#14231A] shadow-xs'
                    : 'text-[#526458] hover:text-[#14231A]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === 'register'
                    ? 'bg-white text-[#14231A] shadow-xs'
                    : 'text-[#526458] hover:text-[#14231A]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Primary Firebase Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#1B6B40] text-white font-medium text-sm hover:bg-[#14532D] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.48-1.71 4.34-5.27 4.34-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.81 0 3.01.77 3.7 1.44l2.52-2.43C16.77 4.19 14.68 3.3 12.17 3.3 7.1 3.3 3 7.4 3 12.56s4.1 9.26 9.17 9.26c5.3 0 8.81-3.72 8.81-8.96 0-.6-.06-1.06-.15-1.76z"
                />
              </svg>
              <span>Continue with Google (Firebase Auth)</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E4EAE2]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#65786B]">or with email &amp; password</span>
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-4 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs leading-relaxed"
              >
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div
                role="status"
                className="mb-4 p-3.5 rounded-xl bg-[#E6F4EC] border border-[#B7DFC8] text-[#14532D] text-xs leading-relaxed"
              >
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-fullname"
                    className="block text-xs font-medium text-[#374B3E] mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#6B7E71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      maxLength={80}
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium text-[#374B3E] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7E71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={160}
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium text-[#374B3E] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7E71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#526458] hover:text-[#14231A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-confirm"
                    className="block text-xs font-medium text-[#374B3E] mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6B7E71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-[#14231A] text-white font-medium text-sm hover:bg-[#1F3528] transition-colors disabled:opacity-60"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In with Email'
                  : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Local Demo Mode Action */}
          <div className="mt-6 pt-5 border-t border-[#E6ECE3]">
            <button
              type="button"
              onClick={onStartDemo}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[#C6D8C8] bg-[#F3F8F3] text-[#14532D] font-medium text-sm hover:bg-[#E6F4EC] transition-colors flex items-center justify-center gap-2"
            >
              <span>Try Instant Local Demo Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-[#65786B] text-center mt-2">
              Full interactive experience saved locally on this device — zero sign-in required.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
