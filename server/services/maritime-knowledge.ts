import { storage } from '../storage';

export interface LayTimeCalculation {
  arrivalTime: Date;
  completionTime: Date;
  totalHours: number;
  totalDays: number;
  workingDays?: number;
  weatherDays?: number;
  remarks?: string;
}

export interface DistanceCalculation {
  fromPort: string;
  toPort: string;
  distanceNM: number;
  estimatedDays: number;
  fuelConsumption?: number;
}

export function calculateLaytime(
  arrivalTime: Date, 
  completionTime: Date,
  options: { excludeWeekends?: boolean; excludeHolidays?: Date[] } = {}
): LayTimeCalculation {
  const totalMs = completionTime.getTime() - arrivalTime.getTime();
  const totalHours = totalMs / (1000 * 60 * 60);
  const totalDays = totalHours / 24;

  let workingDays = totalDays;
  
  if (options.excludeWeekends) {
    // Simple calculation - more complex logic would be needed for precise working days
    const weekends = Math.floor(totalDays / 7) * 2;
    workingDays = totalDays - weekends;
  }

  return {
    arrivalTime,
    completionTime,
    totalHours: Math.round(totalHours * 100) / 100,
    totalDays: Math.round(totalDays * 100) / 100,
    workingDays: Math.round(workingDays * 100) / 100
  };
}

export function calculateDistance(fromPort: string, toPort: string): DistanceCalculation {
  // Simplified port distance database - in a real application, this would be more comprehensive
  const portDistances: Record<string, Record<string, number>> = {
    'hamburg': {
      'rotterdam': 237,
      'antwerp': 288,
      'felixstowe': 391,
      'santos': 5967,
      'singapore': 8345
    },
    'rotterdam': {
      'hamburg': 237,
      'antwerp': 68,
      'felixstowe': 187,
      'new_york': 3654,
      'singapore': 8277
    },
    'singapore': {
      'shanghai': 1436,
      'tokyo': 2885,
      'mumbai': 2889,
      'dubai': 3277,
      'hamburg': 8345
    }
  };

  const fromKey = fromPort.toLowerCase().replace(/\s+/g, '_');
  const toKey = toPort.toLowerCase().replace(/\s+/g, '_');

  let distanceNM = 0;
  if (portDistances[fromKey]?.[toKey]) {
    distanceNM = portDistances[fromKey][toKey];
  } else if (portDistances[toKey]?.[fromKey]) {
    distanceNM = portDistances[toKey][fromKey];
  } else {
    // Default estimate if ports not in database
    distanceNM = 5000; // Default long distance
  }

  const averageSpeed = 14; // knots
  const estimatedDays = Math.round((distanceNM / (averageSpeed * 24)) * 100) / 100;

  return {
    fromPort,
    toPort,
    distanceNM,
    estimatedDays,
    fuelConsumption: Math.round(distanceNM * 30) // Rough estimate: 30 MT/day
  };
}

export async function searchMaritimeKnowledge(query: string, category?: string) {
  const results = await storage.searchMaritimeKnowledge(query);
  
  if (category) {
    return results.filter(r => r.category === category);
  }
  
  return results;
}

export function getWeatherConditions(location: string): { 
  condition: string; 
  temperature: number; 
  windSpeed: number; 
  visibility: number;
  recommendation: string;
} {
  // This is a simplified weather service - in production, you'd integrate with a real weather API
  const conditions = [
    { condition: 'Clear', temperature: 18, windSpeed: 12, visibility: 10, recommendation: 'Good conditions for cargo operations' },
    { condition: 'Partly Cloudy', temperature: 16, windSpeed: 15, visibility: 8, recommendation: 'Suitable for operations with caution' },
    { condition: 'Overcast', temperature: 14, windSpeed: 20, visibility: 6, recommendation: 'Monitor weather conditions closely' },
    { condition: 'Light Rain', temperature: 12, windSpeed: 18, visibility: 4, recommendation: 'Consider delays for sensitive cargo' }
  ];

  return conditions[Math.floor(Math.random() * conditions.length)];
}

export function interpretCPClause(clauseText: string): {
  clauseType: string;
  interpretation: string;
  implications: string[];
  recommendations: string[];
} {
  const lowerText = clauseText.toLowerCase();
  
  if (lowerText.includes('weather working day') || lowerText.includes('wwd')) {
    return {
      clauseType: 'Weather Working Days',
      interpretation: 'This clause excludes time when weather conditions prevent cargo operations from counting against laytime.',
      implications: [
        'Charterer protected from weather delays',
        'Definition of "weather" conditions must be clear',
        'Local port customs may apply'
      ],
      recommendations: [
        'Clarify weather thresholds',
        'Review local port weather definitions',
        'Consider weather monitoring systems'
      ]
    };
  } else if (lowerText.includes('demurrage') || lowerText.includes('dispatch')) {
    return {
      clauseType: 'Demurrage/Dispatch',
      interpretation: 'This clause defines compensation for exceeding laytime (demurrage) or completing early (dispatch).',
      implications: [
        'Financial liability for delays',
        'Incentive for efficient operations',
        'Clear calculation methods required'
      ],
      recommendations: [
        'Verify calculation methods',
        'Understand dispatch rates',
        'Plan operations efficiently'
      ]
    };
  } else {
    return {
      clauseType: 'General Charter Party Clause',
      interpretation: 'This appears to be a standard charter party provision requiring detailed analysis.',
      implications: [
        'Legal obligations for both parties',
        'Potential financial implications',
        'Operational requirements'
      ],
      recommendations: [
        'Seek legal review if unclear',
        'Document compliance actions',
        'Maintain clear records'
      ]
    };
  }
}
