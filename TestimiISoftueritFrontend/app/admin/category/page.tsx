"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import api from "../../../services/api";

interface Category {
  id: number;
  name: string;
  type: string;
}

// We allow editing.id to be undefined for "add" mode
type EditingCategory = { id?: number; name: string; type: string };

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Category');
      const data: Category[] = res.data;
      setCategories(data.filter((c) => c.type === "Expense"));
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not load categories" });
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add
  const startAdd = () => {
    setEditing({ name: "", type: "Expense" });
  };

  // Open modal for edit
  const startEdit = (cat: Category) => {
    setEditing({ id: cat.id, name: cat.name, type: cat.type });
  };

  // Save add or edit
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      const isEdit = typeof editing.id === "number";
      if (isEdit) {
        await api.put(`/Category/${editing.id}`, { name: editing.name, type: "Expense" });
      } else {
        await api.post('/Category', { name: editing.name, type: "Expense" });
      }

      toast({ title: isEdit ? "Category updated" : "Category added" });
      setEditing(null);
      fetchCategories();
    } catch {
      toast({ variant: "destructive", title: "Error", description: editing?.id ? "Update failed" : "Create failed" });
    }
  };

  // Request delete
  const requestDelete = (cat: Category) => {
    setDeleteTarget(cat);
    setConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/Category/${deleteTarget.id}`);
      toast({ title: "Category deleted" });
      fetchCategories();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Delete failed" });
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={{ name: "Admin", role: "Administrator", isOnline: true }} />
      <main className="flex-1 p-6 bg-gray-50 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Expense Categories</h1>
          <Button onClick={startAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => requestDelete(cat)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <form onSubmit={saveEdit} className="bg-white p-6 rounded-lg space-y-4 w-80">
              <h2 className="text-lg font-semibold">
                {editing.id ? "Edit Category" : "Add Category"}
              </h2>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Category name"
                required
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editing.id ? "Save" : "Create"}</Button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
