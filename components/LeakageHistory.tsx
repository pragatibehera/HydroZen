"use client";

import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface LeakageReport {
  id: string;
  created_at: string;
  image_url: string;
  status: string;
  points_awarded: number;
  verification_confidence: number;
  description: string | null;
  location: string | null;
}

export function LeakageHistory() {
  const [reports, setReports] = useState<LeakageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchReports() {
      if (!user) {
        console.log("No user found");
        return;
      }

      try {
        console.log("Fetching reports for user:", user.id);
        const { data, error } = await supabase
          .from("leakage_reports")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching leakage reports:", error);
          toast({
            title: "Error fetching reports",
            description:
              "Failed to load your leakage reports. Please try again.",
            variant: "destructive",
          });
          throw error;
        }

        console.log("Fetched reports:", data);
        setReports(data || []);
      } catch (error) {
        console.error("Error in fetchReports:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user || reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Your leak reporting history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <img
                src={report.image_url}
                alt="Leakage Report"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge
                    variant={
                      report.status === "verified" ? "default" : "secondary"
                    }
                    className={`mb-2 ${
                      report.status === "verified"
                        ? "bg-green-100 text-green-800"
                        : ""
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </Badge>
                  {report.points_awarded > 0 && (
                    <Badge variant="outline" className="ml-2">
                      +{report.points_awarded} points
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(report.created_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>

              {report.verification_confidence > 0 && (
                <p className="text-sm text-gray-600">
                  Verification Confidence:{" "}
                  {Math.round(report.verification_confidence * 100)}%
                </p>
              )}

              {report.description && (
                <p className="text-sm">{report.description}</p>
              )}

              {report.location && (
                <p className="text-sm text-gray-600">
                  Location: {report.location}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
