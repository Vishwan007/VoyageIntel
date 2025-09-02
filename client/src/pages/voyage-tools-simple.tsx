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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Voyage Tools</h1>
          <p className="text-lg text-gray-600">Comprehensive maritime planning and analysis tools</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Voyages</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Anchor className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">12</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ports Monitored</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Compass className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">48</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weather Alerts</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-2xl font-bold">3</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Available</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
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
                      <Button onClick={() => window.location.href = '/maritime-map'} className="bg-blue-600 hover:bg-blue-700">
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
                    <Sun className="w-4 h-4 mr-2" />
                    Get Weather Data
                  </Button>
                </CardContent>
              </Card>

              {weatherResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Weather Report for {weatherLocation}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <span>{weatherResult.condition || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span>{weatherResult.temperature || 'N/A'}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind Speed:</span>
                      <span>{weatherResult.windSpeed || 'N/A'} knots</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visibility:</span>
                      <span>{weatherResult.visibility || 'N/A'} nm</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm">{weatherResult.recommendation || 'No specific recommendations'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Laytime Tool */}
          <TabsContent value="laytime">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Laytime Calculator</span>
                  </CardTitle>
                  <CardDescription>
                    Calculate laytime and demurrage for port operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="arrival-time">Arrival Time</Label>
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
                    <Clock className="w-4 h-4 mr-2" />
                    Calculate Laytime
                  </Button>
                </CardContent>
              </Card>

              {laytimeResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Laytime Calculation Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Hours:</span>
                      <span>{laytimeResult.totalHours || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Days:</span>
                      <span>{laytimeResult.totalDays || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Distance Tool */}
          <TabsContent value="distance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-green-500" />
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
                      placeholder="e.g., Hamburg"
                      value={fromPort}
                      onChange={(e) => setFromPort(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="to-port">To Port</Label>
                    <Input
                      id="to-port"
                      placeholder="e.g., Singapore"
                      value={toPort}
                      onChange={(e) => setToPort(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleDistanceCalculation} className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Calculate Distance
                  </Button>
                </CardContent>
              </Card>

              {distanceResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Distance: {distanceResult.fromPort || 'N/A'} to {distanceResult.toPort || 'N/A'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span>{distanceResult.distanceNM || 'N/A'} nautical miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Days:</span>
                      <span>{distanceResult.estimatedDays || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Consumption:</span>
                      <span>{distanceResult.fuelConsumption || 'N/A'} MT</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* CP Clauses Tool */}
          <TabsContent value="clauses">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <span>Charter Party Clause Analyzer</span>
                  </CardTitle>
                  <CardDescription>
                    Analyze charter party clauses with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clause-text">Clause Text</Label>
                    <textarea
                      id="clause-text"
                      className="w-full h-32 p-3 border rounded-md"
                      placeholder="Paste your charter party clause here..."
                      value={clauseText}
                      onChange={(e) => setClauseText(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleClauseAnalysis} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Analyze Clause
                  </Button>
                </CardContent>
              </Card>

              {clauseResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Clause Type:</h4>
                      <p className="text-sm text-gray-600">{clauseResult.clauseType || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Interpretation:</h4>
                      <p className="text-sm text-gray-600">{clauseResult.interpretation || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Key Implications:</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {clauseResult.implications?.map((impl: any, idx: number) => (
                          <li key={idx}>{impl}</li>
                        )) || <li>No implications available</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Recommendations:</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {clauseResult.recommendations?.map((rec: any, idx: number) => (
                          <li key={idx}>{rec}</li>
                        )) || <li>No recommendations available</li>}
                      </ul>
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
