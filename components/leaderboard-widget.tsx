"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  user_name: string;
  water_saved: number;
  rank: number;
}

interface LeaderboardWidgetProps {
  data: LeaderboardEntry[];
}

export function LeaderboardWidget({ data }: LeaderboardWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Water Saving Leaders
        </CardTitle>
        <CardDescription>Top water conservers this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    entry.rank === 1
                      ? "bg-yellow-100 text-yellow-700"
                      : entry.rank === 2
                      ? "bg-gray-100 text-gray-700"
                      : entry.rank === 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-50 text-blue-700"
                  }
                `}
                >
                  {entry.rank}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {entry.user_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.water_saved.toFixed(1)}L saved
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
