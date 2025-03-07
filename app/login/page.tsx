import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-cyan-50 to-white dark:from-blue-950 dark:via-cyan-950 dark:to-gray-900">
      <AuthForm />
    </div>
  );
}