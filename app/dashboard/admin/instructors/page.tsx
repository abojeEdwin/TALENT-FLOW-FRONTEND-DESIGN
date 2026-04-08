"use client";

import { useState, useEffect } from "react";
import { RoleGuard } from "@/components/shared/role-guard";
import { listInstructors, onboardInstructor, AdminUserSummaryResponse, PagedResponse, UserStatus } from "@/lib/api/admin";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Users, 
  Mail, 
  User, 
  Loader2, 
  Search,
  MoreVertical,
  Shield,
  Clock
} from "lucide-react";

interface CreateInstructorFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminInstructorsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateInstructorFormData>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<CreateInstructorFormData>>({});
  
  const [instructors, setInstructors] = useState<AdminUserSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  const fetchInstructors = async (page: number = 0) => {
    setIsLoadingList(true);
    try {
      const response = await listInstructors(
        searchQuery || undefined,
        undefined,
        page,
        pageSize
      );
      setInstructors(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message || "Failed to load instructors");
      } else {
        toast.error("An error occurred while loading instructors");
      }
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleSearch = () => {
    fetchInstructors(0);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateInstructorFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onboardInstructor({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });

      toast.success("Instructor onboarded successfully! An invitation email has been sent.");
      setShowForm(false);
      setFormData({ firstName: "", lastName: "", email: "" });
      fetchInstructors();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message || "Failed to onboard instructor");
      } else {
        toast.error("An error occurred while onboarding instructor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING_VERIFICATION":
        return "bg-yellow-100 text-yellow-800";
      case "LOCKED":
        return "bg-red-100 text-red-800";
      case "DISABLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <RoleGuard roles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
            <p className="mt-2 text-gray-600">Manage instructor onboarding and profiles</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? (
              <>Cancel</>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Onboard Instructor
              </>
            )}
          </Button>
        </div>

        {showForm && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Onboard New Instructor</CardTitle>
              <CardDescription>
                Create a new instructor account. An invitation email will be sent to the provided email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ firstName: "", lastName: "", email: "" });
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Onboarding..." : "Onboard Instructor"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Existing Instructors
            </CardTitle>
            <CardDescription>
              View and manage all registered instructors in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Search
              </Button>
            </div>

            {isLoadingList ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : instructors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No instructors found</p>
                <p className="text-sm">Click "Onboard Instructor" to add a new one</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Last Login
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {instructors.map((instructor) => (
                        <tr key={instructor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium text-gray-900">
                                {instructor.firstName} {instructor.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {instructor.email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Shield className="w-3 h-3" />
                              {instructor.role || "INSTRUCTOR"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(instructor.status)}`}>
                              {instructor.status?.replace(/_/g, " ") || "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {instructor.lastLoginAt ? (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(instructor.lastLoginAt).toLocaleDateString()}
                              </div>
                            ) : (
                              "Never"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 0}
                        onClick={() => fetchInstructors(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => fetchInstructors(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}