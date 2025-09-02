import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiConfig {
  apiKey: string;
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // Will be initialized when API key is provided
  }

  initialize(config: GeminiConfig) {
    try {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('Gemini AI initialized successfully with API key:', config.apiKey.substring(0, 10) + '...');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  async generateMaritimeResponse(query: string, context?: any): Promise<string> {
    console.log('Gemini AI generateMaritimeResponse called with query:', query);
    console.log('Model available:', !!this.model);
    
    if (!this.model) {
      console.log('No model available, returning fallback response');
      return this.getFallbackResponse(query);
    }

    try {
      const prompt = this.buildMaritimePrompt(query, context);
      console.log('Generated prompt:', prompt.substring(0, 200) + '...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('Gemini API response received:', responseText.substring(0, 200) + '...');
      return responseText;
    } catch (error: any) {
      console.error('Gemini API error details:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      
      // Handle specific API errors
      if (error.status === 429 || error.message?.includes('rate limit')) {
        return `🤖 **AI Assistant (Rate Limited)**\n\nThe Gemini AI service is currently experiencing high demand. Here's what I can help with using my built-in knowledge:\n\n${this.getFallbackResponse(query)}\n\n*Enhanced AI responses will be available when the service load decreases.*`;
      } else if (error.status === 404) {
        return `🤖 **AI Assistant (Service Issue)**\n\nThere's a temporary issue with the AI service. Using built-in maritime knowledge:\n\n${this.getFallbackResponse(query)}\n\n*Please try again in a few minutes for enhanced AI responses.*`;
      }
      
      return this.getFallbackResponse(query);
    }
  }

  async getPortInformation(portName: string): Promise<string> {
    if (!this.model) {
      return this.getFallbackPortInfo(portName);
    }

    try {
      const prompt = `Provide detailed maritime information about ${portName} port including:
      - Location and coordinates
      - Port facilities and services
      - Container/cargo handling capabilities
      - Bunker fuel availability
      - Pilotage and tugboat services
      - Port restrictions and regulations
      - Best practices for vessel operations
      - Current operational status if known
      
      Format the response in a professional maritime industry style.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackPortInfo(portName);
    }
  }

  async analyzeRoute(sourcePort: string, destinationPort: string, routeData: any): Promise<string> {
    if (!this.model) {
      return this.getFallbackRouteAnalysis(sourcePort, destinationPort, routeData);
    }

    try {
      const prompt = `Analyze this maritime route from ${sourcePort} to ${destinationPort}:
      
      Distance: ${routeData.distance} nautical miles
      Estimated time: ${routeData.estimatedDays} days
      Fuel consumption: ${routeData.fuelConsumption} MT
      
      Provide analysis including:
      - Route efficiency and alternatives
      - Weather considerations by season
      - Potential hazards or restrictions
      - Bunker planning recommendations
      - Port congestion factors
      - Cost optimization suggestions
      - Regulatory compliance notes
      
      Format as professional maritime advisory.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackRouteAnalysis(sourcePort, destinationPort, routeData);
    }
  }

  private buildMaritimePrompt(query: string, context?: any): string {
    let prompt = `You are a professional maritime industry AI assistant with comprehensive expertise in:
    - Global port operations and logistics
    - Vessel routing and navigation optimization
    - Maritime regulations and compliance (SOLAS, MARPOL, MLC)
    - Cargo handling and shipping operations
    - Real-time weather and sea conditions
    - Charter party terms and maritime contracts
    - Fuel planning and bunkering strategies
    - Maritime safety and risk management
    
    User query: ${query}

    IMPORTANT: Provide detailed, specific, and actionable information. Use real maritime industry knowledge and current operational practices.`;

    // Enhanced context handling for route planning
    if (context?.selectedPorts) {
      prompt += `\n\nSelected Ports: ${context.selectedPorts.join(', ')}`;
    }
    if (context?.isRoutePlannerOpen) {
      prompt += `\n\nRoute Planner Status: Active`;
    }
    if (context?.currentRoute) {
      prompt += `\n\nCurrent Route: ${context.currentRoute.name} - ${context.currentRoute.distance} NM, ${context.currentRoute.estimatedDays} days`;
    }
    if (context?.vesselSpecs) {
      prompt += `\n\nVessel: ${context.vesselSpecs.name} (${context.vesselSpecs.type}, ${context.vesselSpecs.speed} knots, ${context.vesselSpecs.fuelConsumption} MT/day)`;
    }

    prompt += `\n\nFor weather queries:
    - Provide current maritime weather conditions
    - Include wind speed/direction, wave height, visibility
    - Give operational recommendations for cargo operations
    - Consider seasonal weather patterns
    - Advise on safety precautions

    For port information queries:
    - Detail port facilities (container terminals, bulk handling, etc.)
    - Specify available services (pilotage, tugboats, bunkers)
    - Mention port restrictions and operational procedures
    - Include contact information if relevant
    - Provide berth availability and congestion status

    For fuel/bunkering queries:
    - Calculate fuel consumption based on vessel specs and route
    - Recommend optimal bunkering ports
    - Consider fuel quality and pricing
    - Suggest fuel-efficient routing
    - Address regulatory compliance (IMO 2020, etc.)

    For route planning:
    - Suggest optimal routes considering weather and traffic
    - Recommend waypoints and bunker stops
    - Calculate accurate distances and transit times
    - Consider seasonal routing variations
    - Address piracy risks and security measures

    Always provide specific, detailed, and professionally formatted responses with actionable maritime industry insights.`;
    
    return prompt;
  }

  private getFallbackResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('weather')) {
      return `**Maritime Weather Information**

For specific weather queries, I can provide detailed maritime conditions including:

• **Wind Speed & Direction** - Critical for cargo operations and vessel safety
• **Wave Height & Sea State** - Important for container handling and stability
• **Visibility Conditions** - Essential for navigation and pilot boarding
• **Temperature & Humidity** - Affects cargo and crew comfort
• **Operational Recommendations** - Based on current conditions

**Example Weather Data:**
- Wind: 15 knots from SW (suitable for container operations)
- Waves: 1-2 meters (normal cargo handling)
- Visibility: 8 nautical miles (good for navigation)
- Temperature: 22°C (optimal working conditions)

*For real-time weather data, please configure the Gemini API key for enhanced responses.*`;
    } else if (lowerQuery.includes('port')) {
      return `**Port Information Services**

I can provide comprehensive port data including:

• **Facilities & Infrastructure** - Container terminals, bulk handling, warehouses
• **Services Available** - Pilotage, tugboats, bunker supply, ship repair
• **Operational Details** - Working hours, cargo handling rates, restrictions
• **Contact Information** - Port authority, agents, service providers
• **Berth Specifications** - Depth, length, equipment available
• **Regulatory Requirements** - Customs, immigration, health clearances

**Sample Port Data:**
- **Singapore Port**: 24/7 operations, 200+ berths, world's busiest transshipment hub
- **Rotterdam Port**: Europe's largest, excellent rail/road connections, automated terminals
- **Dubai Port**: Middle East gateway, Jebel Ali free zone, excellent bunker facilities

*For detailed port information, please configure the Gemini API key.*`;
    } else if (lowerQuery.includes('fuel') || lowerQuery.includes('bunker')) {
      return `**Fuel Planning & Bunkering Services**

I can assist with comprehensive fuel management:

• **Consumption Calculations** - Based on vessel specs, route, and weather
• **Bunkering Strategy** - Optimal ports for fuel stops and cost savings
• **Fuel Quality Analysis** - Sulfur content, compatibility, regulatory compliance
• **Cost Optimization** - Price comparison across different ports
• **Regulatory Compliance** - IMO 2020 sulfur regulations, emission zones
• **Emergency Planning** - Alternative bunkering ports and contingencies

**Sample Fuel Calculations:**
- **Route**: Singapore to Rotterdam (8,000 NM)
- **Consumption**: 45 MT/day at 18 knots
- **Total Fuel**: ~2,000 MT for 20-day voyage
- **Recommended Bunker Stops**: Suez Canal, Gibraltar

*For detailed fuel planning, please configure the Gemini API key.*`;
    } else if (lowerQuery.includes('route') || lowerQuery.includes('alternative')) {
      return `**Route Planning & Alternatives**

I can provide comprehensive routing solutions:

• **Optimal Routes** - Shortest distance, fuel-efficient paths
• **Alternative Routes** - Weather routing, congestion avoidance
• **Seasonal Considerations** - Monsoons, ice conditions, cyclone seasons
• **Security Factors** - Piracy risks, high-risk areas, escort requirements
• **Canal Transits** - Suez, Panama, scheduling and restrictions
• **Port Alternatives** - Backup options for congestion or emergencies

**Route Examples:**
- **Asia-Europe**: Via Suez (faster) vs Cape of Good Hope (safer)
- **Transpacific**: Great Circle vs weather routing
- **Transatlantic**: Northern vs Southern routes based on season

*For detailed route analysis, please configure the Gemini API key.*`;
    } else {
      return `**Maritime AI Assistant - Full Service Available**

I'm your comprehensive maritime operations assistant with expertise in:

🌊 **Weather & Conditions** - Real-time maritime weather, operational impacts
🏗️ **Port Operations** - Facilities, services, procedures, restrictions  
⛽ **Fuel Planning** - Consumption, bunkering, cost optimization
🗺️ **Route Planning** - Optimization, alternatives, seasonal routing
📋 **Regulations** - SOLAS, MARPOL, port state control, compliance
🚢 **Vessel Operations** - Performance, maintenance, crew management
💰 **Commercial** - Charter parties, freight rates, market analysis

**How to get enhanced responses:**
1. Configure your Gemini API key via the settings button
2. Ask specific questions about any maritime topic
3. Get detailed, professional industry insights

*What maritime topic can I help you with today?*`;
    }
  }

  private getFallbackPortInfo(portName: string): string {
    return `Port information for ${portName} requires AI service connection. Please configure the Gemini API key to access detailed port data including facilities, services, and operational information.`;
  }

  private getFallbackRouteAnalysis(sourcePort: string, destinationPort: string, routeData: any): string {
    return `Route analysis from ${sourcePort} to ${destinationPort}:
    
    Basic route calculated: ${routeData.distance} NM, ${routeData.estimatedDays} days
    
    For detailed route analysis including weather patterns, seasonal considerations, and optimization recommendations, please configure the Gemini API key.`;
  }
}

export const geminiAI = new GeminiAIService();
export default geminiAI;
