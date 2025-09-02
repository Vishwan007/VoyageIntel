import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, Ship, Anchor, MessageCircle, Send, Settings, MapPin, Route, 
  Fuel, MessageSquare, Navigation, Plus, Trash2, Calculator, Clock, 
  Download, Save, Eye, Edit
} from 'lucide-react';
import { AIConfigPanel } from '../ai/ai-config-panel';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const portIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bunkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkY2NjAwIiBzdHJva2U9IiNGRjY2MDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: 'major' | 'regional' | 'bunker';
  services: string[];
  description?: string;
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
  weatherRisk: string;
  createdAt: string;
  bunkerStops: Port[];
}

interface VesselSpecs {
  name: string;
  type: string;
  length: number;
  beam: number;
  draft: number;
  dwt: number;
  speed: number;
  fuelConsumption: number;
  fuelCapacity: number;
  crewSize: number;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Mock port data with aliases for better matching
const mockPorts: Port[] = [
  { id: '1', name: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lng: 4.4777, type: 'major', services: ['Container', 'Bulk', 'Bunker'], description: 'Largest port in Europe' },
  { id: '2', name: 'Singapore', country: 'Singapore', lat: 1.2966, lng: 103.7764, type: 'major', services: ['Container', 'Bunker', 'Transshipment'], description: 'Major Asian hub port' },
  { id: '3', name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, type: 'major', services: ['Container', 'Bulk'], description: 'Worlds busiest container port' },
  { id: '4', name: 'Los Angeles', country: 'USA', lat: 33.7405, lng: -118.2668, type: 'major', services: ['Container', 'Bulk'], description: 'Major US West Coast port' },
  { id: '5', name: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937, type: 'major', services: ['Container', 'Bulk'], description: 'Gateway to Central Europe' },
  { id: '6', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, type: 'major', services: ['Container', 'Bunker'], description: 'Middle East hub' },
  { id: '7', name: 'Suez Canal', country: 'Egypt', lat: 30.5234, lng: 32.3426, type: 'bunker', services: ['Bunker', 'Transit'], description: 'Strategic bunker location' },
  { id: '8', name: 'Gibraltar', country: 'Gibraltar', lat: 36.1408, lng: -5.3536, type: 'bunker', services: ['Bunker'], description: 'Atlantic-Mediterranean bunker hub' },
  { id: '9', name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, type: 'major', services: ['Container', 'Transshipment'], description: 'Major Asian gateway' },
  { id: '10', name: 'New York', country: 'USA', lat: 40.6892, lng: -74.0445, type: 'major', services: ['Container', 'Bulk'], description: 'Major US East Coast port' },
];

// Port aliases for better matching
const portAliases: { [key: string]: string[] } = {
  'singapore': ['sing', 'spore'],
  'rotterdam': ['rtm', 'rdam'],
  'shanghai': ['sha', 'shgh'],
  'los angeles': ['la', 'long beach', 'lax'],
  'hamburg': ['ham', 'hhla'],
  'dubai': ['jebel ali', 'uae'],
  'suez canal': ['suez', 'canal'],
  'gibraltar': ['gib'],
  'hong kong': ['hkg', 'hk'],
  'new york': ['ny', 'nyc', 'new jersey', 'nj']
};

export default function EnhancedInteractiveMap() {
  const [ports] = useState<Port[]>(mockPorts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPorts, setSelectedPorts] = useState<Port[]>([]);
  const [currentRoute, setCurrentRoute] = useState<RouteData | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<RouteData[]>([]);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your maritime AI assistant. I can help you with port information, route planning, weather conditions, and maritime regulations. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [vesselSpecs, setVesselSpecs] = useState<VesselSpecs>({
    name: 'MV Example',
    type: 'Container Ship',
    length: 300,
    beam: 48,
    draft: 14.5,
    dwt: 150000,
    speed: 22,
    fuelConsumption: 250,
    fuelCapacity: 4000,
    crewSize: 25
  });

  const filteredPorts = ports.filter(port =>
    port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePortClick = (port: Port) => {
    if (isRoutePlannerOpen) {
      // Add port to route planning
      if (!selectedPorts.find(p => p.id === port.id)) {
        setSelectedPorts([...selectedPorts, port]);
      }
    }
  };

  const removeWaypoint = (portId: string) => {
    setSelectedPorts(selectedPorts.filter(p => p.id !== portId));
  };

  const calculateRoute = async () => {
    if (selectedPorts.length < 2) {
      alert('Please select at least 2 ports for route calculation');
      return;
    }

    try {
      const response = await fetch('/api/maritime/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePort: selectedPorts[0],
          destinationPort: selectedPorts[selectedPorts.length - 1],
          waypoints: selectedPorts.slice(1, -1),
          vesselSpecs
        })
      });

      if (response.ok) {
        const routeData = await response.json();
        
        const newRoute: RouteData = {
          id: Date.now().toString(),
          name: `${selectedPorts[0].name} to ${selectedPorts[selectedPorts.length - 1].name}`,
          waypoints: selectedPorts.map((port, index) => ({
            id: `wp-${index}`,
            port,
            purpose: index === 0 || index === selectedPorts.length - 1 ? 'cargo' : 'transit',
            notes: ''
          })),
          totalDistance: routeData.distance,
          estimatedDays: routeData.estimatedDays,
          fuelConsumption: routeData.fuelConsumption,
          estimatedCost: routeData.fuelConsumption * 600, // $600 per MT fuel
          weatherRisk: 'Moderate',
          createdAt: new Date().toISOString(),
          bunkerStops: routeData.bunkerStops || []
        };

        setCurrentRoute(newRoute);
        
        // Add AI message about the route
        const aiResponse = `Route calculated successfully! 
        📍 Distance: ${routeData.distance.toFixed(0)} nautical miles
        ⏱️ Estimated time: ${routeData.estimatedDays} days
        ⛽ Fuel consumption: ${routeData.fuelConsumption.toFixed(0)} MT
        💰 Estimated cost: $${(routeData.fuelConsumption * 600).toLocaleString()}
        ${routeData.bunkerStops.length > 0 ? `🛑 Bunker stops: ${routeData.bunkerStops.map((s: Port) => s.name).join(', ')}` : ''}`;
        
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
    }
  };

  const saveRoute = () => {
    if (currentRoute) {
      setSavedRoutes([...savedRoutes, currentRoute]);
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: `Route "${currentRoute.name}" has been saved successfully! You can access it from your saved routes.`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleAIMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    const messageToProcess = currentMessage;
    setCurrentMessage('');

    // Auto-fill route planning based on AI query (only for specific route planning requests)
    const message = messageToProcess.toLowerCase();
    const foundPorts: Port[] = [];
    
    // Check for explicit route planning requests
    const explicitRoutePlanningKeywords = ['plan route from', 'route from', 'calculate route', 'add to route'];
    const isExplicitRoutePlanning = explicitRoutePlanningKeywords.some(keyword => 
      message.includes(keyword)
    );

    // Check for route calculation requests
    const calculateKeywords = ['calculate route', 'compute route', 'show route', 'calculate distance'];
    if (calculateKeywords.some(keyword => message.includes(keyword)) && selectedPorts.length >= 2) {
      calculateRoute();
      return;
    }

    // Only auto-add ports for explicit route planning requests
    if (isExplicitRoutePlanning) {
      // Check for port names in the message
      ports.forEach(port => {
        const portName = port.name.toLowerCase();
        const portWords = portName.split(' ');
        const country = port.country.toLowerCase();
        
        // Check if port name, country, or any significant word from port name is mentioned
        if (message.includes(portName) || 
            message.includes(country) ||
            portWords.some(word => word.length > 2 && message.includes(word))) {
          foundPorts.push(port);
          return;
        }
        
        // Check aliases
        const aliases = portAliases[portName] || [];
        if (aliases.some(alias => message.includes(alias))) {
          foundPorts.push(port);
        }
      });

      // Auto-fill ports if found
      if (foundPorts.length >= 1) {
        if (!isRoutePlannerOpen) {
          setIsRoutePlannerOpen(true);
        }
        
        // Add unique ports to selection
        const newPorts = foundPorts.filter(port => 
          !selectedPorts.find(sp => sp.id === port.id)
        );
        
        if (newPorts.length > 0) {
          const updatedPorts = [...selectedPorts, ...newPorts].slice(0, 10);
          setSelectedPorts(updatedPorts);
          
          const aiResponse = foundPorts.length === 1 
            ? `I've added ${foundPorts[0].name} to your route. Add another port or ask me to calculate the route!`
            : `I've added ${foundPorts.map(p => p.name).join(', ')} to your route planning. Would you like me to calculate the route now?`;
            
          setAiMessages(prev => [...prev, {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
          }]);
          return;
        }
      }
    }

    // Show loading message first
    setAiMessages(prev => [...prev, {
      role: 'assistant',
      content: '🤖 Thinking...',
      timestamp: new Date().toISOString()
    }]);

    // Try to call backend AI service first
    try {
      console.log('Calling AI chat API with message:', messageToProcess);
      const response = await fetch('/api/maritime/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToProcess,
          context: {
            selectedPorts: selectedPorts.map(p => p.name),
            currentRoute: currentRoute ? {
              name: currentRoute.name,
              distance: currentRoute.totalDistance,
              estimatedDays: currentRoute.estimatedDays
            } : null,
            vesselSpecs,
            isRoutePlannerOpen
          }
        })
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        
        // Replace loading message with AI response
        setAiMessages(prev => [...prev.slice(0, -1), {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        }]);
        return;
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('AI service error details:', error);
    }

    // Fallback responses if AI service fails
    let aiResponse = '';
    
    if (message.includes('weather')) {
      aiResponse = '🌤️ **Weather Information**\n\nI can help you with maritime weather conditions. For specific weather data, please specify a location or route you\'re interested in.\n\n**Available Information:**\n• Current conditions and forecasts\n• Wind speed and direction\n• Wave height and sea state\n• Visibility conditions\n• Operational recommendations\n\n*Example: "What\'s the weather in Singapore?" or "Weather conditions for Rotterdam to Hamburg route"*';
    } else if (message.includes('fuel') || message.includes('bunker')) {
      aiResponse = '⛽ **Fuel Planning & Bunkering**\n\nI can assist with fuel consumption calculations and bunkering strategies.\n\n**Services Available:**\n• Fuel consumption estimates based on vessel specs\n• Optimal bunkering port recommendations\n• Cost optimization strategies\n• Bunker quality considerations\n• Regulatory compliance for fuel types\n\n*For detailed calculations, please provide your vessel specifications and route details.*';
    } else if (message.includes('regulation') || message.includes('compliance')) {
      aiResponse = '📋 **Maritime Regulations & Compliance**\n\nI can help with maritime regulatory requirements and compliance matters.\n\n**Key Areas:**\n• SOLAS (Safety of Life at Sea)\n• MARPOL (Marine Pollution Prevention)\n• MLC (Maritime Labour Convention)\n• Port State Control requirements\n• Flag State regulations\n• International conventions\n\n*What specific regulatory aspect can I help you with?*';
    } else if (message.includes('port') && !foundPorts.length) {
      aiResponse = '🏗️ **Port Information Services**\n\nI can provide comprehensive port information worldwide.\n\n**Available Data:**\n• Port facilities and services\n• Container/cargo handling capabilities\n• Pilotage and tugboat services\n• Port restrictions and regulations\n• Operational procedures\n• Contact information\n\n*Which specific port would you like to know about?*';
    } else if (selectedPorts.length > 0) {
      aiResponse = `🗺️ **Current Route Status**\n\nYou have ${selectedPorts.length} port(s) selected: **${selectedPorts.map(p => p.name).join(', ')}**\n\n**Available Actions:**\n• Calculate route distance and time\n• Add more ports to your route\n• Get specific port information\n• Optimize route for fuel efficiency\n• Check weather conditions along route\n\n*What would you like me to help you with next?*`;
    } else {
      aiResponse = '🚢 **Maritime AI Assistant**\n\nI\'m your professional maritime operations assistant. I can help with:\n\n• **Route Planning** - Optimize voyages and calculate distances\n• **Port Information** - Facilities, services, and operational details\n• **Weather Conditions** - Current and forecast maritime weather\n• **Fuel Planning** - Consumption calculations and bunkering strategies\n• **Regulatory Compliance** - Maritime laws and requirements\n• **Voyage Optimization** - Cost and time efficiency recommendations\n\n*How can I assist you with your maritime operations today?*';
    }

    // Replace loading message with fallback response
    setAiMessages(prev => [...prev.slice(0, -1), {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    }]);
  };

  const exportRoute = () => {
    if (!currentRoute) return;

    const routeData = {
      ...currentRoute,
      waypoints: currentRoute.waypoints.map(wp => ({
        name: wp.port.name,
        country: wp.port.country,
        lat: wp.port.lat,
        lng: wp.port.lng,
        purpose: wp.purpose,
        notes: wp.notes
      }))
    };

    const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRoute.name.replace(/\s+/g, '_')}_route.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert waypoints to coordinate pairs for Polyline
  const routeCoordinates: [number, number][] = currentRoute 
    ? currentRoute.waypoints.map(wp => [wp.port.lat, wp.port.lng])
    : [];

  return (
    <div className="h-screen flex">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Port Markers */}
          {filteredPorts.map((port) => (
            <Marker
              key={port.id}
              position={[port.lat, port.lng]}
              icon={port.type === 'bunker' ? bunkerIcon : portIcon}
              eventHandlers={{
                click: () => handlePortClick(port)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{port.name}</h3>
                  <p className="text-sm text-gray-600">{port.country}</p>
                  <p className="text-xs">{port.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {port.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  {isRoutePlannerOpen && (
                    <Button 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => handlePortClick(port)}
                    >
                      Add to Route
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route Polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              color="blue"
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-4 left-4" style={{ zIndex: 1000 }}>
          <Card className="w-80 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Route Planner</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRoutePlannerOpen(!isRoutePlannerOpen)}
                    className={isRoutePlannerOpen ? 'bg-blue-100 border-blue-300' : ''}
                  >
                    <Route className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIConfig(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search ports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Route Planner Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Route Planning</span>
                <Badge variant={isRoutePlannerOpen ? "default" : "outline"}>
                  {isRoutePlannerOpen ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Route Planner */}
              {isRoutePlannerOpen && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Click ports on the map to add them to your route
                  </div>
                  
                  {selectedPorts.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Ports:</Label>
                      {selectedPorts.map((port, index) => (
                        <div key={port.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <span className="text-sm">{port.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWaypoint(port.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={calculateRoute}
                      disabled={selectedPorts.length < 2}
                      className="flex-1"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate
                    </Button>
                    {currentRoute && (
                      <>
                        <Button variant="outline" onClick={saveRoute}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" onClick={exportRoute}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {currentRoute && (
                    <div className="bg-blue-50 p-3 rounded space-y-1">
                      <div className="font-semibold text-sm">{currentRoute.name}</div>
                      <div className="text-xs text-gray-600">
                        Distance: {currentRoute.totalDistance.toFixed(0)} NM
                      </div>
                      <div className="text-xs text-gray-600">
                        Time: {currentRoute.estimatedDays} days
                      </div>
                      <div className="text-xs text-gray-600">
                        Fuel: {currentRoute.fuelConsumption.toFixed(0)} MT
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col" style={{ zIndex: 900 }}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Maritime AI Assistant</h2>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {aiMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about ports, routes, weather..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIMessage()}
              className="flex-1"
            />
            <Button onClick={handleAIMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Config Panel */}
      <AIConfigPanel
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
      />
    </div>
  );
}
