"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplet, History, Trophy } from "lucide-react";
import { LeakageVerification } from "@/components/LeakageVerification";
import { LeakageHistory } from "@/components/LeakageHistory";
import { UserRewards } from "@/components/UserRewards";

export function LeakageDetection() {
  const [activeTab, setActiveTab] = useState("report");

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Droplet className="h-6 w-6 text-blue-500" />
            Water Leakage Detection
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Report water leaks, track your contributions, and earn rewards
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="report" className="flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Report
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Report a Water Leak</CardTitle>
              <CardDescription>
                Upload photos of water leaks to help conserve water
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeakageVerification />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Reporting History</CardTitle>
              <CardDescription>
                View all your past leak reports and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeakageHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Rewards & Achievements</CardTitle>
              <CardDescription>
                Track your conservation efforts and earned achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRewards />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
