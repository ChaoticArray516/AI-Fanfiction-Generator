/**
 * Sign In Form Component
 *
 * Handles user authentication with email and password
 */

import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { authClient } from '../auth-client';

interface SigninFormProps {
  onSuccess?: () => void;
}

export function SigninForm({ onSuccess }: SigninFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const email = (formData.get('email') as string) ?? '';
    const password = (formData.get('password') as string) ?? '';

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (!response.error) {
        // Call success callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(response.error.message ?? 'Sign-in failed');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12101D] flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#EAE6F8] mb-2">Welcome Back</h1>
          <p className="text-[#A09CB8]">Sign in to continue writing</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#A09CB8] mb-2">
              Email
            </label>
            <input
              required
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              className="w-full bg-[rgba(18,16,29,0.6)] border border-[#3A3651] rounded-lg px-4 py-3 text-[#EAE6F8] placeholder:text-[#3A3651] focus:outline-none focus:border-[#8A2BE2] transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#A09CB8] mb-2">
              Password
            </label>
            <input
              required
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="w-full bg-[rgba(18,16,29,0.6)] border border-[#3A3651] rounded-lg px-4 py-3 text-[#EAE6F8] placeholder:text-[#3A3651] focus:outline-none focus:border-[#8A2BE2] transition-colors"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-[#E05A5A]/20 border border-[#E05A5A] rounded-lg p-3 text-sm text-[#EAE6F8]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A09CB8]">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#8A2BE2] hover:text-[#A78BFA] font-medium transition-colors">
            Sign up
          </a>
        </p>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-[#A09CB8] hover:text-[#EAE6F8] transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
