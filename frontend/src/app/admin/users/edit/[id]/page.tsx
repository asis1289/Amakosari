"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
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

const ROLE_OPTIONS = ["ADMIN", "CUSTOMER", "PROMOTER"];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "CUSTOMER",
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: data.isActive
      });
    }
    setLoading(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && "checked" in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm(prev => ({ ...prev, [name]: fieldValue }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!form.firstName || !form.lastName || !form.email) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess("User updated successfully!");
        setTimeout(() => router.push("/admin/users"), 1000);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold mb-6">Edit User</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block font-medium mb-1">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {ROLE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="mr-2" />
            <label>Active</label>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? "Saving..." : "Update User"}</button>
            <Link href="/admin/users" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 