"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function LeaderboardWidget() {
  const leaderboardData = [
    {
      name: "Alex Johnson",
      points: 1250,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      rank: 1,
      badge: "Water Guardian"
    },
    {
      name: "Sarah Chen",
      points: 980,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      rank: 2,
      badge: "Leak Hunter"
    },
    {
      name: "Miguel Rodriguez",
      points: 845,
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
      rank: 3,
      badge: "Conservation Pro"
    },
    {
      name: "You",
      points: 320,
      avatar: "",
      rank: 12,
      badge: "Rising Star"
    }
  ];

  return (
    <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Conservation Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboardData.map((user, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-2 rounded-lg ${
                user.name === "You" 
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" 
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 text-center font-medium text-gray-500">
                  #{user.rank}
                </div>
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <Badge variant="outline" className="text-xs font-normal">
                    {user.badge}
                  </Badge>
                </div>
              </div>
              <div className="font-semibold">{user.points} pts</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}