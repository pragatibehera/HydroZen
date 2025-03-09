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

// Add interface for Firebase data structure
interface FirebaseEntry {
  features: {
    Temperature: number;
    airflow: number;
    altitude: number;
    pressure: number;
    wind_speed: number;
  };
  predicted_humidity: number;
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
  const [lastUpdate, setLastUpdate] = useState(Date.now());

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

  // Helper functions for potential and status
  const getPotential = (humidity: number) => {
    if (humidity > 65) return "Very High";
    if (humidity > 45) return "High";
    return "Low";
  };

  const getStatus = (humidity: number) => {
    return humidity > 65 ? "Active Monitoring" : "Monitoring";
  };

  // Separate useEffect for location tracking
  useEffect(() => {
    let locationWatcher: number;

    // Function to handle location updates
    const handleLocationUpdate = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      console.log("Location updated:", { latitude, longitude });

      setCurrentLocation({
        latitude,
        longitude,
        timestamp: Date.now(), // Use Date.now() instead of position.coords.timestamp
      });
      setLocationError(null);
    };

    // Function to handle location errors
    const handleLocationError = (error: GeolocationPositionError) => {
      console.error("Location error:", error.message);
      setLocationError(
        error.code === 1
          ? "Please enable location access in your browser settings."
          : "Unable to get your location. Please try again."
      );
    };

    // Get initial location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleLocationUpdate,
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Set up continuous location watching
      locationWatcher = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }

    // Cleanup
    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
    };
  }, []); // Empty dependency array since we want this to run once on mount

  // Firebase data listener
  useEffect(() => {
    const featuresRef = ref(database, "TransferredFeatures");
    let mounted = true;
    let lastProcessedData: string | null = null;

    const handleDataUpdate = (snapshot: any) => {
      if (!mounted) return;

      try {
        const data = snapshot.val() as Record<string, FirebaseEntry> | null;
        if (!data) {
          console.log("No data available in TransferredFeatures");
          return;
        }

        // Get all entries and sort by timestamp if available, otherwise take the latest key
        const entries = Object.entries(data);
        if (entries.length === 0) {
          console.log("No entries found in TransferredFeatures");
          return;
        }

        // Get the latest entry
        const [latestId, latestEntry] = entries[entries.length - 1] as [
          string,
          FirebaseEntry
        ];

        // Skip if we've already processed this exact data
        const dataString = JSON.stringify(latestEntry);
        if (dataString === lastProcessedData) {
          console.log("Skipping duplicate data update");
          return;
        }
        lastProcessedData = dataString;

        // Validate the data structure
        if (
          !latestEntry?.features ||
          latestEntry?.predicted_humidity === undefined
        ) {
          console.log("Invalid data structure in latest entry", latestId);
          return;
        }

        const { features, predicted_humidity } = latestEntry;

        console.log("New data received:", {
          id: latestId,
          features: features,
          predicted_humidity: predicted_humidity,
          timestamp: new Date().toISOString(),
        });

        // Update state with new values, using nullish coalescing for safer number conversion
        setWeatherParams({
          Temperature: Number(features.Temperature ?? 0),
          airflow: Number(features.airflow ?? 0),
          altitude: Number(features.altitude ?? 0),
          pressure: Number(features.pressure ?? 0),
          wind_speed: Number(features.wind_speed ?? 0),
          predicted_humidity: Number(predicted_humidity ?? 0),
        });

        // Force a UI refresh with the new timestamp
        setLastUpdate(Date.now());
        setLoading(false);

        // Update high moisture areas with the new humidity value
        const areas = [
          {
            id: 1,
            location: "Location 1",
            humidity: Math.max(0, Number(predicted_humidity ?? 0) - 15),
            potential: getPotential(Number(predicted_humidity ?? 0) - 15),
            status: getStatus(Number(predicted_humidity ?? 0) - 15),
            coordinates: { lat: 12.9716, lng: 77.5946 },
          },
          {
            id: 2,
            location: "Location 2",
            humidity: Math.max(0, Number(predicted_humidity ?? 0) - 20),
            potential: getPotential(Number(predicted_humidity ?? 0) - 20),
            status: getStatus(Number(predicted_humidity ?? 0) - 20),
            coordinates: { lat: 13.0827, lng: 77.5877 },
          },
        ];

        // Add current location if available
        if (currentLocation) {
          areas.push({
            id: 3,
            location: "Current Location",
            humidity: Number(predicted_humidity ?? 0),
            potential: getPotential(Number(predicted_humidity ?? 0)),
            status: getStatus(Number(predicted_humidity ?? 0)),
            coordinates: {
              lat: currentLocation.latitude,
              lng: currentLocation.longitude,
            },
          });
        }

        setHighMoistureAreas(areas);
      } catch (error) {
        console.error("Error processing Firebase update:", error);
      }
    };

    // Set up real-time listener with error handling
    try {
      const unsubscribe = onValue(featuresRef, handleDataUpdate, (error) => {
        console.error("Firebase listener error:", error);
        setLoading(false);
      });

      // Cleanup
      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
      setLoading(false);
    }
  }, [currentLocation]); // Keep currentLocation as dependency

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
            <CardDescription>
              Real-time atmospheric conditions
              <span className="text-xs text-gray-500 ml-2">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </span>
              {locationError && (
                <span className="text-xs text-red-500 block mt-1">
                  {locationError}
                </span>
              )}
              {currentLocation && (
                <span className="text-xs text-green-500 block mt-1">
                  Location: {currentLocation.latitude.toFixed(4)},{" "}
                  {currentLocation.longitude.toFixed(4)}
                </span>
              )}
            </CardDescription>
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
                  <span className="font-medium" key={`temp-${lastUpdate}`}>
                    {formatNumber(weatherParams.Temperature)}°C
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Predicted Humidity</span>
                  </div>
                  <span className="font-medium" key={`humidity-${lastUpdate}`}>
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
              {currentLocation && (
                <span className="text-green-500 text-xs block mt-1">
                  Current location detected
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
                        {/* Main location marker */}
                        <Marker
                          position={{
                            lat: currentLocation.latitude,
                            lng: currentLocation.longitude,
                          }}
                          icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                          }}
                          title={`Current Location (${formatNumber(
                            weatherParams.predicted_humidity
                          )}% Humidity)`}
                        />
                        {/* Pulsing circle effect */}
                        <Circle
                          center={{
                            lat: currentLocation.latitude,
                            lng: currentLocation.longitude,
                          }}
                          radius={100}
                          options={{
                            fillColor: "#2196F3",
                            fillOpacity: 0.4,
                            strokeColor: "#2196F3",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                          }}
                        />
                        {/* Larger monitoring radius */}
                        <Circle
                          center={{
                            lat: currentLocation.latitude,
                            lng: currentLocation.longitude,
                          }}
                          radius={1000}
                          options={{
                            fillColor: "#2196F3",
                            fillOpacity: 0.1,
                            strokeColor: "#2196F3",
                            strokeOpacity: 0.3,
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
                                path: 0, // 0 is equivalent to google.maps.SymbolPath.CIRCLE
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
