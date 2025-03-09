"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sun,
  Cloud,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  Leaf,
} from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";

interface SoilParameters {
  soilType: string;
  nitrogen: number;
  phosphorus: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

interface WeatherForecast {
  condition: "Sunny" | "Cloudy" | "Rainy";
  temperature: number;
  humidity: number;
  pressure: number;
  description: string;
}

interface FarmingAdvice {
  type: "info" | "warning" | "alert";
  message: string;
  action: string;
}

export function AgricultureOptimization() {
  const [soilParams, setSoilParams] = useState<SoilParameters>({
    soilType: "Clay Loam",
    nitrogen: 45,
    phosphorus: 35,
    temperature: 28,
    humidity: 65,
    pressure: 1013,
  });

  const [forecast, setForecast] = useState<WeatherForecast>({
    condition: "Sunny",
    temperature: 28,
    humidity: 65,
    pressure: 1013,
    description: "Clear sky with moderate humidity",
  });

  const [farmingAdvice, setFarmingAdvice] = useState<FarmingAdvice[]>([]);

  // Function to determine soil quality
  const getSoilQuality = (nitrogen: number, phosphorus: number): string => {
    const average = (nitrogen + phosphorus) / 2;
    if (average > 60) return "Excellent";
    if (average > 40) return "Good";
    if (average > 20) return "Fair";
    return "Poor";
  };

  // Function to get weather icon
  const getWeatherIcon = (condition: WeatherForecast["condition"]) => {
    switch (condition) {
      case "Sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case "Cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case "Rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
    }
  };

  // Function to generate farming advice based on weather and soil conditions
  const generateAdvice = (
    forecast: WeatherForecast,
    soilParams: SoilParameters
  ): FarmingAdvice[] => {
    const advice: FarmingAdvice[] = [];

    // Temperature-based advice
    if (forecast.temperature > 35) {
      advice.push({
        type: "warning",
        message: "High temperature alert",
        action:
          "Consider providing shade to sensitive crops and increase irrigation",
      });
    }

    // Humidity-based advice
    if (forecast.humidity > 80) {
      advice.push({
        type: "alert",
        message: "High humidity conditions",
        action: "Monitor for fungal diseases and ensure proper ventilation",
      });
    }

    // Soil nutrient-based advice
    if (soilParams.nitrogen < 30) {
      advice.push({
        type: "warning",
        message: "Low nitrogen levels detected",
        action: "Consider applying nitrogen-rich fertilizer",
      });
    }

    // Weather condition specific advice
    switch (forecast.condition) {
      case "Rainy":
        advice.push({
          type: "info",
          message: "Rain expected",
          action: "Hold off on irrigation and protect sensitive crops",
        });
        break;
      case "Sunny":
        if (forecast.temperature > 30) {
          advice.push({
            type: "info",
            message: "Strong sunlight expected",
            action: "Ensure adequate irrigation and consider mulching",
          });
        }
        break;
    }

    return advice;
  };

  // Mock data generation
  useEffect(() => {
    const interval = setInterval(() => {
      // Update soil parameters with slight variations
      setSoilParams((prev) => ({
        ...prev,
        temperature: Math.max(
          20,
          Math.min(40, prev.temperature + (Math.random() * 2 - 1))
        ),
        humidity: Math.max(
          30,
          Math.min(90, prev.humidity + (Math.random() * 4 - 2))
        ),
        pressure: Math.max(
          990,
          Math.min(1030, prev.pressure + (Math.random() * 4 - 2))
        ),
        nitrogen: Math.max(
          0,
          Math.min(100, prev.nitrogen + (Math.random() * 2 - 1))
        ),
        phosphorus: Math.max(
          0,
          Math.min(100, prev.phosphorus + (Math.random() * 2 - 1))
        ),
      }));

      // Update weather forecast
      const conditions: WeatherForecast["condition"][] = [
        "Sunny",
        "Cloudy",
        "Rainy",
      ];
      const randomCondition =
        conditions[Math.floor(Math.random() * conditions.length)];

      setForecast((prev) => ({
        ...prev,
        condition: randomCondition,
        temperature: Math.max(
          20,
          Math.min(40, prev.temperature + (Math.random() * 2 - 1))
        ),
        humidity: Math.max(
          30,
          Math.min(90, prev.humidity + (Math.random() * 4 - 2))
        ),
        pressure: Math.max(
          990,
          Math.min(1030, prev.pressure + (Math.random() * 4 - 2))
        ),
        description: getWeatherDescription(randomCondition),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Generate advice when parameters change
  useEffect(() => {
    const newAdvice = generateAdvice(forecast, soilParams);
    setFarmingAdvice(newAdvice);
  }, [forecast, soilParams]);

  // Helper function to get weather description
  const getWeatherDescription = (
    condition: WeatherForecast["condition"]
  ): string => {
    switch (condition) {
      case "Sunny":
        return "Clear sky with good visibility";
      case "Cloudy":
        return "Overcast conditions expected";
      case "Rainy":
        return "Precipitation expected";
    }
  };

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            Agricultural Optimization System
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time monitoring and smart farming recommendations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soil Parameters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Soil Parameters</CardTitle>
            <CardDescription>
              Current soil conditions and nutrients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Soil Type</p>
                <p className="text-xl font-bold">{soilParams.soilType}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Soil Quality</p>
                <p className="text-xl font-bold">
                  {getSoilQuality(soilParams.nitrogen, soilParams.phosphorus)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Nitrogen Level</span>
                  <span className="font-medium">
                    {soilParams.nitrogen.toFixed(1)}%
                  </span>
                </div>
                <Progress value={soilParams.nitrogen} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    Phosphorus Level
                  </span>
                  <span className="font-medium">
                    {soilParams.phosphorus.toFixed(1)}%
                  </span>
                </div>
                <Progress value={soilParams.phosphorus} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Temperature</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  {soilParams.temperature.toFixed(1)}°C
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Humidity</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  {soilParams.humidity.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Pressure</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <Wind className="h-4 w-4" />
                  {soilParams.pressure.toFixed(1)} hPa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Forecast Card */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Forecast</CardTitle>
            <CardDescription>Current and expected conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getWeatherIcon(forecast.condition)}
                <div>
                  <h3 className="text-lg font-bold">{forecast.condition}</h3>
                  <p className="text-sm text-gray-500">
                    {forecast.description}
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {forecast.temperature.toFixed(1)}°C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Humidity</p>
                <p className="text-lg font-bold">
                  {forecast.humidity.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500">Pressure</p>
                <p className="text-lg font-bold">
                  {forecast.pressure.toFixed(1)} hPa
                </p>
              </div>
            </div>

            {/* Farming Advice Section */}
            <div className="space-y-3">
              <h3 className="font-medium">Farming Recommendations</h3>
              {farmingAdvice.map((advice, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex items-start gap-2 ${
                    advice.type === "warning"
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20"
                      : advice.type === "alert"
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-900/20"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{advice.message}</p>
                    <p className="text-sm mt-1">{advice.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
