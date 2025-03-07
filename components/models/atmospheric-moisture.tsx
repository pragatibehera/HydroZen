"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function AtmosphericMoisture() {
  const highMoistureAreas = [
    {
      id: 1,
      location: "Coastal Region, West",
      humidity: 87,
      potential: "High",
      status: "Active Monitoring"
    },
    {
      id: 2,
      location: "Mountain Valley, North",
      humidity: 92,
      potential: "Very High",
      status: "Installation Requested"
    },
    {
      id: 3,
      location: "Riverside District, South",
      humidity: 78,
      potential: "Medium",
      status: "Evaluation Needed"
    },
    {
      id: 4,
      location: "Lake Region, East",
      humidity: 85,
      potential: "High",
      status: "Pending Approval"
    }
  ];

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-500" />
            Atmospheric Moisture Harvesting
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Convert atmospheric moisture into clean water using advanced harvesting technology
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
          Request Installation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Moisture Map</CardTitle>
            <CardDescription>High moisture areas detected by IoT sensors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-400 opacity-50" />
                <p>Google Maps integration will display high-moisture areas here</p>
                <p className="text-sm mt-2">API key required for production use</p>
              </div>
              
              {/* Placeholder markers for high moisture areas */}
              <div className="absolute top-1/4 left-1/3 h-16 w-16 rounded-full bg-blue-500/20 animate-pulse flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-blue-500/40 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-blue-500/60"></div>
                </div>
              </div>
              
              <div className="absolute bottom-1/3 right-1/4 h-12 w-12 rounded-full bg-blue-600/20 animate-pulse flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-blue-600/40 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-blue-600/60"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Moisture Trends</CardTitle>
            <CardDescription>AI-powered predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Atmospheric Moisture</span>
                <span className="font-medium">76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Predicted Next Week</span>
                <span className="font-medium text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  82%
                </span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Water Conversion Potential</span>
                <span className="font-medium">High</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-2 text-yellow-700 dark:text-yellow-500">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Opportunity Alert</p>
                  <p className="mt-1">Coastal region showing 23% higher moisture levels than average. Ideal for new harvesting units.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>High Moisture Areas</CardTitle>
          <CardDescription>Locations with potential for moisture harvesting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Humidity</th>
                  <th className="text-left py-3 px-4 font-medium">Potential</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {highMoistureAreas.map((area) => (
                  <tr key={area.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">{area.location}</td>
                    <td className="py-3 px-4">{area.humidity}%</td>
                    <td className="py-3 px-4">
                      <Badge variant={area.potential === "Very High" ? "default" : "outline"} className={
                        area.potential === "Very High" 
                          ? "bg-blue-500" 
                          : area.potential === "High"
                          ? "text-blue-500 border-blue-200 dark:border-blue-800"
                          : "text-yellow-500 border-yellow-200 dark:border-yellow-800"
                      }>
                        {area.potential}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{area.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}