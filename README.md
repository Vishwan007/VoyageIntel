# VoyageIntel - Maritime AI Assistant

A comprehensive maritime intelligence platform with AI-powered voyage planning, weather analysis, and operational guidance.

## 🚢 Features

### Maritime Tools
- **Weather Analysis**: Real-time maritime weather conditions and forecasts
- **Port Information**: Detailed port facilities, services, and operational data
- **Fuel Planning**: Consumption calculations and bunkering optimization
- **Route Planning**: Interactive route visualization with distance calculations
- **Laytime Calculator**: Arrival and completion time estimations
- **CP Clause Analyzer**: Charter party clause interpretation

### AI Assistant
- **Gemini AI Integration**: Professional maritime guidance and recommendations
- **Context-Aware Responses**: Uses current route and vessel data
- **Fallback System**: Maintains functionality without API key
- **Maritime Expertise**: Weather routing, fuel optimization, regulatory compliance

### Interactive Features
- **World Map**: Interactive maritime map with port selection
- **Route Visualization**: Visual route display with waypoints
- **Voyage Management**: Comprehensive voyage tracking and analytics
- **Real-time Updates**: Live data integration and notifications

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Leaflet** for interactive maps
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Query** for data management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Google Generative AI** (Gemini)
- **PDF processing** capabilities
- **RESTful API** architecture

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Gemini API key (optional, for enhanced AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/VoyageIntel.git
cd VoyageIntel
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Add your Gemini API key to .env (optional)
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 📋 Usage

### Basic Maritime Tools
1. Navigate to **Voyage Tools** from the sidebar
2. Use weather, distance, laytime, and clause analysis tools
3. Click **World Map** to access the interactive maritime map

### AI Assistant
1. Open the **World Map** interface
2. Click the **Settings (⚙️)** button to configure your Gemini API key
3. Use the AI chat panel for maritime queries and route planning
4. Ask questions about weather, ports, fuel planning, or regulations

### Route Planning
1. Select departure and destination ports on the map
2. Use the **Route Planner** panel to configure vessel specifications
3. Click **Plan Route** to calculate distance and visualize the route
4. Use AI assistant to get route optimization recommendations

## 🔧 Configuration

### Gemini AI Setup
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the Settings button in the AI assistant panel
3. Enter your API key and save
4. The AI assistant will now provide enhanced responses

### Environment Variables
```bash
# Optional - for enhanced AI features
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📁 Project Structure

```
VoyageIntel/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   └── data.json      # Sample maritime data
├── server/                # Backend Node.js application
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── middleware/       # Express middleware
│   └── index.ts          # Server entry point
├── shared/               # Shared TypeScript types
└── uploads/              # File upload storage
```

## 🌊 Maritime Features

### Weather Analysis
- Current conditions and forecasts
- Wind speed and direction
- Wave height and sea state
- Operational recommendations

### Port Information
- Facility details and services
- Operational restrictions
- Pilotage and tugboat services
- Container handling capabilities

### Route Optimization
- Great circle vs rhumb line calculations
- Weather routing recommendations
- Fuel consumption estimates
- Security considerations

### Regulatory Compliance
- SOLAS requirements
- MARPOL regulations
- Port state control guidelines
- Maritime labor conventions

## 🤖 AI Capabilities

The AI assistant provides professional maritime guidance on:
- **Weather Routing**: Optimal routes based on weather conditions
- **Fuel Optimization**: Bunkering strategies and consumption planning
- **Port Operations**: Facility information and operational advice
- **Regulatory Compliance**: Maritime law and safety requirements
- **Risk Assessment**: Security and operational risk analysis

## 🔒 Security

- API keys are handled securely on the backend
- No permanent storage of sensitive credentials
- Input validation and error handling
- Secure file upload processing

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t voyageintel .
docker run -p 3000:3000 voyageintel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the sample queries in the AI assistant

## 🙏 Acknowledgments

- Google Generative AI for maritime intelligence
- OpenStreetMap for maritime cartography
- Maritime industry professionals for domain expertise
- React and Node.js communities for excellent tooling

---

**VoyageIntel** - Empowering maritime operations with AI-driven intelligence.
