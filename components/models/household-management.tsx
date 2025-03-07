"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, BarChart2, AlertTriangle, CheckCircle, Settings, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function HouseholdManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const usageData = [
    {
      id: 1,
      area: "Kitchen",
      dailyUsage: 85,
      monthlyUsage: 2550,
      limit: 3000,
      status: "Good"
    },
    {
      id: 2,
      area: "Bathroom",
      dailyUsage: 120,
      monthlyUsage: 3600,
      limit: 3500,
      status: "Warning"
    },
    {
      id: 3,
      area: "Garden",
      dailyUsage: 45,
      monthlyUsage: 1350,
      limit: 2000,
      status: "Good"
    },
    {
      id: 4,
      area: "Laundry",
      dailyUsage: 60,
      monthlyUsage: 1800,
      limit: 2000,
      status: "Good"
    }
  ];

  const savingTips = [
    {
      id: 1,
      title: "Install Low-Flow Showerheads",
      description: "Replace standard showerheads with low-flow alternatives to save up to 40% water.",
      savings: "Potential savings: 15,000 L/year",
      difficulty: "Easy"
    },
    {
      id: 2,
      title: "Fix Leaky Faucets",
      description: "A dripping faucet can waste up to 20 gallons per day. Repair leaks promptly.",
      savings: "Potential savings: 7,300 L/year",
      difficulty: "Easy"
    },
    {
      id: 3,
      title: "Install Dual-Flush Toilets",
      description: "Upgrade to dual-flush toilets to use less water for liquid waste.",
      savings: "Potential savings: 25,000 L/year",
      difficulty: "Medium"
    }
  ];

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-500" />
            Household Water Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor and optimize your household water usage with smart recommendations
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
          <Settings className="mr-2 h-4 w-4" /> Configure Sensors
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-blue-50 dark:bg-blue-900/30 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800">
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800">
            Usage Details
          </TabsTrigger>
          <TabsTrigger value="savings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800">
            Saving Tips
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white dark:data-[state=active]:bg-blue-800">
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Usage</span>
                  <span className="font-medium">9,300 L</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Limit</span>
                  <span className="font-medium">10,500 L</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</span>
                  <span className="font-medium">8</span>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Usage Progress</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    You're approaching your monthly limit
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Water Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex gap-2 text-green-700 dark:text-green-500">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Efficiency Score: 82/100</p>
                      <p className="mt-1">Your household is 15% more efficient than neighborhood average</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex gap-2 text-yellow-700 dark:text-yellow-500">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Bathroom Usage Alert</p>
                      <p className="mt-1">Bathroom water usage is 3% above your monthly average</p>
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
                <CardTitle className="text-lg">Potential Savings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Potential</span>
                  <span className="font-medium text-green-600 dark:text-green-400">1,250 L</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Yearly Potential</span>
                  <span className="font-medium text-green-600 dark:text-green-400">15,000 L</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Cost Savings</span>
                  <span className="font-medium text-green-600 dark:text-green-400">$175/year</span>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Detailed Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Usage by Area</CardTitle>
              <CardDescription>Water consumption breakdown by household area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium">Area</th>
                      <th className="text-left py-3 px-4 font-medium">Daily Usage</th>
                      <th className="text-left py-3 px-4 font-medium">Monthly Usage</th>
                      <th className="text-left py-3 px-4 font-medium">Monthly Limit</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageData.map((area) => (
                      <tr key={area.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">{area.area}</td>
                        <td className="py-3 px-4">{area.dailyUsage} L</td>
                        <td className="py-3 px-4">{area.monthlyUsage} L</td>
                        <td className="py-3 px-4">{area.limit} L</td>
                        <td className="py-3 px-4">
                          <Badge variant={area.status === "Good" ? "outline" : "default"} className={
                            area.status === "Good" 
                              ? "text-green-500 border-green-200 dark:border-green-800"
                              : "bg-yellow-500"
                          }>
                            {area.status}
                          </Badge>
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
        
        <TabsContent value="usage" className="space-y-4">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Detailed Usage Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown of your water consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart2 className="h-12 w-12 mx-auto mb-2 text-blue-400 opacity-50" />
                  <p>Detailed usage charts and analytics will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="savings" className="space-y-4">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Water Saving Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to reduce your water consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {savingTips.map((tip) => (
                  <Card key={tip.id} className="border border-blue-100 dark:border-blue-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{tip.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">{tip.description}</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">{tip.savings}</p>
                      <Badge variant="outline" className="mt-2">
                        {tip.difficulty} Implementation
                      </Badge>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
              <CardDescription>Track your water consumption over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Last 30 Days
                  </Button>
                  <Button variant="outline" size="sm">3 Months</Button>
                  <Button variant="outline" size="sm">6 Months</Button>
                  <Button variant="outline" size="sm">1 Year</Button>
                </div>
                <Button variant="outline" size="sm">Export Data</Button>
              </div>
              
              <div className="aspect-video relative rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart2 className="h-12 w-12 mx-auto mb-2 text-blue-400 opacity-50" />
                  <p>Historical usage data will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}