import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Sun, 
  Clock, 
  MapPin, 
  FileText, 
  Calculator,
  Compass,
  Anchor,
  Ship,
  TrendingUp,
  Calendar,
  Wind,
  Route
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function VoyageTools() {
  const { toast } = useToast();

  // State variables
  const [weatherLocation, setWeatherLocation] = useState("");
  const [weatherResult, setWeatherResult] = useState<any>(null);
  const [arrivalTime, setArrivalTime] = useState("");
  const [completionTime, setCompletionTime] = useState("");
  const [laytimeResult, setLaytimeResult] = useState<any>(null);
  const [fromPort, setFromPort] = useState("");
  const [toPort, setToPort] = useState("");
  const [distanceResult, setDistanceResult] = useState<any>(null);
  const [clauseText, setClauseText] = useState("");
  const [clauseResult, setClauseResult] = useState<any>(null);

  const calculateRoute = (source: any, destination: any) => {
    const newRoute = [
      [source.coordinates[1], source.coordinates[0]],
      [destination.coordinates[1], destination.coordinates[0]],
    ];
    setRoute(newRoute);

    const distance = getDistance(
      { latitude: source.coordinates[1], longitude: source.coordinates[0] },
      { latitude: destination.coordinates[1], longitude: destination.coordinates[0] }
    ) / 1000;

    const ship = ships[0];
    const estimatedTimeHours = distance / ship.averageSpeedKnots;
    const estimatedDays = Math.floor(estimatedTimeHours / 24);
    const estimatedHours = Math.round(estimatedTimeHours % 24);

    setVoyageDetails({
      shipName: ship.name,
      sourcePort: source.name,
      destinationPort: destination.name,
      distance: distance.toFixed(2),
      estimatedVoyageTime: `${estimatedDays} days ${estimatedHours} hours`,
      bunkersUsed: 'N/A',
    });
  };

  useEffect(() => {
    if (ports.length > 1) {
      setSelectedDestination(ports[1]);
      calculateRoute(ports[0], ports[1]);
    }
  }, [ports]);

  // Knowledge base query
  const { data: knowledgeEntries = [] } = useQuery({
    queryKey: ["/api/knowledge-base"],
    queryFn: async () => {
      const response = await fetch("/api/knowledge-base");
      if (!response.ok) throw new Error("Failed to fetch knowledge base");
      return response.json();
    },
  });

  // Handler functions
  const handleWeatherSearch = async () => {
    if (!weatherLocation.trim()) {
      toast({ title: "Error", description: "Please enter a location", variant: "destructive" });
      return;
    }
    
    try {
      const response = await fetch("/api/maritime/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: weatherLocation })
      });
      
      if (!response.ok) throw new Error("Weather request failed");
      const data = await response.json();
      setWeatherResult(data);
      toast({ title: "Success", description: "Weather data retrieved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to get weather data", variant: "destructive" });
    }
  };

  const handleLaytimeCalculation = async () => {
    if (!arrivalTime || !completionTime) {
      toast({ title: "Error", description: "Please enter both arrival and completion times", variant: "destructive" });
      return;
    }
    
    try {
      const response = await fetch("/api/maritime/laytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrivalTime, completionTime })
      });
      
      if (!response.ok) throw new Error("Laytime calculation failed");
      const data = await response.json();
      setLaytimeResult(data);
      toast({ title: "Success", description: "Laytime calculated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to calculate laytime", variant: "destructive" });
    }
  };

  const handleDistanceCalculation = async () => {
    if (!fromPort.trim() || !toPort.trim()) {
      toast({ title: "Error", description: "Please enter both ports", variant: "destructive" });
      return;
    }
    
    try {
      const response = await fetch("/api/maritime/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPort, toPort })
      });
      
      if (!response.ok) throw new Error("Distance calculation failed");
      const data = await response.json();
      setDistanceResult(data);
      toast({ title: "Success", description: "Distance calculated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to calculate distance", variant: "destructive" });
    }
  };

  const handleClauseAnalysis = async () => {
    if (!clauseText.trim()) {
      toast({ title: "Error", description: "Please enter clause text", variant: "destructive" });
      return;
    }
    
    try {
      const response = await fetch("/api/maritime/analyze-clause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clauseText })
      });
      
      if (!response.ok) throw new Error("Clause analysis failed");
      const data = await response.json();
      setClauseResult(data);
      toast({ title: "Success", description: "Clause analyzed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to analyze clause", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-maritime-blue rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Voyage Tools</h1>
              <p className="text-muted-foreground">Professional maritime calculation and analysis tools</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div style={{ width: '100%', height: '600px', marginBottom: '20px' }}>
          <MapContainer center={[0, 0] as L.LatLngExpression} zoom={2} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {selectedSource && (
              <Marker key={selectedSource.name} position={[selectedSource.coordinates[1], selectedSource.coordinates[0]] as L.LatLngExpression} icon={greenIcon}>
                <Popup>{selectedSource.name}</Popup>
              </Marker>
            )}
            {selectedDestination && (
              <Marker key={selectedDestination.name} position={[selectedDestination.coordinates[1], selectedDestination.coordinates[0]] as L.LatLngExpression} icon={redIcon}>
                <Popup>{selectedDestination.name}</Popup>
              </Marker>
            )}

            {bunkers.map(({ name, coordinates }) => (
              <Marker key={name} position={[coordinates[1], coordinates[0]] as L.LatLngExpression} icon={blueIcon}>
                <Popup>{name}</Popup>
              </Marker>
            ))}

            {route.length > 0 && (
              <Polyline
                positions={route as L.LatLngExpression[]}
                pathOptions={{ color: 'red' }}
              />
            )}
          </MapContainer>
        </div>

        {/* Voyage Details Table */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h2 className="text-2xl font-bold mb-4">Voyage Details</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>Ship Name</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Source Port</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Destination Port</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Distance (km)</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Estimated Voyage Time</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Bunkers Used</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {voyageDetails && (
                  <>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{voyageDetails.shipName}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{voyageDetails.sourcePort}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{voyageDetails.destinationPort}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{voyageDetails.distance}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{voyageDetails.estimatedVoyageTime}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{voyageDetails.bunkersUsed}</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weather Stations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wind className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">50+</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Port Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Anchor className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">1000+</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold">{knowledgeEntries?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calculator className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-2xl font-bold">24/7</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tools */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Route className="w-4 h-4" />
              <span>World Map</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center space-x-2">
              <Sun className="w-4 h-4" />
              <span>Weather</span>
            </TabsTrigger>
            <TabsTrigger value="laytime" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Laytime</span>
            </TabsTrigger>
            <TabsTrigger value="distance" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Distance</span>
            </TabsTrigger>
            <TabsTrigger value="clauses" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>CP Clauses</span>
            </TabsTrigger>
          </TabsList>

          {/* World Map Tab */}
          <TabsContent value="map">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Route className="w-5 h-5 text-blue-600" />
                    <span>Interactive Maritime World Map</span>
                  </CardTitle>
                  <CardDescription>
                    Plan routes, view ports and bunker stations with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      The enhanced world map with AI assistant is available as a separate component.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Features: Empty initial state, route-based port/bunker filtering, AI chatbot integration
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => window.open('/maritime-map', '_blank')} className="bg-blue-600 hover:bg-blue-700">
                        <Route className="w-4 h-4 mr-2" />
                        Open World Map
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weather Tool */}
          <TabsContent value="weather">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <span>Weather Conditions</span>
                  </CardTitle>
                  <CardDescription>
                    Get current weather conditions and maritime operational guidance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="weather-location">Location (Port or City)</Label>
                    <Input
                      id="weather-location"
                      placeholder="e.g., Hamburg, Rotterdam, Singapore"
                      value={weatherLocation}
                      onChange={(e) => setWeatherLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleWeatherSearch()}
                    />
                  </div>
                  <Button onClick={handleWeatherSearch} className="w-full">
                    <Wind className="w-4 h-4 mr-2" />
                    Get Weather Conditions
                  </Button>
                </CardContent>
              </Card>

              {weatherResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Weather Report - {weatherLocation}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Condition:</span>
                        <span>{weatherResult.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Temperature:</span>
                        <span>{weatherResult.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Wind Speed:</span>
                        <span>{weatherResult.windSpeed} knots</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Visibility:</span>
                        <span>{weatherResult.visibility} NM</span>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground font-medium">Maritime Operations:</p>
                        <p className="text-sm mt-1">{weatherResult.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Laytime Calculator */}
          <TabsContent value="laytime">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Laytime Calculator</span>
                  </CardTitle>
                  <CardDescription>
                    Calculate laytime for loading/discharge operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="arrival-time">Arrival Time (NOR Tendered)</Label>
                    <Input
                      id="arrival-time"
                      type="datetime-local"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="completion-time">Completion Time</Label>
                    <Input
                      id="completion-time"
                      type="datetime-local"
                      value={completionTime}
                      onChange={(e) => setCompletionTime(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleLaytimeCalculation} className="w-full">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Laytime
                  </Button>
                </CardContent>
              </Card>

              {laytimeResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Laytime Calculation Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Hours:</span>
                        <span className="text-lg font-bold text-blue-600">{laytimeResult.totalHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Days:</span>
                        <span className="text-lg font-bold text-blue-600">{laytimeResult.totalDays}</span>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground font-medium">Industry Notes:</p>
                        <ul className="text-sm mt-1 space-y-1 text-muted-foreground">
                          <li>• Excludes weather delays (WWD basis)</li>
                          <li>• Demurrage applies if exceeding CP terms</li>
                          <li>• Document all delays with proper notices</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Distance Calculator */}
          <TabsContent value="distance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <span>Distance Calculator</span>
                  </CardTitle>
                  <CardDescription>
                    Calculate distances between ports and estimate voyage time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="from-port">From Port</Label>
                    <Input
                      id="from-port"
                      placeholder="e.g., Singapore, Hamburg, Rotterdam"
                      value={fromPort}
                      onChange={(e) => setFromPort(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="to-port">To Port</Label>
                    <Input
                      id="to-port"
                      placeholder="e.g., Dubai, Shanghai, New York"
                      value={toPort}
                      onChange={(e) => setToPort(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleDistanceCalculation} className="w-full">
                    <Route className="w-4 h-4 mr-2" />
                    Calculate Distance
                  </Button>
                </CardContent>
              </Card>

              {distanceResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Distance Calculation: {distanceResult.fromPort} ↔ {distanceResult.toPort}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Distance:</span>
                        <span className="text-lg font-bold text-purple-600">{distanceResult.distanceNM} NM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Transit Time:</span>
                        <span>{distanceResult.estimatedDays} days (14 kts avg)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Fuel Consumption:</span>
                        <span>{distanceResult.fuelConsumption} MT</span>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground font-medium">Voyage Planning:</p>
                        <ul className="text-sm mt-1 space-y-1 text-muted-foreground">
                          <li>• Great circle distance calculation</li>
                          <li>• Add 10-15% for weather routing</li>
                          <li>• Consider seasonal patterns</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* CP Clauses */}
          <TabsContent value="clauses">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span>Charter Party Clause Analyzer</span>
                  </CardTitle>
                  <CardDescription>
                    Analyze and interpret maritime contract clauses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clause-text">Charter Party Clause</Label>
                    <textarea
                      id="clause-text"
                      className="w-full p-3 border border-border rounded-md resize-none min-h-[120px] bg-background text-foreground"
                      placeholder="Paste charter party clause text here..."
                      value={clauseText}
                      onChange={(e) => setClauseText(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleClauseAnalysis} className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze Clause
                  </Button>
                  {knowledgeEntries && knowledgeEntries.filter(entry => entry.category === 'cp_clause').length > 0 && (
                    <div className="text-sm text-muted-foreground p-3 bg-accent rounded-lg">
                      💡 Found {knowledgeEntries.filter(entry => entry.category === 'cp_clause').length} related clauses in your knowledge base
                    </div>
                  )}
                </CardContent>
              </Card>

              {clauseResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Clause Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Clause Type:</h4>
                        <p className="text-sm bg-muted p-2 rounded">{clauseResult.clauseType}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Interpretation:</h4>
                        <p className="text-sm text-muted-foreground">{clauseResult.interpretation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Key Implications:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {clauseResult.implications?.map((impl, idx) => (
                            <li key={idx}>• {impl}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Recommendations:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {clauseResult.recommendations?.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
