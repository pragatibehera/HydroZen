"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export function WaterTips() {
  const tips = [
    "Fix leaky faucets promptly - a dripping tap can waste up to 20 gallons per day.",
    "Install water-efficient showerheads to save up to 750 gallons per month.",
    "Water your garden during early morning or evening to reduce evaporation.",
    "Collect rainwater for watering plants and garden use."
  ];

  return (
    <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg">Water Saving Tips</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-blue-500 font-bold">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}