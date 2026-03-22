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

interface Faculty {
  id: string;
  name: string | null;
  email: string;
  role: string;
  labId: string | null;
  createdAt: string;
}

export default function FacultyManagementClient({
  initialData,
}: {
  initialData: Faculty[];
}) {
  const {
    searchTerm,
    setSearchTerm,
    isAddingFaculty,
    setIsAddingFaculty,
    formData,
    setFormData,
    filteredFaculty,
    isLoading,
    addFaculty,
    deleteFaculty,
  } = useFaculty(initialData);

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

      {/* Add Faculty Form */}
      {isAddingFaculty && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Faculty</CardTitle>
            <CardDescription>
              Fill in details to create a faculty account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFaculty();
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingFaculty(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
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
              <Card key={member.id}>
                <CardContent className="pt-6 flex justify-between items-center">
                  <div>
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

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFaculty(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
