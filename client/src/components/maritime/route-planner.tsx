import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Route, 
  MapPin, 
  Clock, 
  Fuel, 
  Ship, 
  Plus, 
  Trash2, 
  Navigation, 
  Calculator,
  Download,
  Save,
  Eye
} from 'lucide-react';

interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: 'major' | 'regional' | 'bunker';
  services: string[];
}

interface Waypoint {
  id: string;
  port: Port;
  arrivalTime?: string;
  departureTime?: string;
  purpose: 'cargo' | 'bunker' | 'transit' | 'maintenance';
  notes?: string;
}

interface RouteData {
  id: string;
  name: string;
  waypoints: Waypoint[];
  totalDistance: number;
  estimatedDays: number;
  fuelConsumption: number;
  estimatedCost: number;
  weatherRisk: 'low' | 'medium' | 'high';
  created: Date;
  lastModified: Date;
}

interface VesselSpecs {
  name: string;
  type: 'container' | 'bulk' | 'tanker' | 'general';
  length: number;
  beam: number;
  draft: number;
  speed: number;
  fuelConsumption: number;
  cargoCapacity: number;
}

const WORLD_PORTS: Port[] = [
  { id: '1', name: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937, type: 'major', services: ['Container', 'Bulk', 'RoRo'] },
  { id: '2', name: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lng: 4.4777, type: 'major', services: ['Container', 'Oil', 'Chemical'] },
  { id: '3', name: 'Singapore', country: 'Singapore', lat: 1.2966, lng: 103.7764, type: 'major', services: ['Container', 'Bunker', 'Transshipment'] },
  { id: '4', name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, type: 'major', services: ['Container', 'Bulk', 'General'] },
  { id: '5', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, type: 'major', services: ['Container', 'General', 'Transshipment'] },
  { id: '6', name: 'Suez Canal', country: 'Egypt', lat: 30.5234, lng: 32.3426, type: 'bunker', services: ['Bunker', 'Transit', 'Pilotage'] },
  { id: '7', name: 'Gibraltar', country: 'Gibraltar', lat: 36.1408, lng: -5.3536, type: 'bunker', services: ['Bunker', 'Provisions'] },
  { id: '8', name: 'Mumbai', country: 'India', lat: 18.9480, lng: 72.9508, type: 'major', services: ['Container', 'Bulk', 'Oil'] }
];

const DEFAULT_VESSEL: VesselSpecs = {
  name: 'MV Example',
  type: 'container',
  length: 300,
  beam: 48,
  draft: 14.5,
  speed: 22,
  fuelConsumption: 180,
  cargoCapacity: 14000
};

export default function RoutePlanner() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [currentRoute, setCurrentRoute] = useState<RouteData | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [vesselSpecs, setVesselSpecs] = useState<VesselSpecs>(DEFAULT_VESSEL);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [waypointPurpose, setWaypointPurpose] = useState<'cargo' | 'bunker' | 'transit' | 'maintenance'>('cargo');
  const [routeName, setRouteName] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');

  // Simple toast function
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Add waypoint to current route
  const addWaypoint = () => {
    if (!selectedPort) {
      showToast('Please select a port', 'error');
      return;
    }

    const port = WORLD_PORTS.find(p => p.id === selectedPort);
    if (!port) return;

    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      port,
      purpose: waypointPurpose,
      notes: ''
    };

    setWaypoints([...waypoints, newWaypoint]);
    setSelectedPort('');
  };

  // Remove waypoint
  const removeWaypoint = (waypointId: string) => {
    setWaypoints(waypoints.filter(w => w.id !== waypointId));
  };

  // Calculate great circle distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate route metrics
  const calculateRoute = async () => {
    if (waypoints.length < 2) {
      showToast('Please add at least 2 waypoints', 'error');
      return;
    }

    setIsCalculating(true);

    try {
      let totalDistance = 0;
      
      // Calculate distance between consecutive waypoints
      for (let i = 0; i < waypoints.length - 1; i++) {
        const current = waypoints[i];
        const next = waypoints[i + 1];
        const distance = calculateDistance(
          current.port.lat, current.port.lng,
          next.port.lat, next.port.lng
        );
        totalDistance += distance;
      }

      // Calculate voyage metrics
      const estimatedDays = Math.ceil(totalDistance / (vesselSpecs.speed * 24));
      const fuelConsumption = Math.ceil((totalDistance / vesselSpecs.speed) * vesselSpecs.fuelConsumption);
      const estimatedCost = fuelConsumption * 650; // Approximate fuel cost per MT

      // Determine weather risk based on route
      const weatherRisk = totalDistance > 5000 ? 'high' : totalDistance > 2000 ? 'medium' : 'low';

      const newRoute: RouteData = {
        id: Date.now().toString(),
        name: routeName || `Route ${routes.length + 1}`,
        waypoints: [...waypoints],
        totalDistance: Math.round(totalDistance),
        estimatedDays,
        fuelConsumption,
        estimatedCost,
        weatherRisk,
        created: new Date(),
        lastModified: new Date()
      };

      setCurrentRoute(newRoute);
      showToast('Route calculated successfully', 'success');

    } catch (error) {
      showToast('Failed to calculate route', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  // Save route
  const saveRoute = () => {
    if (!currentRoute) {
      showToast('No route to save', 'error');
      return;
    }

    const existingIndex = routes.findIndex(r => r.id === currentRoute.id);
    if (existingIndex >= 0) {
      const updatedRoutes = [...routes];
      updatedRoutes[existingIndex] = { ...currentRoute, lastModified: new Date() };
      setRoutes(updatedRoutes);
    } else {
      setRoutes([...routes, currentRoute]);
    }

    showToast('Route saved successfully', 'success');
  };

  // Load route
  const loadRoute = (route: RouteData) => {
    setCurrentRoute(route);
    setWaypoints([...route.waypoints]);
    setRouteName(route.name);
    setActiveTab('planner');
  };

  // Export route
  const exportRoute = () => {
    if (!currentRoute) return;

    const exportData = {
      route: currentRoute,
      vessel: vesselSpecs,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRoute.name.replace(/\s+/g, '_')}_route.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Route className="h-8 w-8 text-blue-600" />
            Route Planner
          </h1>
          <p className="text-gray-600 mt-1">Plan and optimize maritime routes with detailed voyage calculations</p>
        </div>
        <div className="flex gap-2">
          {currentRoute && (
            <>
              <Button onClick={saveRoute} variant="outline" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Route
              </Button>
              <Button onClick={exportRoute} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planner">Route Planner</TabsTrigger>
          <TabsTrigger value="vessel">Vessel Specs</TabsTrigger>
          <TabsTrigger value="routes">Saved Routes</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Waypoints
                </CardTitle>
                <CardDescription>Add ports and waypoints to your route</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="Enter route name..."
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Select Port</Label>
                    <Select value={selectedPort} onValueChange={setSelectedPort}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a port..." />
                      </SelectTrigger>
                      <SelectContent>
                        {WORLD_PORTS.map(port => (
                          <SelectItem key={port.id} value={port.id}>
                            {port.name}, {port.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Label>Purpose</Label>
                    <Select value={waypointPurpose} onValueChange={(value: any) => setWaypointPurpose(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cargo">Cargo</SelectItem>
                        <SelectItem value="bunker">Bunker</SelectItem>
                        <SelectItem value="transit">Transit</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addWaypoint} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Waypoints List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {waypoints.map((waypoint, index) => (
                    <div key={waypoint.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{waypoint.port.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {waypoint.port.country}
                            <Badge variant="outline" className="text-xs">
                              {waypoint.purpose}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWaypoint(waypoint.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={calculateRoute} 
                  disabled={waypoints.length < 2 || isCalculating}
                  className="w-full flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  {isCalculating ? 'Calculating...' : 'Calculate Route'}
                </Button>
              </CardContent>
            </Card>

            {/* Route Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Route Analysis
                </CardTitle>
                <CardDescription>Voyage calculations and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {currentRoute ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{currentRoute.totalDistance}</div>
                        <div className="text-sm text-gray-600">Nautical Miles</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{currentRoute.estimatedDays}</div>
                        <div className="text-sm text-gray-600">Days</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{currentRoute.fuelConsumption}</div>
                        <div className="text-sm text-gray-600">MT Fuel</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">${currentRoute.estimatedCost.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Est. Cost</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Weather Risk:</span>
                        <Badge variant={currentRoute.weatherRisk === 'high' ? 'destructive' : 
                                      currentRoute.weatherRisk === 'medium' ? 'default' : 'secondary'}>
                          {currentRoute.weatherRisk.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Waypoints:</span>
                        <span className="text-sm">{currentRoute.waypoints.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Speed:</span>
                        <span className="text-sm">{vesselSpecs.speed} knots</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Route Summary:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {currentRoute.waypoints.map((waypoint, index) => (
                          <div key={waypoint.id} className="flex items-center gap-2">
                            <span className="w-4 text-center">{index + 1}.</span>
                            <span>{waypoint.port.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {waypoint.purpose}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add waypoints and calculate route to see analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vessel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Vessel Specifications
              </CardTitle>
              <CardDescription>Configure vessel parameters for accurate calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vesselName">Vessel Name</Label>
                  <Input
                    id="vesselName"
                    value={vesselSpecs.name}
                    onChange={(e) => setVesselSpecs({...vesselSpecs, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vesselType">Vessel Type</Label>
                  <Select value={vesselSpecs.type} onValueChange={(value: any) => setVesselSpecs({...vesselSpecs, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="container">Container Ship</SelectItem>
                      <SelectItem value="bulk">Bulk Carrier</SelectItem>
                      <SelectItem value="tanker">Tanker</SelectItem>
                      <SelectItem value="general">General Cargo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length (m)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={vesselSpecs.length}
                    onChange={(e) => setVesselSpecs({...vesselSpecs, length: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beam">Beam (m)</Label>
                  <Input
                    id="beam"
                    type="number"
                    value={vesselSpecs.beam}
                    onChange={(e) => setVesselSpecs({...vesselSpecs, beam: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draft">Draft (m)</Label>
                  <Input
                    id="draft"
                    type="number"
                    step="0.1"
                    value={vesselSpecs.draft}
                    onChange={(e) => setVesselSpecs({...vesselSpecs, draft: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speed">Service Speed (knots)</Label>
                  <Input
                    id="speed"
                    type="number"
                    value={vesselSpecs.speed}
                    onChange={(e) => setVesselSpecs({...vesselSpecs, speed: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelConsumption">Fuel Consumption (MT/day)</Label>
                  <Input
                    id="fuelConsumption"
                    type="number"
                    value={vesselSpecs.fuelConsumption}
                    onChange={(e) => setVesselSpecs({...vesselSpecs, fuelConsumption: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargoCapacity">Cargo Capacity (TEU/MT)</Label>
                  <Input
                    id="cargoCapacity"
                    type="number"
                    value={vesselSpecs.cargoCapacity}
                    onChange={(e) => setVesselSpecs({...vesselSpecs, cargoCapacity: Number(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Routes</CardTitle>
              <CardDescription>Manage your saved route plans</CardDescription>
            </CardHeader>
            <CardContent>
              {routes.length > 0 ? (
                <div className="space-y-4">
                  {routes.map(route => (
                    <div key={route.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{route.name}</h3>
                          <div className="text-sm text-gray-500 mt-1">
                            {route.waypoints.length} waypoints • {route.totalDistance} NM • {route.estimatedDays} days
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created: {route.created.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadRoute(route)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRoutes(routes.filter(r => r.id !== route.id))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved routes yet. Create and save your first route!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Route Analysis & Optimization
              </CardTitle>
              <CardDescription>Advanced route analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {currentRoute ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Efficiency Score</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((1000 / currentRoute.totalDistance) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">Based on distance optimization</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Fuel Efficiency</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {(currentRoute.fuelConsumption / currentRoute.totalDistance * 1000).toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">MT per 1000 NM</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Cost per NM</h4>
                      <div className="text-2xl font-bold text-purple-600">
                        ${(currentRoute.estimatedCost / currentRoute.totalDistance).toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-600">Fuel cost per nautical mile</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Recommendations</h4>
                    <div className="space-y-2">
                      {currentRoute.weatherRisk === 'high' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            ⚠️ High weather risk detected. Consider alternative routing or seasonal timing.
                          </p>
                        </div>
                      )}
                      {currentRoute.totalDistance > 8000 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            🛢️ Long voyage detected. Ensure adequate bunker planning and consider intermediate fuel stops.
                          </p>
                        </div>
                      )}
                      {currentRoute.waypoints.length > 5 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            📍 Multiple waypoints detected. Optimize port sequence to minimize backtracking.
                          </p>
                        </div>
                      )}
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✅ Route calculation complete. Consider weather routing and traffic separation schemes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Calculate a route to see detailed analysis and recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
