'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Password resets are managed by your organisation administrator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Self-service password reset is not available. Please contact your organisation
          administrator to request a password reset link.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
