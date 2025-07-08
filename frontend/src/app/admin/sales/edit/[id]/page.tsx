"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
}

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params?.id;
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    isActive: true,
    collectionId: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (saleId) {
      fetchSale();
      fetchCollections();
    }
  }, [saleId]);

  const fetchSale = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/sales/${saleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setForm({
        name: data.name,
        description: data.description,
        discountPercent: data.discountPercent,
        startDate: data.startDate?.slice(0, 10) || "",
        endDate: data.endDate?.slice(0, 10) || "",
        isActive: data.isActive,
        collectionId: data.collectionId || ""
      });
    }
    setLoading(false);
  };

  const fetchCollections = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/collections", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setCollections(data.collections || data);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && "checked" in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!form.name || !form.discountPercent || !form.startDate || !form.endDate) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/sales/${saleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          discountPercent: parseFloat(form.discountPercent),
        })
      });
      if (res.ok) {
        setSuccess("Sale updated successfully!");
        setTimeout(() => router.push("/admin/sales"), 1000);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to update sale");
      }
    } catch (err) {
      setError("Failed to update sale");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Edit Sale</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block font-medium mb-1">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Discount Percent (%) *</label>
            <input name="discountPercent" type="number" min="1" max="100" value={form.discountPercent} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Start Date *</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">End Date *</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Collection</label>
            <select name="collectionId" value={form.collectionId} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">All Products</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
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
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>{loading ? "Saving..." : "Update Sale"}</button>
            <Link href="/admin/sales" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 