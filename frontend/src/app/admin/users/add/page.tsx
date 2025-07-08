"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROLE_OPTIONS = ["ADMIN", "PROMOTER", "CUSTOMER"];

export default function AddUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    role: "PROMOTER",
    isActive: true
  });
  const [invite, setInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && "checked" in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm(prev => ({ ...prev, [name]: fieldValue }));
  };

  const handleInviteToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setInvite(e.target.checked);
    if (e.target.checked) {
      setForm(prev => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!form.firstName || !form.lastName || !form.email || (!invite && !form.password)) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      let payload: any = { ...form };
      if (invite) {
        payload = { ...form, invite: true };
        payload.password = undefined;
      }
      const res = await fetch("http://localhost:3001/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(invite ? "Invite email sent!" : "User created successfully!");
        setTimeout(() => router.push("/admin/users"), 1000);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Add New User</h1>
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
            <label className="block font-medium mb-1">Phone</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Optional" />
          </div>
          <div>
            <label className="block font-medium mb-1">Date of Birth</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Optional" />
          </div>
          <div>
            <label className="block font-medium mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {ROLE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center mb-2">
            <input id="invite" name="invite" type="checkbox" checked={invite} onChange={handleInviteToggle} className="mr-2" />
            <label htmlFor="invite" title="Send an invite email instead of setting a password. User will set their own password.">Invite by Email</label>
          </div>
          {!invite && (
            <div>
              <label className="block font-medium mb-1">Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
          )}
          <div className="flex items-center">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="mr-2" />
            <label>Active</label>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? (invite ? "Sending Invite..." : "Saving...") : (invite ? "Send Invite" : "Add User")}</button>
            <Link href="/admin/users" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 