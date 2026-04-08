"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Search,
  FolderOpen,
  Calendar,
  ChevronRight
} from "lucide-react";
import { 
  listUsers, 
  updateUserStatus, 
  updateUserRoles, 
  deactivateUser,
  triggerPasswordReset,
  onboardInstructor,
  createCohort,
  createProjectTeam,
  listAllProjectTeams,
  allocateUserToTeam,
  listCohortTeams,
  listCohorts,
  listInstructors,
  AdminUserSummaryResponse,
  AdminUserDetailResponse,
  CohortResponse,
  ProjectTeamResponse,
  TeamMemberResponse,
  RoleName,
  UserStatus,
  CreateCohortRequest,
  CreateProjectTeamRequest,
  AllocateUserToTeamRequest,
  CreateInstructorRequest
} from "@/lib/api/admin";
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

const ROLE_OPTIONS = [
  { value: RoleName.ADMIN, label: "Admin" },
  { value: RoleName.INSTRUCTOR, label: "Instructor" },
  { value: RoleName.INTERN, label: "Intern" },
];

const STATUS_OPTIONS = [
  { value: UserStatus.ACTIVE, label: "Active", color: "bg-green-100 text-green-800" },
  { value: UserStatus.INACTIVE, label: "Inactive", color: "bg-gray-100 text-gray-800" },
  { value: UserStatus.LOCKED, label: "Locked", color: "bg-red-100 text-red-800" },
];

export default function AdminProgramsPage() {
  const [activeTab, setActiveTab] = useState("cohorts");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
        <p className="mt-2 text-gray-600">Manage cohorts, teams, and programs</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
        </TabsList>

        <TabsContent value="cohorts">
          <CohortsTab />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsTab />
        </TabsContent>

        <TabsContent value="instructors">
          <InstructorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CohortsTab() {
  const [cohorts, setCohorts] = useState<CohortResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCohortRequest>({
    name: "",
    description: "",
    intakeYear: new Date().getFullYear(),
    startDate: "",
    endDate: "",
  });

  const fetchCohorts = async () => {
    setLoading(true);
    try {
      const response = await listCohorts();
      setCohorts(response);
    } catch (error) {
      console.error("Failed to fetch cohorts:", error);
      setCohorts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, []);

  const handleCreateCohort = async () => {
    try {
      await createCohort(formData);
      toast.success("Cohort created successfully");
      setDialogOpen(false);
      setFormData({ name: "", description: "", intakeYear: new Date().getFullYear(), startDate: "", endDate: "" });
      fetchCohorts();
    } catch (error) {
      toast.error("Failed to create cohort");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Cohort
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cohorts found. Create your first cohort to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Intake Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohorts.map((cohort) => (
                  <TableRow key={cohort.id}>
                    <TableCell className="font-medium">{cohort.name}</TableCell>
                    <TableCell>{cohort.description}</TableCell>
                    <TableCell>{(cohort as any).intakeYear || "-"}</TableCell>
                    <TableCell>{new Date(cohort.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(cohort.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cohort.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Cohort</DialogTitle>
            <DialogDescription>Create a new cohort for your program</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spring 2026"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <Label>Intake Year</Label>
              <Input
                type="number"
                value={formData.intakeYear}
                onChange={(e) => setFormData({ ...formData, intakeYear: parseInt(e.target.value) })}
                min={2020}
                max={2100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCohort}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamsTab() {
  const [teams, setTeams] = useState<ProjectTeamResponse[]>([]);
  const [cohorts, setCohorts] = useState<CohortResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ProjectTeamResponse | null>(null);
  const [availableInterns, setAvailableInterns] = useState<AdminUserSummaryResponse[]>([]);
  const [formData, setFormData] = useState<CreateProjectTeamRequest>({
    name: "",
    cohortId: "",
    description: "",
  });
  const [allocationForm, setAllocationForm] = useState({
    userId: "",
    teamRole: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cohortsData, teamsData] = await Promise.all([
        listCohorts(),
        listAllProjectTeams(),
      ]);
      setCohorts(cohortsData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      setTeams([]);
      setCohorts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAvailableInterns = async () => {
    try {
      const response = await listUsers(undefined, undefined, 0, 100);
      const interns = response.content.filter(u => u.role === "INTERN");
      setAvailableInterns(interns);
    } catch (error) {
      console.error("Failed to fetch interns:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!formData.name || !formData.cohortId) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createProjectTeam({
        name: formData.name,
        cohortId: formData.cohortId,
        description: formData.description,
      });
      toast.success("Team created successfully");
      setCreateDialogOpen(false);
      setFormData({ name: "", cohortId: "", description: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to create team");
    }
  };

  const handleAllocateUser = async () => {
    if (!selectedTeam || !allocationForm.userId || !allocationForm.teamRole) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await allocateUserToTeam(selectedTeam.id, {
        userId: allocationForm.userId,
        teamRole: allocationForm.teamRole,
      });
      toast.success("User allocated to team successfully");
      setAllocationDialogOpen(false);
      setSelectedTeam(null);
      setAllocationForm({ userId: "", teamRole: "" });
    } catch (error) {
      toast.error("Failed to allocate user to team");
    }
  };

  const openAllocationDialog = async (team: ProjectTeamResponse) => {
    setSelectedTeam(team);
    setAllocationForm({ userId: "", teamRole: "" });
    setAllocationDialogOpen(true);
    await fetchAvailableInterns();
  };

  const getCohortName = (cohortId: string) => {
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort?.name || cohortId;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teams found. Create your first team to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{getCohortName(team.cohortId)}</TableCell>
                    <TableCell>{team.description || "-"}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openAllocationDialog(team)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Allocate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Team Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project Team</DialogTitle>
            <DialogDescription>Create a new project team within a cohort</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Team Alpha"
              />
            </div>
            <div>
              <Label>Cohort *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.cohortId}
                onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
              >
                <option value="">Select a cohort</option>
                {cohorts.filter(c => c.isActive).map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Input
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the team"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocate User Dialog */}
      <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Intern to Team</DialogTitle>
            <DialogDescription>
              Add an intern to {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Intern *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={allocationForm.userId}
                onChange={(e) => setAllocationForm({ ...allocationForm, userId: e.target.value })}
              >
                <option value="">Select an intern</option>
                {availableInterns.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.firstName} {intern.lastName} ({intern.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Role in Team *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={allocationForm.teamRole}
                onChange={(e) => setAllocationForm({ ...allocationForm, teamRole: e.target.value })}
              >
                <option value="">Select role</option>
                <option value="INTERN">Intern</option>
                <option value="LEAD">Team Lead</option>
                <option value="DEVELOPER">Developer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAllocationDialogOpen(false);
              setSelectedTeam(null);
              setAllocationForm({ userId: "", teamRole: "" });
            }}>Cancel</Button>
            <Button onClick={handleAllocateUser}>Allocate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InstructorsTab() {
  const [users, setUsers] = useState<AdminUserSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateInstructorRequest>({
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    expertise: "",
  });

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const response = await listInstructors(undefined, undefined, 0, 100);
      setUsers(response.content);
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleOnboardInstructor = async () => {
    try {
      await onboardInstructor(formData);
      toast.success("Instructor onboarded successfully");
      setDialogOpen(false);
      setFormData({ email: "", firstName: "", lastName: "", bio: "", expertise: "" });
      fetchInstructors();
    } catch (error) {
      toast.error("Failed to onboard instructor");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Onboard Instructor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No instructors found. Onboard your first instructor to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard Instructor</DialogTitle>
            <DialogDescription>Add a new instructor to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleOnboardInstructor}>Onboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}