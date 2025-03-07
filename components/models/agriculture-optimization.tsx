"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Cloud, Droplet, Sun, Wind, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function AgricultureOptimization() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const cropData = [
    {
      id: 1,
      name: "Wheat",
      area: "North Field",
      moisture: 42,
      status: "Optimal",
      lastIrrigation: "2 days ago",
      nextIrrigation: "Tomorrow"
    },
    {
      id: 2,
      name: "Corn",
      area: "East Field",
      moisture: 28,
      status: "Needs Water",
      lastIrrigation: "5 days ago",
      nextIrrigation: "Today"
    },
    {
      id: 3,
      name: "Soybeans",
      area: "South Field",
      moisture: 38,
      status: "Optimal",
      lastIrrigation: "3 days ago",
      nextIrrigation: "In 2 days"
    },
    {
      id: 4,
      name: "Rice",
      area: "West Paddy",
      moisture: 85,
      status: "Excess Water",
      lastIrrigation: "1 day ago",
      nextIrrigation: "In 5 days"
    }
  ];

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            Agriculture Water Optimization
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Optimize irrigation and water usage for agricultural operations
          </p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">
          <Droplet className="mr-2 h-4 w-4" /> Schedule Irrigation
        </Button>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-green-50 dark:bg-green-900/30 p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="fields" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800">
            Field Monitoring
          </TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800">
            Weather Forecast
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800">
            Water Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
                  </div>
                  <span className="font-medium">28°C</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Humidity</span>
                  </div>
                  <span className="font-medium">65%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</span>
                  </div>
                  <span className="font-medium">8 km/h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Precipitation</span>
                  </div>
                  <span className="font-medium">0 mm</span>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Soil Moisture (Average)</span>
                    <span className="font-medium">48%</span>
                  </div>
                  <Progress value={48} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Irrigation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex gap-2 text-yellow-700 dark:text-yellow-500">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Irrigation Needed</p>
                      <p className="mt-1">East Field (Corn) requires irrigation today</p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">Schedule Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex gap-2 text-red-700 dark:text-red-500">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Excess Water Alert</p>
                      <p className="mt-1">West Paddy (Rice) has excess water levels. Consider drainage.</p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">View Details</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Water Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Efficiency</span>
                  <span className="font-medium text-green-600 dark:text-green-400">78%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Target Efficiency</span>
                  <span className="font-medium">85%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Water Saved</span>
                  <span className="font-medium text-green-600 dark:text-green-400">12,450 L</span>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Target</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Crop Monitoring</CardTitle>
              <CardDescription>Current status of all crops and fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium">Crop</th>
                      <th className="text-left py-3 px-4 font-medium">Area</th>
                      <th className="text-left py-3 px-4 font-medium">Soil Moisture</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Last Irrigation</th>
                      <th className="text-left py-3 px-4 font-medium">Next Irrigation</th>
                      <th className="text-left py-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cropData.map((crop) => (
                      <tr key={crop.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">{crop.name}</td>
                        <td className="py-3 px-4">{crop.area}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={crop.moisture} className="h-2 w-24" />
                            <span>{crop.moisture}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            crop.status === "Optimal" 
                              ? "outline" 
                              : crop.status === "Needs Water"
                              ? "default"
                              : "destructive"
                          } className={
                            crop.status === "Optimal" 
                              ? "text-green-500 border-green-200 dark:border-green-800"
                              : crop.status === "Needs Water"
                              ? "bg-yellow-500"
                              : ""
                          }>
                            {crop.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{crop.lastIrrigation}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{crop.nextIrrigation}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fields" className="space-y-4">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Field Monitoring</CardTitle>
              <CardDescription>Detailed view of all agricultural fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-lg overflow-hidden bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Leaf className="h-12 w-12 mx-auto mb-2 text-green-400 opacity-50" />
                  <p>Interactive field map will be displayed here</p>
                  <p className="text-sm mt-2">Google Maps integration required for production use</p>
                </div>
                
                {/* Placeholder markers for fields */}
                <div className="absolute top-1/4 left-1/3 h-16 w-16 rounded-full bg-green-500/20 animate-pulse flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-green-500/40 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-green-500/60"></div>
                  </div>
                </div>
                
                <div className="absolute bottom-1/3 right-1/4 h-12 w-12 rounded-full bg-yellow-500/20 animate-pulse flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-yellow-500/40 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forecast" className="space-y-4">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>7-Day Weather Forecast</CardTitle>
              <CardDescription>AI-powered weather predictions for optimal irrigation planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, index) => (
                  <Card key={index} className="border border-green-100 dark:border-green-800">
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className="text-sm">{
                        index === 0 ? "Today" : 
                        index === 1 ? "Tomorrow" : 
                        `Day ${index + 1}`
                      }</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      {index === 0 ? (
                        <Sun className="h-8 w-8 mx-auto text-yellow-500" />
                      ) : index === 1 || index === 5 ? (
                        <Cloud className="h-8 w-8 mx-auto text-blue-500" />
                      ) : index === 2 ? (
                        <Droplet className="h-8 w-8 mx-auto text-blue-500" />
                      ) : (
                        <Sun className="h-8 w-8 mx-auto text-yellow-500" />
                      )}
                      <div className="mt-2 font-medium">
                        {index === 0 ? "28°C" : 
                         index === 1 ? "26°C" : 
                         index === 2 ? "24°C" : 
                         index === 3 ? "27°C" : 
                         index === 4 ? "29°C" : 
                         index === 5 ? "25°C" : "28°C"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {index === 0 ? "0% rain" : 
                         index === 1 ? "20% rain" : 
                         index === 2 ? "80% rain" : 
                         index === 3 ? "10% rain" : 
                         index === 4 ? "0% rain" : 
                         index === 5 ? "30% rain" : "5% rain"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  AI Irrigation Recommendation
                </h3>
                <p className="text-sm">Based on the forecast, we recommend skipping irrigation today and scheduling it for Day 3 after the expected rainfall to maximize water efficiency.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Water Usage Analytics</CardTitle>
              <CardDescription>Comprehensive analysis of your agricultural water consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-lg overflow-hidden bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart2 className="h-12 w-12 mx-auto mb-2 text-green-400 opacity-50" />
                  <p>Detailed water usage analytics will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}