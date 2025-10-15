'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';

// This is a client-side only component that handles Firestore permission errors globally.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: any) => {
      // This will throw the error so that Next.js's development overlay can catch and display it.
      // In production, this would be handled by a different error boundary.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
