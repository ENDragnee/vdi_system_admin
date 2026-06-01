'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';

interface Faculty {
  id: string;
  name: string | null;
  email: string;
  role: string;
  labId: string | null;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch faculty registry');
  return res.json();
});

/**
 * Custom React Hook for managing Faculty member registration, deletion, filtering, and listing.
 * Interacts with Next.js API endpoints `/api/faculty` and handles background synchronization.
 * 
 * @param initialData - Falling back data loaded during SSR.
 */
export function useFaculty(initialData: Faculty[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingFaculty, setIsAddingFaculty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { data, mutate, isLoading } = useSWR('/api/faculty', fetcher, {
    fallbackData: { data: initialData },
  });

  const faculty: Faculty[] = data?.data || [];

  // Locally filtered list based on the search query input
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faculty, searchTerm]);

  /**
   * Dispatches a POST request to onboard a new faculty user.
   */
  const addFaculty = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields (Name, Email, Password) are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to onboard faculty user.');
      }

      setFormData({ name: '', email: '', password: '' });
      setIsAddingFaculty(false);
      mutate();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Dispatches a DELETE request to permanently remove a faculty user from the registry.
   * 
   * @param id - The CUID of the target user.
   */
  const deleteFaculty = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this faculty member? This action is permanent.')) return;

    setError(null);
    try {
      const res = await fetch(`/api/faculty/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to delete faculty member.');
      }
      mutate();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during deletion.');
    }
  };

  return {
    // state
    searchTerm,
    setSearchTerm,
    isAddingFaculty,
    setIsAddingFaculty,
    isSubmitting,
    error,
    setError,
    formData,
    setFormData,

    // data
    faculty,
    filteredFaculty,
    isLoading,

    // actions
    addFaculty,
    deleteFaculty,
  };
}
