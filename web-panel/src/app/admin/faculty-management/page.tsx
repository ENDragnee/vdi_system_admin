
import FacultyManagementClient from './client-page';

export default async function FacultyPage() {
  const data = await getFaculty();

  return <FacultyManagementClient initialData={data?.data || []} />;
}

async function getFaculty() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/faculty`, {
    cache: 'no-store', // always fresh data
  });

  if (!res.ok) {
    throw new Error('Failed to fetch faculty');
  }

  return res.json();
}
