import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  ArrowRight,
  X,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AuthService } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (redirectTarget?: string) => void;
  redirectReason?: string | null;
  targetRoute?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  redirectReason,
  targetRoute = 'history'
}) => {
  const [email, setEmail] = useState<string>('jaydevahir676789@gmail.com');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      AuthService.login(email);
      setIsSubmitting(false);
      onLoginSuccess(targetRoute || 'history');
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      AuthService.login('jaydevahir676789@gmail.com', 'Jaydev Ahir');
      setIsSubmitting(false);
      onLoginSuccess(targetRoute || 'history');
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          id="login-auth-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/20 text-slate-900 dark:text-slate-100 overflow-hidden"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            id="close-login-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Account Sign In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure access to private conversion records
              </p>
            </div>
          </div>

          {/* Redirect Notice Banner (Shown when redirected from /history) */}
          {redirectReason && (
            <motion.div
              id="auth-redirect-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authentication Required:</span>
                <p className="text-[11px] mt-0.5 text-amber-700/90 dark:text-amber-300/90">
                  You were redirected from <span className="font-mono font-bold">/{targetRoute}</span>. Please log in with your credentials to access your session history.
                </p>
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Demo Ready</span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Standard Sign In Button */}
            <button
              id="submit-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-red-600/30 transition-all"
            >
              {isSubmitting ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In & Continue to /{targetRoute}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white dark:bg-slate-900 px-2">Or Quick Test</span>
              </div>
            </div>

            {/* Quick Demo Login Button */}
            <button
              id="quick-demo-login-btn"
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Simulate Instant Login (User Account)</span>
            </button>
          </form>

          {/* Security Guarantee */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strict Route Guard &bull; Client Encrypted Token</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
