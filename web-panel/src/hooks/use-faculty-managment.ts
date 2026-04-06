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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useFaculty(initialData: Faculty[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { data, mutate, isLoading } = useSWR('/api/faculty', fetcher, {
    fallbackData: { data: initialData },
  });

  const faculty: Faculty[] = data?.data || [];

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faculty, searchTerm]);
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
    });
  };

  const addFaculty = async () => {
    await fetch('/api/faculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setFormData({ name: '', email: '', password: '' });
    mutate();
  };

  const deleteFaculty = async (id: string) => {
    if (!confirm('Delete this faculty?')) return;

    await fetch(`/api/faculty/${id}`, { method: 'DELETE' });
    mutate();
  };

  const startEditing = (member: Faculty) => {
    setEditingId(member.id);
    setFormData({
      name: member.name || '',
      email: member.email,
      password: '',
    });
  };

  const editFaculty = async (id: string) => {
    await fetch(`/api/faculty/${id}`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ name: '', email: '', password: '' });
    setEditingId(null);
    mutate();
  }
  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };
  return {
    // state
    searchTerm,
    setSearchTerm,
    isEdit,
    setIsEdit,
    editingId,
    setEditingId,
    formData,
    setFormData,

    // data
    faculty,
    filteredFaculty,
    isLoading,

    // actions
    addFaculty,
    deleteFaculty,
    editFaculty,
    startEditing,
    cancelEdit,
  };
}
