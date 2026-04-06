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
import { Mail, Calendar, X } from 'lucide-react';

interface Faculty {
  id: string;
  name: string | null;
  email: string;
  role: string;
  labId: string | null;
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface EditFacultyFormProps {
  faculty: Faculty;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function EditFacultyForm({
  faculty,
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
}: EditFacultyFormProps) {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">Edit Faculty Member</CardTitle>
            <CardDescription>
              Update the details for {faculty.name || 'this faculty member'}
            </CardDescription>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close edit form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          {/* Original Info Display */}
          <div className="mb-4 p-3 bg-white dark:bg-slate-900 rounded-md border border-blue-100 dark:border-blue-900">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Original Information
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{faculty.name || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{faculty.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {new Date(faculty.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form Fields */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <Input
                placeholder="Enter faculty name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
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
                Password (leave blank to keep unchanged)
              </label>
              <Input
                type="password"
                placeholder="Enter new password (optional)"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only fill this if you want to change the password
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

