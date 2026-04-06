'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Edit2, Plus, Mail, Calendar } from 'lucide-react';
import { useFaculty } from '@/hooks/use-faculty-managment';
import { EditFacultyForm } from '@/components/admin/faculty/edit-faculty-form';

interface Faculty {
  id: string;
  name: string | null;
  email: string;
  role: string;
  labId: string | null;
  createdAt: string;
}

// Mock initial data for demo purposes
const initialData: Faculty[] = [
  {
    id: '1',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    role: 'FACULTY',
    labId: null,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'FACULTY',
    labId: null,
    createdAt: '2024-02-20T14:45:00Z',
  },
];

export default function FacultyManagementClient() {
  const {
    searchTerm,
    setSearchTerm,
    isAddingFaculty,
    setIsAddingFaculty,
    editingId,
    formData,
    setFormData,
    filteredFaculty,
    isLoading,
    addFaculty,
    deleteFaculty,
    editFaculty,
    startEditing,
    cancelEdit,
  } = useFaculty(initialData);

  const editingFaculty = filteredFaculty.find((m) => m.id === editingId);

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor faculty members
          </p>
        </div>

        {/* Search + Add */}
        <div className="flex gap-4 flex-col sm:flex-row sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button onClick={() => setIsAddingFaculty(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Add Faculty Form - Only shown when adding new faculty */}
      {isAddingFaculty && editingId === null && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Faculty</CardTitle>
            <CardDescription>Fill in details to create a faculty account</CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFaculty();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Name
                </label>
                <Input
                  placeholder="Enter faculty name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password *
                </label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingFaculty(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Faculty'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Faculty List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">
          Faculty Members ({filteredFaculty.length})
        </h2>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filteredFaculty.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No faculty found
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredFaculty.map((member) => (
              <div key={member.id}>
                {/* Edit Form - Appears inline at the faculty member's position */}
                {editingId === member.id && editingFaculty ? (
                  <EditFacultyForm
                    faculty={editingFaculty}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={() => { editFaculty(member.id); cancelEdit; }}
                    onCancel={cancelEdit}
                    isLoading={isLoading}
                  />
                ) : (
                  /* Faculty Card - Normal view */
                  <Card>
                    <CardContent className="pt-6 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {member.name || 'N/A'}
                          </h3>
                          <Badge variant="outline">FACULTY</Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {member.email}
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(member)}
                          disabled={editingId !== null}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteFaculty(member.id)}
                          disabled={editingId !== null}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
