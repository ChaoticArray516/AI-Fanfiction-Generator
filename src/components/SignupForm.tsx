/**
 * Sign Up Form Component
 *
 * Handles new user registration with email, password, and name
 * Automatically migrates guest data if present
 */

import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { authClient } from '../auth-client';
import { guestDataManager } from '../lib/guestDataManager';

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const name = (formData.get('name') as string) ?? '';
    const email = (formData.get('email') as string) ?? '';
    const password = (formData.get('password') as string) ?? '';
    const confirmPassword = (formData.get('confirmPassword') as string) ?? '';

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (!response.error) {
        // Check if guest data exists and migrate it
        const guestData = guestDataManager.getDataForMigration();

        if (guestData && guestData.chapters.length > 0) {
          setIsMigrating(true);

          try {
            // Migrate guest data to the server
            const migrateResponse = await fetch('/api/migrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guestData }),
            });

            if (migrateResponse.ok) {
              // Clear guest data after successful migration
              guestDataManager.clearData();

              // Show success message
              const migrateResult = await migrateResponse.json();
              console.log('Migration successful:', migrateResult);
            }
          } catch (migrateError) {
            console.error('Migration failed:', migrateError);
            // Don't block signup if migration fails
          }

          setIsMigrating(false);
        }

        // Call success callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(response.error.message ?? 'Signup failed');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12101D] flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#EAE6F8] mb-2">Create Account</h1>
          <p className="text-[#A09CB8]">Start your writing journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#A09CB8] mb-2">
              Name
            </label>
            <input
              required
              type="text"
              id="name"
              name="name"
              placeholder="Your Name"
              className="w-full bg-[rgba(18,16,29,0.6)] border border-[#3A3651] rounded-lg px-4 py-3 text-[#EAE6F8] placeholder:text-[#3A3651] focus:outline-none focus:border-[#8A2BE2] transition-colors"
              disabled={isLoading}
            />
          </div>

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
              minLength={8}
              className="w-full bg-[rgba(18,16,29,0.6)] border border-[#3A3651] rounded-lg px-4 py-3 text-[#EAE6F8] placeholder:text-[#3A3651] focus:outline-none focus:border-[#8A2BE2] transition-colors"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-[#A09CB8]">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#A09CB8] mb-2">
              Confirm Password
            </label>
            <input
              required
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              minLength={8}
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
            disabled={isLoading || isMigrating}
            className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMigrating ? 'Migrating your story...' : isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          {isMigrating && (
            <p className="text-center text-sm text-[#A09CB8]">
              ✨ We're saving your story to your new account...
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-[#A09CB8]">
          Already have an account?{' '}
          <a href="/signin" className="text-[#8A2BE2] hover:text-[#A78BFA] font-medium transition-colors">
            Sign in
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
