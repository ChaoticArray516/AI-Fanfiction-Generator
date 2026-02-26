/**
 * Global Type Declarations
 *
 * Extends Astro's built-in types with custom properties
 */

declare module 'astro' {
  interface Locals {
    user: {
      id: string;
      email: string;
      name: string;
      // Add other user fields as needed
    } | null;
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
      // Add other session fields as needed
    } | null;
  }
}
