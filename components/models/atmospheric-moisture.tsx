"use client";

import React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Thermometer,
  Wind,
  Gauge,
  ArrowUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { database } from "@/lib/firebase"; // Make sure to create this firebase config file
import { ref, onValue, off, get } from "firebase/database";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";

interface WeatherParams {
  Temperature: number;
  airflow: number;
  altitude: number;
  pressure: number;
  wind_speed: number;
  predicted_humidity: number;
}

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  isCurrentLocation?: boolean;
  humidity: number;
}

interface MapStyles {
  width: string;
  height: string;
}

const mapContainerStyle: MapStyles = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

// Add type declaration for window.google
declare global {
  interface Window {
    google: typeof google;
  }
}

export function AtmosphericMoisture() {
  const [weatherParams, setWeatherParams] = useState<WeatherParams>({
    Temperature: 0,
    airflow: 0,
    altitude: 0,
    pressure: 0,
    wind_speed: 0,
    predicted_humidity: 0,
  });

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Mock locations plus user's location will be shown on map
  const mockLocations: Location[] = [
    {
      id: 1,
      name: "Location 1",
      lat: 12.9716,
      lng: 77.5946,
      humidity: 0, // Will be updated with relative value
    },
    {
      id: 2,
      name: "Location 2",
      lat: 13.0827,
      lng: 77.5877,
      humidity: 0, // Will be updated with relative value
    },
  ];

  useEffect(() => {
    // Set up continuous location tracking
    let locationWatcher: number;

    if (navigator.geolocation) {
      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(
            "Unable to get your location. Please enable location services."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      // Set up continuous location watching
      locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error watching location:", error);
          setLocationError("Lost connection to location services.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    // Set up Firebase real-time listener for features and predicted humidity
    const featuresRef = ref(
      database,
      "TransferredFeatures/-OKquAGqOgeRz1qYqMKY/features"
    );
    const humidityRef = ref(
      database,
      "TransferredFeatures/-OKquAGqOgeRz1qYqMKY/predicted_humidity"
    );

    // Function to fetch and update data
    const fetchAndUpdateData = async () => {
      try {
        console.log("Fetching data from paths:", {
          features: featuresRef.toString(),
          humidity: humidityRef.toString(),
        });

        // Fetch both features and humidity
        const [featuresSnapshot, humiditySnapshot] = await Promise.all([
          get(featuresRef),
          get(humidityRef),
        ]);

        const featuresData = featuresSnapshot.val();
        const humidityValue = humiditySnapshot.val();

        console.log("Raw data from Firebase:", {
          features: featuresData,
          predicted_humidity: humidityValue,
        });

        if (!featuresData) {
          console.warn("No features data received from Firebase");
          return;
        }

        // Ensure we're accessing the correct properties
        const newWeatherParams = {
          Temperature: parseFloat(featuresData.Temperature) || 0,
          airflow: parseFloat(featuresData.airflow) || 0,
          altitude: parseFloat(featuresData.altitude) || 0,
          pressure: parseFloat(featuresData.pressure) || 0,
          wind_speed: parseFloat(featuresData.wind_speed) || 0,
          predicted_humidity: parseFloat(humidityValue) || 0,
        };

        console.log("Parsed weather parameters:", newWeatherParams);
        setWeatherParams(newWeatherParams);

        // Update high moisture areas based on real-time humidity
        const areas = [
          {
            id: 1,
            location: "Location 1",
            humidity: Math.max(0, newWeatherParams.predicted_humidity - 15),
            potential: getPotential(newWeatherParams.predicted_humidity - 15),
            status: getStatus(newWeatherParams.predicted_humidity - 15),
            coordinates: { lat: 12.9716, lng: 77.5946 },
          },
          {
            id: 2,
            location: "Location 2",
            humidity: Math.max(0, newWeatherParams.predicted_humidity - 20),
            potential: getPotential(newWeatherParams.predicted_humidity - 20),
            status: getStatus(newWeatherParams.predicted_humidity - 20),
            coordinates: { lat: 13.0827, lng: 77.5877 },
          },
          {
            id: 3,
            location: "Current Location",
            humidity: newWeatherParams.predicted_humidity,
            potential: getPotential(newWeatherParams.predicted_humidity),
            status: getStatus(newWeatherParams.predicted_humidity),
            coordinates: currentLocation
              ? {
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude,
                }
              : { lat: 0, lng: 0 },
          },
        ];
        setHighMoistureAreas(areas);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoading(false);
      }
    };

    // Helper functions for potential and status
    const getPotential = (humidity: number) => {
      if (humidity > 65) return "Very High";
      if (humidity > 45) return "High";
      return "Low";
    };

    const getStatus = (humidity: number) => {
      return humidity > 65 ? "Active Monitoring" : "Monitoring";
    };

    // Initial fetch
    fetchAndUpdateData();

    // Set up interval for periodic updates (every 5 seconds)
    const updateInterval = setInterval(fetchAndUpdateData, 5000);

    // Set up real-time listener for immediate updates
    onValue(featuresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        fetchAndUpdateData();
      }
    });

    onValue(humidityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        fetchAndUpdateData();
      }
    });

    // Cleanup function
    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
      clearInterval(updateInterval);
      off(featuresRef);
      off(humidityRef);
    };
  }, []);

  // State for high moisture areas
  const [highMoistureAreas, setHighMoistureAreas] = useState([
    {
      id: 1,
      location: "Current Location",
      humidity: 0,
      potential: "Low",
      status: "Monitoring",
    },
  ]);

  // Function to safely format numbers
  const formatNumber = (value: number, decimals: number = 1) => {
    return value?.toFixed(decimals) || "0";
  };

  // Update the optimal conditions message based on current values
  const getOptimalConditionsMessage = () => {
    const { predicted_humidity, Temperature, wind_speed } = weatherParams;
    if (predicted_humidity > 65 && Temperature > 20 && wind_speed < 15) {
      return "Current weather conditions are optimal for moisture harvesting.";
    } else if (predicted_humidity > 45) {
      return "Conditions are favorable for moisture harvesting.";
    }
    return "Monitoring conditions for optimal harvesting time.";
  };

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-500" />
            Atmospheric Moisture Harvesting
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor and harvest atmospheric moisture using IoT sensors and
            advanced technology
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
          Request Installation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Parameters Card */}
        <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Weather Parameters</CardTitle>
            <CardDescription>Real-time atmospheric conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center text-gray-500">
                  Loading weather data...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="font-medium">
                    {formatNumber(weatherParams.Temperature)}°C
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Predicted Humidity</span>
                  </div>
                  <span className="font-medium">
                    {formatNumber(weatherParams.predicted_humidity)}%
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Wind Speed</span>
                  </div>
                  <span className="font-medium">
                    {formatNumber(weatherParams.wind_speed)} km/h
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Altitude</span>
                  </div>
                  <span className="font-medium">
                    {formatNumber(weatherParams.altitude, 0)} m
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Pressure</span>
                  </div>
                  <span className="font-medium">
                    {formatNumber(weatherParams.pressure)} hPa
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm">Airflow</span>
                  </div>
                  <span className="font-medium">
                    {formatNumber(weatherParams.airflow)}%
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2 text-blue-700 dark:text-blue-500">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{getOptimalConditionsMessage()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="md:col-span-2 border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Moisture Map</CardTitle>
            <CardDescription>
              Active monitoring positions
              {locationError && (
                <span className="text-red-500 text-xs block mt-1">
                  {locationError}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                <LoadScript
                  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  loadingElement={
                    <div className="h-full w-full flex items-center justify-center">
                      <p>Loading Maps...</p>
                    </div>
                  }
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={
                      currentLocation
                        ? {
                            lat: currentLocation.latitude,
                            lng: currentLocation.longitude,
                          }
                        : defaultCenter
                    }
                    zoom={12}
                    options={{
                      styles: [
                        {
                          featureType: "water",
                          elementType: "geometry",
                          stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
                        },
                        {
                          featureType: "landscape",
                          elementType: "geometry",
                          stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
                        },
                      ],
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    {/* Current Location Marker */}
                    {currentLocation && window.google && (
                      <>
                        <Marker
                          position={{
                            lat: currentLocation.latitude,
                            lng: currentLocation.longitude,
                          }}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: "#2196F3",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                            scale: 8,
                          }}
                          title={`Current Location (${formatNumber(
                            weatherParams.predicted_humidity
                          )}% Humidity)`}
                        />
                        <Circle
                          center={{
                            lat: currentLocation.latitude,
                            lng: currentLocation.longitude,
                          }}
                          radius={1000}
                          options={{
                            fillColor: "#2196F3",
                            fillOpacity: 0.2,
                            strokeColor: "#2196F3",
                            strokeOpacity: 0.5,
                            strokeWeight: 1,
                          }}
                        />
                      </>
                    )}

                    {/* Mock Location Markers */}
                    {mockLocations.map(
                      (location) =>
                        window.google && (
                          <React.Fragment key={location.id}>
                            <Marker
                              position={{
                                lat: location.lat,
                                lng: location.lng,
                              }}
                              icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                fillColor: "#FFC107",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: 2,
                                scale: 8,
                              }}
                              title={`${location.name} (${formatNumber(
                                Math.max(
                                  0,
                                  weatherParams.predicted_humidity -
                                    (location.id === 1 ? 15 : 20)
                                )
                              )}% Humidity)`}
                            />
                            <Circle
                              center={{ lat: location.lat, lng: location.lng }}
                              radius={1000}
                              options={{
                                fillColor: "#FFC107",
                                fillOpacity: 0.2,
                                strokeColor: "#FFC107",
                                strokeOpacity: 0.5,
                                strokeWeight: 1,
                              }}
                            />
                          </React.Fragment>
                        )
                    )}
                  </GoogleMap>
                </LoadScript>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    Google Maps API key not found. Please check your environment
                    variables.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Moisture Areas Table */}
      <Card className="border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Moisture Status</CardTitle>
          <CardDescription>
            Current location moisture harvesting potential
          </CardDescription>
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
                  <tr
                    key={area.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">{area.location}</td>
                    <td className="py-3 px-4">{area.humidity.toFixed(1)}%</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          area.potential === "Very High" ? "default" : "outline"
                        }
                        className={
                          area.potential === "Very High"
                            ? "bg-blue-500"
                            : area.potential === "High"
                            ? "text-blue-500 border-blue-200 dark:border-blue-800"
                            : "text-yellow-500 border-yellow-200 dark:border-yellow-800"
                        }
                      >
                        {area.potential}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{area.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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
