"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Pencil, Save } from "lucide-react";

interface ProfileDetailsProps {
  name: string;
  email: string;
  role: string;
  onUpdate: (updatedName: string) => void;
}

export default function ProfileDetails({ name, email, role, onUpdate }: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: name,
  });

  useEffect(() => {
    setFormData({ name });
  }, [name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ name: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData.name);
    setIsEditing(false);
  };

  const handleButtonClick = () => {
    if (isEditing) {
      // Submit the form programmatically with type assertion
      const form = document.getElementById("profile-form") as HTMLFormElement | null;
      if (form) {
        form.requestSubmit();
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={handleButtonClick}
          type="button"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            ) : (
              <div className="p-2 rounded-md bg-gray-50 border border-gray-100">{formData.name}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="p-2 rounded-md bg-gray-50 border border-gray-100">{email}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="p-2 rounded-md bg-gray-50 border border-gray-100 capitalize">{role}</div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
