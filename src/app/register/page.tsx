import AuthCard from "@/components/AuthCard";
import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <AuthCard title="Create your account" subtitle="Student registration for ordering food on campus.">
      <RegisterForm />
    </AuthCard>
  );
}
