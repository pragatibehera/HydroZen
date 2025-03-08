"use client";

import { useAuth } from "@/contexts/auth-context";
import { HouseholdManagement } from "@/components/models/household-management";
import { ProtectedRoute } from "@/components/protected-route";

export default function HouseholdPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <HouseholdManagement />
      </div>
    </ProtectedRoute>
  );
}
