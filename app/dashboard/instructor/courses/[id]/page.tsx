"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Video, 
  FileImage, 
  MoreVertical, 
  Trash2, 
  Edit, 
  GripVertical,
  Loader2,
  FolderOpen,
  BookOpen,
  Upload,
  X
} from "lucide-react";
import { 
  CourseResponse, 
  CourseModuleResponse, 
  LessonResponse, 
  LessonType 
} from "@/lib/api/types";
import { fetchCourseById, fetchCourseModules, createCourseModule, createLessonWithFile, createLesson } from "@/lib/api/courses";
import { CreateModuleSchema, CreateLessonSchema, CreateModuleFormData, CreateLessonFormData } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function ModuleCard({ 
  module, 
  lessons, 
  onAddLesson,
  onDeleteModule,
  onDeleteLesson
}: { 
  module: CourseModuleResponse; 
  lessons: LessonResponse[];
  onAddLesson: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}) {
  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case "VIDEO": return <Video className="h-4 w-4" />;
      case "PDF": return <FileImage className="h-4 w-4" />;
      case "TEXT": return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              {module.description && (
                <CardDescription className="mt-1">{module.description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDeleteModule(module.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No lessons yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => onAddLesson(module.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Lesson
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  {getLessonIcon(lesson.type)}
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{lesson.type?.toLowerCase() || 'lesson'}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDeleteLesson(lesson.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => onAddLesson(module.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddModuleDialog({ 
  onSubmit 
}: { 
  onSubmit: (data: CreateModuleFormData) => Promise<void> 
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateModuleFormData>({
    resolver: zodResolver(CreateModuleSchema),
    defaultValues: {
      title: "",
      description: "",
      position: undefined,
    },
  });

  const handleSubmit = async (data: CreateModuleFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create module");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
          <DialogDescription>
            Create a new module to organize your course content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module-title">Module Title</Label>
            <Input
              id="module-title"
              placeholder="e.g., Introduction to React"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-description">Description (Optional)</Label>
            <Textarea
              id="module-description"
              placeholder="Brief description of this module"
              {...form.register("description")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-position">Position</Label>
            <Input
              id="module-position"
              type="number"
              min="1"
              placeholder="e.g., 1"
              {...form.register("position", { valueAsNumber: true })}
            />
            {form.formState.errors.position && (
              <p className="text-sm text-destructive">{form.formState.errors.position.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Module
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddLessonDialog({ 
  moduleId,
  isOpen,
  onClose,
  onSubmit 
}: { 
  moduleId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleId: string, data: CreateLessonFormData & { file?: File }) => Promise<void> 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<CreateLessonFormData>({
    resolver: zodResolver(CreateLessonSchema),
    defaultValues: {
      title: "",
      type: "VIDEO",
      content: "",
      position: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setFile(null);
    }
  }, [isOpen, form]);

  const handleSubmit = async (data: CreateLessonFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(moduleId, { ...data, file: file || undefined });
      onClose();
    } catch (error) {
      toast.error("Failed to create lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const lessonType = form.watch("type");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>
            Create a new lesson within this module.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              placeholder="e.g., Getting Started"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Lesson Type</Label>
            <Select 
              value={form.watch("type")} 
              onValueChange={(value: LessonType) => form.setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="TEXT">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(lessonType === "VIDEO" || lessonType === "PDF") && (
            <div className="space-y-2">
              <Label>Upload File</Label>
              <input
                type="file"
                accept={lessonType === "VIDEO" ? "video/*" : "application/pdf"}
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) setFile(selectedFile);
                }}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                "
              />
              {file && (
                <div className="flex items-center gap-2 p-2 border rounded bg-muted/50">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {lessonType === "TEXT" && (
            <div className="space-y-2">
              <Label htmlFor="lesson-content">Content</Label>
              <Textarea
                id="lesson-content"
                placeholder="Enter lesson content..."
                className="min-h-32"
                {...form.register("content")}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Lesson
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CourseEditorPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [modules, setModules] = useState<CourseModuleResponse[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, LessonResponse[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("modules");
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      const [courseData, modulesData] = await Promise.all([
        fetchCourseById(courseId),
        fetchCourseModules(courseId),
      ]);
      
      setCourse(courseData);
      setModules(modulesData);

      const lessonsMap: Record<string, LessonResponse[]> = {};
      modulesData.forEach((mod) => {
        lessonsMap[mod.id] = mod.lessons || [];
      });
      
      setLessonsByModule(lessonsMap);
    } catch (error) {
      console.error("Failed to load course data:", error);
      toast.error("Failed to load course data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModule = async (data: CreateModuleFormData) => {
    const newModule = await createCourseModule(courseId, data);
    setModules([...modules, newModule]);
    setLessonsByModule({ ...lessonsByModule, [newModule.id]: [] });
    toast.success("Module created successfully");
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module and all its lessons?")) return;
    
    try {
      await fetch(`/api/v1/instructor/modules/${moduleId}`, { method: "DELETE" });
      setModules(modules.filter((m) => m.id !== moduleId));
      const newLessonsMap = { ...lessonsByModule };
      delete newLessonsMap[moduleId];
      setLessonsByModule(newLessonsMap);
      toast.success("Module deleted");
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  const handleCreateLesson = async (
    moduleId: string, 
    data: CreateLessonFormData & { file?: File }
  ) => {
    let newLesson: LessonResponse;

    if (data.file) {
      newLesson = await createLessonWithFile(
        moduleId,
        data.title,
        data.type,
        data.position || lessonsByModule[moduleId].length + 1,
        data.file
      );
    } else {
      newLesson = await createLesson(moduleId, {
        title: data.title,
        type: data.type as LessonType,
        content: data.content,
        position: data.position || lessonsByModule[moduleId].length + 1,
      });
    }

    setLessonsByModule({
      ...lessonsByModule,
      [moduleId]: [...lessonsByModule[moduleId], newLesson],
    });
    toast.success("Lesson created successfully");
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    
    try {
      await fetch(`/api/v1/instructor/lessons/${lessonId}`, { method: "DELETE" });
      
      const newLessonsMap = { ...lessonsByModule };
      Object.keys(newLessonsMap).forEach((moduleId) => {
        newLessonsMap[moduleId] = newLessonsMap[moduleId].filter((l) => l.id !== lessonId);
      });
      setLessonsByModule(newLessonsMap);
      toast.success("Lesson deleted");
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <RoleGuard roles={["INSTRUCTOR"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/instructor/courses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="mt-2 text-gray-600">{course?.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={course?.status === "PUBLISHED" ? "default" : "secondary"}>
              {course?.status}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Course Modules</h2>
                <p className="text-sm text-muted-foreground">
                  Organize your course into modules and add lessons
                </p>
              </div>
              <AddModuleDialog onSubmit={handleCreateModule} />
            </div>

            {modules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by adding a module to organize your course content
                  </p>
                  <Button onClick={() => {}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Module
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div>
                {modules
                  .sort((a, b) => a.position - b.position)
                  .map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      lessons={lessonsByModule[module.id] || []}
                      onAddLesson={(moduleId) => setAddLessonModuleId(moduleId)}
                      onDeleteModule={handleDeleteModule}
                      onDeleteLesson={handleDeleteLesson}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>
                  Manage your course settings and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Course Title</Label>
                  <Input value={course?.title} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={course?.description} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Input value={course?.status} disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddLessonDialog
          moduleId={addLessonModuleId || ""}
          isOpen={!!addLessonModuleId}
          onClose={() => setAddLessonModuleId(null)}
          onSubmit={handleCreateLesson}
        />
      </div>
    </RoleGuard>
  );
}