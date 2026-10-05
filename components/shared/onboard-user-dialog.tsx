"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { onboardInstructor, onboardLearner } from "@/lib/api/admin";
import { UserPlus } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email address"),
  role: 'INSTRUCTOR' | 'INTERN';
    required_error: "Please select a role",
  }),
});

type FormData = z.infer<typeof schema>;

interface OnboardUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function OnboardUserDialog({ open, onOpenChange, onSuccess }: OnboardUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // The backend splits onboarding across two endpoints, one per role.
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };
      const result =
        data.role === "INSTRUCTOR"
          ? await onboardInstructor(payload)
          : await onboardLearner(payload);
      toast.success(result.message);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      if (error?.status === 409) {
        toast.error("A user with this email already exists in your organisation.");
      } else {
        toast.error(error?.message || "Failed to onboard user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) { reset(); onOpenChange(o); } }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle>Onboard User</DialogTitle>
          </div>
          <DialogDescription>
            Invite a new instructor or learner to your organisation. They'll receive
            a welcome email with setup instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input {...register("firstName")} placeholder="Jane" disabled={isSubmitting} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input {...register("lastName")} placeholder="Smith" disabled={isSubmitting} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="jane@yourcompany.com"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setValue("role", v as "INSTRUCTOR" | "INTERN")}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSTRUCTOR">
                  <div>
                    <p className="font-medium">Instructor</p>
                    <p className="text-xs text-muted-foreground">Creates and manages courses</p>
                  </div>
                </SelectItem>
                <SelectItem value="INTERN">
                  <div>
                    <p className="font-medium">Learner</p>
                    <p className="text-xs text-muted-foreground">Enrols and completes courses</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          {selectedRole && (
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              {selectedRole === "INSTRUCTOR"
                ? "The instructor will receive an email to set up their password and can start creating courses immediately."
                : "The learner will receive an email to set up their password and can start browsing available courses."}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending invite..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
