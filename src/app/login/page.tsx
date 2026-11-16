import { Suspense } from "react";
import AuthCard from "@/components/AuthCard";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <AuthCard title="Sign in" subtitle="Students, canteen staff and admins sign in here.">
      {/* useSearchParams() needs a Suspense boundary with Cache Components */}
      <Suspense fallback={<p className="text-sm">Loading...</p>}>
        <LoginForm demoHint={process.env.NODE_ENV !== "production"} />
      </Suspense>
    </AuthCard>
  );
}
