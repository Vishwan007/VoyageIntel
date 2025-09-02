import { Sun, Clock, MapPin, FileText, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function MaritimeTools() {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState("");
  const [layTimeData, setLayTimeData] = useState({ arrival: "", completion: "" });
  const [distanceData, setDistanceData] = useState({ from: "", to: "" });
  const [clauseText, setClauseText] = useState("");

  // Fetch knowledge base entries for context
  const { data: knowledgeEntries } = useQuery({
    queryKey: ["/api/knowledge-base"],
  });

  const handleToolClick = async (toolName: string) => {
    const toolMap = {
      'Weather': 'weather',
      'Laytime': 'laytime',
      'Distance': 'distance',
      'CP Clauses': 'cp-clauses'
    };
    
    const modalKey = toolMap[toolName];
    if (modalKey) {
      setActiveModal(modalKey);
    } else {
      toast({
        title: `${toolName} Tool`,
        description: `${toolName} calculator and analyzer coming soon! This will provide specialized maritime calculations and insights.`,
      });
    }
  };

  const handleWeatherSearch = async () => {
    if (!weatherLocation.trim()) {
      toast({ title: "Error", description: "Please enter a location.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`/api/maritime/weather?location=${encodeURIComponent(weatherLocation)}`);
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: `Weather - ${weatherLocation}`,
          description: `${data.condition}, ${data.temperature}°C, Wind: ${data.windSpeed} knots`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch weather data.", variant: "destructive" });
    }
  };

  const handleLaytimeCalculation = async () => {
    if (!layTimeData.arrival || !layTimeData.completion) {
      toast({ title: "Error", description: "Please enter both arrival and completion times.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api/maritime/laytime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrivalTime: layTimeData.arrival,
          completionTime: layTimeData.completion,
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Laytime Calculation",
          description: `Total: ${data.totalHours} hours (${data.totalDays} days)`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to calculate laytime.", variant: "destructive" });
    }
  };

  const handleDistanceCalculation = async () => {
    if (!distanceData.from.trim() || !distanceData.to.trim()) {
      toast({ title: "Error", description: "Please enter both ports.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api/maritime/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPort: distanceData.from,
          toPort: distanceData.to,
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Distance Calculation",
          description: `${data.distanceNM} NM, Est. ${data.estimatedDays} days`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to calculate distance.", variant: "destructive" });
    }
  };

  const handleClauseAnalysis = async () => {
    if (!clauseText.trim()) {
      toast({ title: "Error", description: "Please enter clause text.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api/maritime/cp-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Clause Analysis",
          description: `${data.clauseType}: ${data.interpretation.substring(0, 100)}...`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to analyze clause.", variant: "destructive" });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setWeatherLocation("");
    setLayTimeData({ arrival: "", completion: "" });
    setDistanceData({ from: "", to: "" });
    setClauseText("");
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Maritime Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          onClick={() => handleToolClick('Weather')}
          data-testid="tool-weather"
        >
          <Sun className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">Weather</div>
        </Button>
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          onClick={() => handleToolClick('Laytime')}
          data-testid="tool-laytime"
        >
          <Clock className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">Laytime</div>
        </Button>
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          onClick={() => handleToolClick('Distance')}
          data-testid="tool-distance"
        >
          <MapPin className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">Distance</div>
        </Button>
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          onClick={() => handleToolClick('CP Clauses')}
          data-testid="tool-cp-clauses"
        >
          <FileText className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">CP Clauses</div>
        </Button>
      </div>
      
      {/* Route Planner - Full width button */}
      <div className="mt-3">
        <Link href="/route-planner">
          <Button
            variant="outline"
            className="w-full p-3 h-auto flex items-center justify-center space-x-2 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
            data-testid="tool-route-planner"
          >
            <Route className="w-5 h-5 text-gray-600" />
            <div className="text-sm font-medium text-gray-900">Route Planner</div>
          </Button>
        </Link>
      </div>

      {/* Weather Modal */}
      <Dialog open={activeModal === 'weather'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weather Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="weather-location">Location</Label>
              <Input
                id="weather-location"
                placeholder="Enter port or city name"
                value={weatherLocation}
                onChange={(e) => setWeatherLocation(e.target.value)}
              />
            </div>
            <Button onClick={handleWeatherSearch} className="w-full">
              Get Weather
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Laytime Modal */}
      <Dialog open={activeModal === 'laytime'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Laytime Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="arrival-time">Arrival Time</Label>
              <Input
                id="arrival-time"
                type="datetime-local"
                value={layTimeData.arrival}
                onChange={(e) => setLayTimeData({ ...layTimeData, arrival: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="completion-time">Completion Time</Label>
              <Input
                id="completion-time"
                type="datetime-local"
                value={layTimeData.completion}
                onChange={(e) => setLayTimeData({ ...layTimeData, completion: e.target.value })}
              />
            </div>
            <Button onClick={handleLaytimeCalculation} className="w-full">
              Calculate Laytime
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Distance Modal */}
      <Dialog open={activeModal === 'distance'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distance Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="from-port">From Port</Label>
              <Input
                id="from-port"
                placeholder="Enter departure port"
                value={distanceData.from}
                onChange={(e) => setDistanceData({ ...distanceData, from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="to-port">To Port</Label>
              <Input
                id="to-port"
                placeholder="Enter destination port"
                value={distanceData.to}
                onChange={(e) => setDistanceData({ ...distanceData, to: e.target.value })}
              />
            </div>
            <Button onClick={handleDistanceCalculation} className="w-full">
              Calculate Distance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CP Clauses Modal */}
      <Dialog open={activeModal === 'cp-clauses'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Charter Party Clause Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clause-text">Clause Text</Label>
              <textarea
                id="clause-text"
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={4}
                placeholder="Paste charter party clause text here..."
                value={clauseText}
                onChange={(e) => setClauseText(e.target.value)}
              />
            </div>
            <Button onClick={handleClauseAnalysis} className="w-full">
              Analyze Clause
            </Button>
            {knowledgeEntries && knowledgeEntries.filter(entry => entry.category === 'cp_clause').length > 0 && (
              <div className="text-sm text-gray-600">
                <p>💡 Found {knowledgeEntries.filter(entry => entry.category === 'cp_clause').length} related clauses in your knowledge base</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
