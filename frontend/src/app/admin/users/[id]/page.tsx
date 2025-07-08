"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">User Details</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">Role:</span> {user.role}
          </div>
          <div>
            <span className="font-medium">Status:</span> {user.isActive ? 'Active' : 'Inactive'}
          </div>
          <div>
            <span className="font-medium">Created At:</span> {user.createdAt?.slice(0, 10)}
          </div>
        </div>
        <div className="flex space-x-4 mt-6">
          <Link href="/admin/users" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Users</Link>
          <Link href={`/admin/users/edit/${user.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit User</Link>
        </div>
      </div>
    </div>
  );
} 