import { Router } from "express";

const router = Router();

// Weather endpoint
router.post("/weather", async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    // Mock weather data
    const weatherData = {
      location,
      condition: "Partly Cloudy",
      temperature: 22,
      windSpeed: 15,
      visibility: 10,
      recommendation: "Good conditions for maritime operations. Monitor wind conditions."
    };

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: "Failed to get weather data" });
  }
});

// Laytime calculation endpoint
router.post("/laytime", async (req, res) => {
  try {
    const { arrivalTime, completionTime } = req.body;
    
    if (!arrivalTime || !completionTime) {
      return res.status(400).json({ error: "Both arrival and completion times are required" });
    }

    const arrival = new Date(arrivalTime);
    const completion = new Date(completionTime);
    const diffMs = completion.getTime() - arrival.getTime();
    const totalHours = Math.round(diffMs / (1000 * 60 * 60) * 100) / 100;
    const totalDays = Math.round(totalHours / 24 * 100) / 100;

    res.json({
      arrivalTime,
      completionTime,
      totalHours,
      totalDays
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate laytime" });
  }
});

// Distance calculation endpoint
router.post("/distance", async (req, res) => {
  try {
    const { fromPort, toPort } = req.body;
    
    if (!fromPort || !toPort) {
      return res.status(400).json({ error: "Both ports are required" });
    }

    // Mock distance calculation
    const mockDistances: { [key: string]: number } = {
      "hamburg-singapore": 8500,
      "rotterdam-shanghai": 11000,
      "singapore-hamburg": 8500,
      "shanghai-rotterdam": 11000
    };

    const routeKey = `${fromPort.toLowerCase()}-${toPort.toLowerCase()}`;
    const distanceNM = mockDistances[routeKey] || Math.floor(Math.random() * 10000) + 2000;
    const estimatedDays = Math.round(distanceNM / 400 * 100) / 100; // Assuming 400 NM per day
    const fuelConsumption = Math.round(distanceNM * 0.05 * 100) / 100; // Mock fuel calculation

    res.json({
      fromPort,
      toPort,
      distanceNM,
      estimatedDays,
      fuelConsumption
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate distance" });
  }
});

// Charter party clause analysis endpoint
router.post("/analyze-clause", async (req, res) => {
  try {
    const { clauseText } = req.body;
    
    if (!clauseText) {
      return res.status(400).json({ error: "Clause text is required" });
    }

    // Mock clause analysis
    const analysis = {
      clauseType: "Laytime Clause",
      interpretation: "This clause defines the allowed time for loading/discharging operations at the port.",
      implications: [
        "Demurrage may apply if operations exceed allowed time",
        "Weather delays may be excluded from laytime calculation",
        "Notice of readiness must be given properly"
      ],
      recommendations: [
        "Ensure proper documentation of delays",
        "Monitor weather conditions closely",
        "Coordinate with port authorities for efficient operations"
      ]
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze clause" });
  }
});

// Route calculation endpoint
router.post("/route", async (req, res) => {
  try {
    const { sourcePort, destinationPort } = req.body;
    
    if (!sourcePort || !destinationPort) {
      return res.status(400).json({ error: "Source and destination ports are required" });
    }

    // Mock route calculation
    const distance = Math.floor(Math.random() * 10000) + 2000;
    const estimatedDays = Math.round(distance / 400 * 100) / 100;
    const fuelConsumption = Math.round(distance * 0.05 * 100) / 100;
    
    const bunkerStops = distance > 6000 ? [
      { name: "Suez Canal", lat: 30.0444, lng: 32.2357 },
      { name: "Singapore", lat: 1.3521, lng: 103.8198 }
    ] : [];

    const waypoints = [
      { lat: sourcePort.lat || 53.5511, lng: sourcePort.lng || 9.9937 },
      ...bunkerStops,
      { lat: destinationPort.lat || 1.3521, lng: destinationPort.lng || 103.8198 }
    ];

    res.json({
      distance,
      estimatedDays,
      fuelConsumption,
      bunkerStops,
      waypoints
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate route" });
  }
});

export default router;
