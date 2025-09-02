import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Plus, Edit, Trash2, Ship, Calendar, MapPin, Clock } from 'lucide-react';

interface VoyageData {
  id: string;
  vesselName: string;
  voyageNumber: string;
  departurePort: string;
  arrivalPort: string;
  departureDate: string;
  arrivalDate: string;
  cargoType: string;
  cargoQuantity: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  charterer: string;
  estimatedDays: number;
  actualDays?: number;
  fuelConsumption: number;
  revenue: number;
  expenses: number;
  profit: number;
  weatherConditions: string;
  bunkerStops: string[];
}

const mockVoyageData: VoyageData[] = [
  {
    id: '1',
    vesselName: 'MV Atlantic Pioneer',
    voyageNumber: 'AP-2024-001',
    departurePort: 'Rotterdam',
    arrivalPort: 'Singapore',
    departureDate: '2024-01-15',
    arrivalDate: '2024-02-10',
    cargoType: 'Container',
    cargoQuantity: 18500,
    status: 'completed',
    charterer: 'Maersk Line',
    estimatedDays: 26,
    actualDays: 26,
    fuelConsumption: 850,
    revenue: 2500000,
    expenses: 1800000,
    profit: 700000,
    weatherConditions: 'Favorable',
    bunkerStops: ['Suez Canal', 'Colombo']
  },
  {
    id: '2',
    vesselName: 'MV Pacific Explorer',
    voyageNumber: 'PE-2024-002',
    departurePort: 'Los Angeles',
    arrivalPort: 'Tokyo',
    departureDate: '2024-02-01',
    arrivalDate: '2024-02-15',
    cargoType: 'Bulk Grain',
    cargoQuantity: 45000,
    status: 'in-progress',
    charterer: 'Cargill Inc.',
    estimatedDays: 14,
    fuelConsumption: 420,
    revenue: 1800000,
    expenses: 1200000,
    profit: 600000,
    weatherConditions: 'Moderate',
    bunkerStops: ['Honolulu']
  },
  {
    id: '3',
    vesselName: 'MV Nordic Star',
    voyageNumber: 'NS-2024-003',
    departurePort: 'Hamburg',
    arrivalPort: 'New York',
    departureDate: '2024-02-20',
    arrivalDate: '2024-03-05',
    cargoType: 'Automotive',
    cargoQuantity: 2500,
    status: 'planned',
    charterer: 'Volkswagen AG',
    estimatedDays: 13,
    fuelConsumption: 390,
    revenue: 1500000,
    expenses: 1000000,
    profit: 500000,
    weatherConditions: 'Rough',
    bunkerStops: []
  }
];

export default function EnhancedVoyageTable() {
  const [voyages, setVoyages] = useState<VoyageData[]>(mockVoyageData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('departureDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const filteredAndSortedVoyages = useMemo(() => {
    let filtered = voyages.filter(voyage => {
      const matchesSearch = 
        voyage.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.departurePort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.arrivalPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.charterer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || voyage.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof VoyageData];
      let bValue: any = b[sortBy as keyof VoyageData];
      
      if (sortBy === 'departureDate' || sortBy === 'arrivalDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [voyages, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'planned': { color: 'bg-blue-100 text-blue-800', label: 'Planned' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'delayed': { color: 'bg-red-100 text-red-800', label: 'Delayed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalStats = () => {
    return filteredAndSortedVoyages.reduce((acc, voyage) => {
      acc.totalRevenue += voyage.revenue;
      acc.totalExpenses += voyage.expenses;
      acc.totalProfit += voyage.profit;
      acc.totalFuel += voyage.fuelConsumption;
      return acc;
    }, { totalRevenue: 0, totalExpenses: 0, totalProfit: 0, totalFuel: 0 });
  };

  const stats = calculateTotalStats();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Vessel Name', 'Voyage Number', 'Departure Port', 'Arrival Port', 'Departure Date', 'Arrival Date', 'Status', 'Cargo Type', 'Cargo Quantity', 'Charterer', 'Revenue', 'Expenses', 'Profit'].join(','),
      ...filteredAndSortedVoyages.map(voyage => [
        voyage.vesselName,
        voyage.voyageNumber,
        voyage.departurePort,
        voyage.arrivalPort,
        voyage.departureDate,
        voyage.arrivalDate,
        voyage.status,
        voyage.cargoType,
        voyage.cargoQuantity,
        voyage.charterer,
        voyage.revenue,
        voyage.expenses,
        voyage.profit
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voyage-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Voyage Management</h2>
          <p className="text-gray-600">Track and analyze vessel voyages and performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Voyage
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Ship className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalProfit)}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fuel (MT)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalFuel.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Voyages</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by vessel, voyage number, port, or charterer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full lg:w-48">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departureDate">Departure Date</SelectItem>
                  <SelectItem value="arrivalDate">Arrival Date</SelectItem>
                  <SelectItem value="vesselName">Vessel Name</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voyage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voyage Details ({filteredAndSortedVoyages.length} voyages)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('vesselName')}>
                    Vessel Name {sortBy === 'vesselName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('voyageNumber')}>
                    Voyage # {sortBy === 'voyageNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3">Route</th>
                  <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('departureDate')}>
                    Dates {sortBy === 'departureDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Cargo</th>
                  <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('revenue')}>
                    Revenue {sortBy === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('profit')}>
                    Profit {sortBy === 'profit' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedVoyages.map((voyage) => (
                  <tr key={voyage.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{voyage.vesselName}</div>
                      <div className="text-sm text-gray-600">{voyage.charterer}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-sm">{voyage.voyageNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{voyage.departurePort} → {voyage.arrivalPort}</div>
                        {voyage.bunkerStops.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Via: {voyage.bunkerStops.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>Dep: {formatDate(voyage.departureDate)}</div>
                        <div>Arr: {formatDate(voyage.arrivalDate)}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(voyage.status)}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{voyage.cargoType}</div>
                        <div className="text-gray-600">{voyage.cargoQuantity.toLocaleString()} MT</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-green-600">{formatCurrency(voyage.revenue)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(voyage.expenses)} exp</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-blue-600">{formatCurrency(voyage.profit)}</div>
                      <div className="text-xs text-gray-500">
                        {((voyage.profit / voyage.revenue) * 100).toFixed(1)}% margin
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVoyage(voyage)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAndSortedVoyages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No voyages found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voyage Details Modal/Panel */}
      {selectedVoyage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Voyage Details - {selectedVoyage.voyageNumber}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedVoyage(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="operational">Operational</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Vessel Information</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{selectedVoyage.vesselName}</div>
                      <div className="text-sm text-gray-600">Voyage: {selectedVoyage.voyageNumber}</div>
                      <div className="text-sm text-gray-600">Charterer: {selectedVoyage.charterer}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Route Information</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{selectedVoyage.departurePort} → {selectedVoyage.arrivalPort}</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(selectedVoyage.departureDate)} - {formatDate(selectedVoyage.arrivalDate)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {selectedVoyage.estimatedDays} days (estimated)
                        {selectedVoyage.actualDays && ` / ${selectedVoyage.actualDays} days (actual)`}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Revenue</Label>
                    <div className="p-3 bg-green-50 rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedVoyage.revenue)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Expenses</Label>
                    <div className="p-3 bg-red-50 rounded-md">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(selectedVoyage.expenses)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Profit</Label>
                    <div className="p-3 bg-blue-50 rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(selectedVoyage.profit)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {((selectedVoyage.profit / selectedVoyage.revenue) * 100).toFixed(1)}% margin
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="operational" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cargo Details</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{selectedVoyage.cargoType}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {selectedVoyage.cargoQuantity.toLocaleString()} MT
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Fuel Consumption</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{selectedVoyage.fuelConsumption} MT</div>
                      <div className="text-sm text-gray-600">
                        Weather: {selectedVoyage.weatherConditions}
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedVoyage.bunkerStops.length > 0 && (
                  <div>
                    <Label>Bunker Stops</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex flex-wrap gap-2">
                        {selectedVoyage.bunkerStops.map((stop, index) => (
                          <Badge key={index} variant="outline">{stop}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
