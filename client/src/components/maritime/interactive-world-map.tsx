import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Ship, Anchor, MessageCircle, Send, Settings, MapPin, Route, Fuel, MessageSquare, Navigation, Plus, Trash2, Calculator, Clock, Download, Save } from 'lucide-react';
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

interface RouteCalculation {
  waypoints: [number, number][];
  distance: number;
  estimatedDays: number;
  fuelConsumption: number;
  bunkerStops: Port[];
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Major world ports database
const WORLD_PORTS: Port[] = [
  {
    id: 'hamburg',
    name: 'Hamburg',
    country: 'Germany',
    lat: 53.5511,
    lng: 9.9937,
    type: 'major',
    services: ['Container', 'Bulk', 'RoRo', 'Cruise'],
    description: 'Third largest port in Europe, major gateway to Central and Eastern Europe'
  },
  {
    id: 'rotterdam',
    name: 'Rotterdam',
    country: 'Netherlands',
    lat: 51.9244,
    lng: 4.4777,
    type: 'major',
    services: ['Container', 'Bulk', 'Oil', 'Chemical'],
    description: 'Largest port in Europe, major petrochemical hub'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    type: 'major',
    services: ['Container', 'Bunker', 'Transshipment', 'Repair'],
    description: 'Worlds busiest transshipment hub and bunkering port'
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    country: 'China',
    lat: 31.2304,
    lng: 121.4737,
    type: 'major',
    services: ['Container', 'Bulk', 'Manufacturing'],
    description: 'Worlds busiest container port by volume'
  },
  {
    id: 'dubai',
    name: 'Dubai (Jebel Ali)',
    country: 'UAE',
    lat: 25.0657,
    lng: 55.1713,
    type: 'major',
    services: ['Container', 'Transshipment', 'Free Zone'],
    description: 'Largest port in the Middle East, major transshipment hub'
  },
  {
    id: 'suez',
    name: 'Suez Canal',
    country: 'Egypt',
    lat: 30.0444,
    lng: 32.2357,
    type: 'bunker',
    services: ['Bunker', 'Transit', 'Supplies'],
    description: 'Critical maritime chokepoint connecting Europe and Asia'
  },
  {
    id: 'gibraltar',
    name: 'Gibraltar',
    country: 'Gibraltar',
    lat: 36.1408,
    lng: -5.3536,
    type: 'bunker',
    services: ['Bunker', 'Supplies', 'Repair'],
    description: 'Strategic bunkering location at entrance to Mediterranean'
  },
  {
    id: 'mumbai',
    name: 'Mumbai (JNPT)',
    country: 'India',
    lat: 18.9480,
    lng: 72.9508,
    type: 'major',
    services: ['Container', 'Bulk', 'Oil'],
    description: 'Largest container port in India'
  }
];

export default function InteractiveWorldMap() {
  // Simple toast function for notifications
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can replace this with your preferred toast implementation
  };
  const [selectedSource, setSelectedSource] = useState<Port | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Port | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [visiblePorts, setVisiblePorts] = useState<Port[]>([]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your maritime AI assistant. I can help you with port information, route planning, weather conditions, and maritime regulations. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter ports based on search
  const filteredPorts = WORLD_PORTS.filter(port => 
    port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    port.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate route between two ports
  const calculateRoute = async (source: Port, destination: Port) => {
    try {
      const response = await fetch('/api/maritime/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePort: { name: source.name, lat: source.lat, lng: source.lng },
          destinationPort: { name: destination.name, lat: destination.lat, lng: destination.lng }
        })
      });

      if (!response.ok) throw new Error('Route calculation failed');
      
      const routeData = await response.json();
      
      // Create waypoints for the route
      const waypoints: [number, number][] = [
        [source.lat, source.lng],
        ...routeData.bunkerStops.map((stop: any) => [stop.lat, stop.lng] as [number, number]),
        [destination.lat, destination.lng]
      ];

      const newRoute: RouteData = {
        waypoints,
        distance: routeData.distance,
        estimatedDays: routeData.estimatedDays,
        fuelConsumption: routeData.fuelConsumption,
        bunkerStops: routeData.bunkerStops.map((stop: any) => 
          WORLD_PORTS.find(p => p.name.toLowerCase().includes(stop.name.toLowerCase())) || {
            id: stop.name.toLowerCase(),
            name: stop.name,
            country: 'Unknown',
            lat: stop.lat,
            lng: stop.lng,
            type: 'bunker' as const,
            services: ['Bunker']
          }
        )
      };

      setRoute(newRoute);
      
      // Show relevant ports along the route
      const routePorts = [source, destination, ...newRoute.bunkerStops];
      setVisiblePorts(routePorts);

      showToast(`Route calculated: ${newRoute.distance} NM, ${newRoute.estimatedDays} days`, 'success');
    } catch (error) {
      showToast("Failed to calculate route", 'error');
    }
  };

  // Handle AI chat
  const handleAiMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      // Try to use AI service first
      const response = await fetch('/api/maritime/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: aiInput,
          context: {
            selectedPorts: { source: selectedSource, destination: selectedDestination },
            currentRoute: route,
            visiblePorts: visiblePorts
          }
        })
      });

      let aiResponse = '';
      
      if (response.ok) {
        const data = await response.json();
        aiResponse = data.response;
      } else {
        // Fallback to local responses
        aiResponse = getLocalAiResponse(aiInput);
      }

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      // Fallback to local responses on error
      const aiResponse = getLocalAiResponse(aiInput);
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Local AI response fallback
  const getLocalAiResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('port') && lowerQuery.includes('info')) {
      const portName = query.match(/info.*?about\s+(\w+)/)?.[1] || 
                      query.match(/(\w+)\s+port/)?.[1];
      
      if (portName) {
        const port = WORLD_PORTS.find(p => 
          p.name.toLowerCase().includes(portName) ||
          p.country.toLowerCase().includes(portName)
        );
        
        if (port) {
          return `**${port.name} Port Information:**\n\n` +
            `📍 **Location:** ${port.country}\n` +
            `🚢 **Type:** ${port.type} port\n` +
            `⚓ **Services:** ${port.services.join(', ')}\n\n` +
            `${port.description || 'Major maritime facility with comprehensive services.'}\n\n` +
            `**Operational Notes:**\n` +
            `• Coordinates: ${port.lat.toFixed(4)}°N, ${port.lng.toFixed(4)}°E\n` +
            `• Suitable for: ${port.services.includes('Container') ? 'Container vessels' : 'Bulk carriers'}\n` +
            `• ${port.services.includes('Bunker') ? 'Bunkering services available' : 'Contact port for bunkering arrangements'}`;
        }
      }
    } else if (lowerQuery.includes('route') || lowerQuery.includes('distance')) {
      if (selectedSource && selectedDestination) {
        return `Current route: ${selectedSource.name} → ${selectedDestination.name}\n\n` +
          `${route ? `Distance: ${route.distance} NM\nEstimated time: ${route.estimatedDays} days\nFuel: ${route.fuelConsumption} MT` : 'Calculating route...'}\n\n` +
          'I can provide detailed route analysis including weather patterns, seasonal considerations, and optimization recommendations when connected to the AI service.';
      }
      return 'Select source and destination ports on the map to calculate routes with detailed analysis.';
    }
    
    return 'I\'m your maritime AI assistant. For enhanced responses with detailed port information and route analysis, please configure the Gemini API key. I can still help with basic port data and route calculations.';
  };

  // Handle port selection
  const handlePortSelect = (port: Port, type: 'source' | 'destination') => {
    if (type === 'source') {
      setSelectedSource(port);
      if (selectedDestination && selectedDestination.id !== port.id) {
        calculateRoute(port, selectedDestination);
      }
    } else {
      setSelectedDestination(port);
      if (selectedSource && selectedSource.id !== port.id) {
        calculateRoute(selectedSource, port);
      }
    }
  };

  // Clear route
  const clearRoute = () => {
    setRoute(null);
    setSelectedSource(null);
    setSelectedDestination(null);
    setVisiblePorts([]);
  };

  return (
    <div className="h-screen flex">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Show all ports initially, or filtered ports along route */}
          {(visiblePorts.length > 0 ? visiblePorts : filteredPorts).map((port) => (
            <Marker
              key={port.id}
              position={[port.lat, port.lng]}
              icon={port.type === 'bunker' ? bunkerIcon : portIcon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg">{port.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{port.country}</p>
                  
                  <div className="mb-2">
                    <Badge variant={port.type === 'major' ? 'default' : 'secondary'}>
                      {port.type} port
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {port.services.map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setShowAiConfig(true)}
                  >
                    <Settings className="h-4 w-4" />
                    AI Settings
                  </Button>
                  
                  {port.description && (
                    <p className="text-xs text-gray-700 mb-3">{port.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePortSelect(port, 'source')}
                      variant={selectedSource?.id === port.id ? 'default' : 'outline'}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      From
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePortSelect(port, 'destination')}
                      variant={selectedDestination?.id === port.id ? 'default' : 'outline'}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      To
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Route line */}
          {route && (
            <Polyline
              positions={route.waypoints}
              color="blue"
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <Card className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search ports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
            </div>
            
            {selectedSource && selectedDestination && (
              <Button onClick={clearRoute} variant="outline" size="sm">
                Clear Route
              </Button>
            )}
          </Card>

          {/* Route Information */}
          {route && (
            <Card className="p-3 max-w-xs">
              <h4 className="font-semibold mb-2 flex items-center">
                <Route className="w-4 h-4 mr-2" />
                Route Details
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span>{route.distance.toLocaleString()} NM</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Time:</span>
                  <span>{route.estimatedDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel:</span>
                  <span>{route.fuelConsumption.toLocaleString()} MT</span>
                </div>
                {route.bunkerStops.length > 0 && (
                  <div>
                    <span className="font-medium">Bunker Stops:</span>
                    {route.bunkerStops.map(stop => (
                      <div key={stop.id} className="text-xs text-gray-600 ml-2">
                        • {stop.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-96 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Maritime AI Assistant
          </h3>
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
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-line">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isAiLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about ports, routes, weather..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAiMessage()}
              disabled={isAiLoading}
            />
            <Button onClick={handleAiMessage} disabled={isAiLoading || !aiInput.trim()}>
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Configuration Panel */}
      <AIConfigPanel 
        isOpen={showAiConfig}
        onClose={() => setShowAiConfig(false)}
      />
    </div>
  );
}
