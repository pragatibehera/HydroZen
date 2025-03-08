import { Auth } from "@/components/Auth";

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Welcome to HydroZen
      </h1>
      <Auth />
    </div>
  );
}
