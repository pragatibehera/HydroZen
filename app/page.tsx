import { Navbar } from '@/components/navbar';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Dashboard />
      </main>
    </div>
  );
}