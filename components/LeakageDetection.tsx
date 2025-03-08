"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, History } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "@/components/ui/use-toast";

interface NodeData {
  Temperature: number;
  airflow: number;
  altitude: number;
  pressure: number;
  wind_speed: number;
  predicted_humidity: number;
}

interface LeakageAlert {
  id: string;
  timestamp: string;
  location: string;
  severity: "low" | "medium" | "high";
  status: "pending" | "resolved";
  difference: number;
}

export function LeakageDetection() {
  const [node1Data, setNode1Data] = useState<NodeData | null>(null);
  const [node2Data, setNode2Data] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentLeakages, setRecentLeakages] = useState<LeakageAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<LeakageAlert | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Set up Firebase listeners for both nodes
    const node1Ref = ref(
      database,
      "TransferredFeatures/-OKquAGqOgeRz1qYqMKY/features"
    );
    const node2Ref = ref(
      database,
      "TransferredFeatures/-OKquAGqOgeRz1qYqMKY/features2"
    );

    // Node 1 listener
    onValue(node1Ref, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNode1Data(data);
      }
    });

    // Node 2 listener
    onValue(node2Ref, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNode2Data(data);
      }
    });

    // Fetch recent leakages from Supabase
    const fetchRecentLeakages = async () => {
      const { data, error } = await supabase
        .from("leakage_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching leakages:", error);
        return;
      }

      if (data) {
        setRecentLeakages(data);
      }
    };

    fetchRecentLeakages();
    setLoading(false);

    return () => {
      // Cleanup Firebase listeners
      off(node1Ref);
      off(node2Ref);
    };
  }, []);

  // Compare node data and generate alerts
  useEffect(() => {
    if (node1Data && node2Data) {
      const humidityDiff = Math.abs(
        node1Data.predicted_humidity - node2Data.predicted_humidity
      );
      const pressureDiff = Math.abs(node1Data.pressure - node2Data.pressure);

      // Check for significant differences indicating leakage
      if (humidityDiff > 10 || pressureDiff > 5) {
        const severity =
          humidityDiff > 20 ? "high" : humidityDiff > 15 ? "medium" : "low";
        const newAlert: LeakageAlert = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          location: humidityDiff > pressureDiff ? "Location 1" : "Location 2",
          severity,
          status: "pending",
          difference: Math.max(humidityDiff, pressureDiff),
        };

        setCurrentAlert(newAlert);
      } else {
        setCurrentAlert(null);
      }
    }
  }, [node1Data, node2Data]);

  const sendAlertEmail = async () => {
    if (!currentAlert) return;

    try {
      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alert: currentAlert,
          node1Data,
          node2Data,
        }),
      });

      if (response.ok) {
        toast({
          title: "Alert Sent",
          description: "The maintenance team has been notified.",
        });

        // Store alert in Supabase
        const { error } = await supabase.from("leakage_reports").insert([
          {
            location: currentAlert.location,
            severity: currentAlert.severity,
            difference: currentAlert.difference,
            status: "pending",
          },
        ]);

        if (error) {
          console.error("Error storing alert:", error);
        }
      }
    } catch (error) {
      console.error("Error sending alert:", error);
      toast({
        title: "Error",
        description: "Failed to send alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Leakage Detection Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time monitoring of water leakage detection nodes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Node 1 Card */}
        <Card>
          <CardHeader>
            <CardTitle>Location 1</CardTitle>
            <CardDescription>Node 1 Sensor Readings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : node1Data ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span>{node1Data.predicted_humidity.toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Pressure:</span>
                  <span>{node1Data.pressure.toFixed(1)} hPa</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span>{node1Data.Temperature.toFixed(1)}°C</span>
                </div>
              </div>
            ) : (
              <div>No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Node 2 Card */}
        <Card>
          <CardHeader>
            <CardTitle>Location 2</CardTitle>
            <CardDescription>Node 2 Sensor Readings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : node2Data ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span>{node2Data.predicted_humidity.toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Pressure:</span>
                  <span>{node2Data.pressure.toFixed(1)} hPa</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span>{node2Data.Temperature.toFixed(1)}°C</span>
                </div>
              </div>
            ) : (
              <div>No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Alert Card */}
      {currentAlert && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgent Leakage Alert
            </CardTitle>
            <CardDescription>
              Significant difference detected between nodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Location: {currentAlert.location}
                  </p>
                  <p className="text-sm text-gray-500">
                    Difference: {currentAlert.difference.toFixed(1)} units
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    currentAlert.severity === "high"
                      ? "border-red-500 text-red-500"
                      : currentAlert.severity === "medium"
                      ? "border-yellow-500 text-yellow-500"
                      : "border-orange-500 text-orange-500"
                  }
                >
                  {currentAlert.severity.toUpperCase()} SEVERITY
                </Badge>
              </div>
              <Button
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={sendAlertEmail}
              >
                Send Alert to Maintenance Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Leakages Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Leakage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeakages.map((leakage) => (
              <div
                key={leakage.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{leakage.location}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(leakage.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    leakage.status === "resolved"
                      ? "border-green-500 text-green-500"
                      : "border-yellow-500 text-yellow-500"
                  }
                >
                  {leakage.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
