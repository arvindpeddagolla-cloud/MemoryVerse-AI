import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, AlertCircle, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, googleLogin, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Form states
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  
  // Notice states
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      if (isForgot) {
        // Send reset
        // Simulate reset
        setMessage(`Password reset instructions have been sent to ${email}`);
        setIsForgot(false);
      } else if (isRegister) {
        await register(name, email, password, role);
        navigate('/dashboard');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="h-7 w-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">MV</span>
            <span className="font-extrabold text-base text-slate-800 tracking-tight">MemoryVerse<span className="text-blue-600">.AI</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">
            {isForgot ? 'Reset Password' : isRegister ? 'Create your profile' : 'Sign in to your account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isForgot 
              ? 'Enter your registered email address below' 
              : isRegister 
                ? 'Join MemoryVerse to store and verify your journey' 
                : 'Enter your credentials to access the platform'}
          </p>
        </div>

        {/* Notices */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Register-only Name field */}
          {!isForgot && isRegister && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Register-only Role Select field */}
          {!isForgot && isRegister && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">I am registering as a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 border rounded text-xs font-semibold transition ${
                    role === 'student'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Student / Alumnus
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`py-2 px-3 border rounded text-xs font-semibold transition ${
                    role === 'recruiter'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Recruiter / Placement Cell
                </button>
              </div>
            </div>
          )}

          {/* Password field */}
          {!isForgot && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-500">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => { setIsForgot(true); setError(null); }}
                    className="text-[10px] text-blue-600 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-md shadow-sm transition flex items-center justify-center gap-2"
          >
            {submitting ? 'Authenticating...' : isForgot ? 'Send reset link' : isRegister ? 'Register and Continue' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separator / Google Login */}
        {!isForgot && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <span className="h-px bg-slate-200 flex-1"></span>
              <span>Or Authenticate with</span>
              <span className="h-px bg-slate-200 flex-1"></span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-md shadow-sm transition flex items-center justify-center gap-2"
            >
              {/* Google Colored Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.147 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.506 0 2.89.535 3.973 1.415l3.075-3.075C19.123 2.54 15.86 1.5 12.24 1.5 6.308 1.5 1.5 6.308 1.5 12.24s4.808 10.74 10.74 10.74c5.905 0 10.457-4.148 10.457-10.457 0-.58-.063-1.16-.179-1.724L12.24 10.285z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Bottom Switch Tab */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <button
            onClick={() => {
              if (isForgot) {
                setIsForgot(false);
              } else {
                setIsRegister(!isRegister);
              }
              setError(null);
              setMessage(null);
            }}
            className="text-xs text-blue-605 hover:underline font-semibold"
          >
            {isForgot 
              ? 'Back to Sign In' 
              : isRegister 
                ? 'Already have an account? Sign In' 
                : 'Need an account? Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
};

// Simple inline checklist icon
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
