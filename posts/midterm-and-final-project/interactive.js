import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Filter, Map, Activity, Users, Globe, Database, ArrowUpRight } from 'lucide-react';

// Mock data parsing function (in a real application, you'd import the CSV)
function parseData() {
  // Sample of the data structure from the provided simulation
  const mockData = [];
  const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const strains = ['LASV-A', 'LASV-B', 'LASV-C', 'LASV-D', 'LASV-E', 'LASV-F'];
  const countries = ['Nigeria', 'Sierra Leone', 'Liberia', 'Guinea', 'Mali', 'Benin', 'Ghana', 'Togo', 'Burkina Faso'];
  const cities = {
    'Nigeria': ['Abakaliki', 'Owo', 'Irrua', 'Ebonyi', 'Lagos', 'Abuja'],
    'Sierra Leone': ['Kenema', 'Freetown', 'Bo', 'Makeni'],
    'Liberia': ['Monrovia', 'Gbarnga', 'Voinjama'],
    'Guinea': ['Gueckedou', 'Nzerekore', 'Conakry', 'Kissidougou'],
    'Mali': ['Sikasso', 'Bamako'],
    'Benin': ['Cotonou', 'Porto-Novo'],
    'Ghana': ['Accra', 'Kumasi'],
    'Togo': ['Lome'],
    'Burkina Faso': ['Ouagadougou']
  };
  
  // Generate 1000 data points for the visualization
  for (let i = 0; i < 1000; i++) {
    const strain = strains[Math.floor(Math.random() * strains.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const city = cities[country][Math.floor(Math.random() * cities[country].length)];
    const host = Math.random() > 0.6 ? 'human' : 'rodent';
    const transmission = host === 'human' ? 
      (Math.random() > 0.3 ? 'human-human' : 'rodent-human') : 
      (Math.random() > 0.2 ? 'rodent-rodent' : 'initial');
    const generation = Math.floor(Math.random() * 300);
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 365));
    
    // Random coordinates within West Africa
    const lat = 5 + Math.random() * 10;
    const long = -15 + Math.random() * 18;
    
    // Random fitness value
    const fitness = 1.2 + Math.random() * 2.3;
    
    mockData.push({
      clade: `clade-${i}`,
      strain,
      lat,
      long,
      city,
      country,
      transmission,
      generation,
      date: date.toISOString().split('T')[0],
      host,
      fitness
    });
  }
  
  return mockData;
}

export default function LassaVirusSimulation() {
  const [data, setData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [strainData, setStrainData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [transmissionData, setTransmissionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [filters, setFilters] = useState({
    strain: 'all',
    country: 'all',
    host: 'all',
    transmission: 'all',
    dateRange: [null, null]
  });
  
  // Initialize data when component mounts
  useEffect(() => {
    const parsedData = parseData();
    setData(parsedData);
    setFilteredData(parsedData);
    
    // Process data for visualizations
    processData(parsedData);
  }, []);
  
  // When filters change, update filtered data
  useEffect(() => {
    filterData();
  }, [filters, data]);
  
  // Process data for different visualizations
  const processData = (sourceData) => {
    // Process time series data
    const timeSeriesMap = {};
    const strainDistribution = {};
    const countryDistribution = {};
    const transmissionTypes = {};
    
    sourceData.forEach(entry => {
      // Time series processing
      const month = entry.date.substring(0, 7); // YYYY-MM format
      if (!timeSeriesMap[month]) {
        timeSeriesMap[month] = { month, human: 0, rodent: 0, total: 0 };
      }
      timeSeriesMap[month][entry.host]++;
      timeSeriesMap[month].total++;
      
      // Strain distribution
      if (!strainDistribution[entry.strain]) {
        strainDistribution[entry.strain] = 0;
      }
      strainDistribution[entry.strain]++;
      
      // Country distribution
      if (!countryDistribution[entry.country]) {
        countryDistribution[entry.country] = 0;
      }
      countryDistribution[entry.country]++;
      
      // Transmission types
      if (!transmissionTypes[entry.transmission]) {
        transmissionTypes[entry.transmission] = 0;
      }
      transmissionTypes[entry.transmission]++;
    });
    
    // Convert to arrays for charts
    setTimeData(Object.values(timeSeriesMap).sort((a, b) => a.month.localeCompare(b.month)));
    
    setStrainData(Object.entries(strainDistribution).map(([name, value]) => ({ name, value })));
    
    setCountryData(Object.entries(countryDistribution).map(([name, value]) => ({ name, value })));
    
    setTransmissionData(Object.entries(transmissionTypes).map(([name, value]) => ({ name, value })));
  };
  
  // Filter data based on selected filters
  const filterData = () => {
    let result = [...data];
    
    if (filters.strain !== 'all') {
      result = result.filter(item => item.strain === filters.strain);
    }
    
    if (filters.country !== 'all') {
      result = result.filter(item => item.country === filters.country);
    }
    
    if (filters.host !== 'all') {
      result = result.filter(item => item.host === filters.host);
    }
    
    if (filters.transmission !== 'all') {
      result = result.filter(item => item.transmission === filters.transmission);
    }
    
    setFilteredData(result);
    processData(result);
  };
  
  // Get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    const uniqueSet = new Set(data.map(item => item[field]));
    return Array.from(uniqueSet);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };
  
  // Different visualization tabs
  const renderContent = () => {
    switch (activeTab) {
      case 'timeline':
        return renderTimeline();
      case 'geographic':
        return renderGeographic();
      case 'transmission':
        return renderTransmission();
      case 'genetic':
        return renderGenetic();
      default:
        return renderTimeline();
    }
  };
  
  // Timeline visualization
  const renderTimeline = () => {
    return (
      <div className="h-96 p-4">
        <h2 className="text-xl font-bold mb-4">Infection Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="human" stroke="#8884d8" name="Human Infections" />
            <Line type="monotone" dataKey="rodent" stroke="#82ca9d" name="Rodent Infections" />
            <Line type="monotone" dataKey="total" stroke="#ff7300" name="Total Infections" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Geographic spread visualization
  const renderGeographic = () => {
    return (
      <div className="h-96 p-4">
        <h2 className="text-xl font-bold mb-4">Geographic Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData.sort((a, b) => b.value - a.value)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Infections" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Infection Map</h3>
            <p className="text-gray-600 mb-4">
              Geographic scatter plot representing Lassa virus infections across West Africa. 
              Each point represents an infection site.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-center">
              <Globe className="text-blue-500 mr-2" />
              <span>In a full implementation, this would show an interactive map of West Africa with data points for each infection location.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Transmission patterns visualization
  const renderTransmission = () => {
    return (
      <div className="h-96 p-4">
        <h2 className="text-xl font-bold mb-4">Transmission Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transmissionData.sort((a, b) => b.value - a.value)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Transmission Network</h3>
            <p className="text-gray-600 mb-4">
              The network visualization would show connections between infections, 
              highlighting transmission chains and clusters.
            </p>
            <div className="bg-green-50 border border-green-200 rounded p-4 flex items-center">
              <Activity className="text-green-500 mr-2" />
              <span>In a full implementation, this would display an interactive force-directed graph showing transmission relationships between clades.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Genetic diversity visualization
  const renderGenetic = () => {
    return (
      <div className="h-96 p-4">
        <h2 className="text-xl font-bold mb-4">Genetic Diversity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strainData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ff7300" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Fitness Distribution</h3>
            <p className="text-gray-600 mb-4">
              This chart would show the distribution of fitness values (R0) across different strains,
              indicating their transmissibility.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded p-4 flex items-center">
              <Database className="text-orange-500 mr-2" />
              <span>In a full implementation, this would display a scatter plot showing the relationship between genetic distance and fitness values.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Lassa Virus Simulation Dashboard</h1>
          <p className="text-indigo-200">Interactive visualization of viral transmission and evolution</p>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-grow container mx-auto p-4">
        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex items-center mb-2">
            <Filter className="text-indigo-500 mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strain</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={filters.strain}
                onChange={(e) => handleFilterChange('strain', e.target.value)}
              >
                <option value="all">All Strains</option>
                {getUniqueValues('strain').map(strain => (
                  <option key={strain} value={strain}>{strain}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="all">All Countries</option>
                {getUniqueValues('country').map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={filters.host}
                onChange={(e) => handleFilterChange('host', e.target.value)}
              >
                <option value="all">All Hosts</option>
                <option value="human">Human</option>
                <option value="rodent">Rodent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="initial">Initial</option>
                <option value="rodent-rodent">Rodent-to-Rodent</option>
                <option value="rodent-human">Rodent-to-Human</option>
                <option value="human-human">Human-to-Human</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Summary</label>
              <div className="bg-gray-100 rounded px-3 py-2 flex items-center justify-between">
                <span className="text-gray-700">Records:</span>
                <span className="font-semibold">{filteredData.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded shadow">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'timeline' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('timeline')}
              >
                Timeline
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'geographic' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('geographic')}
              >
                Geographic Spread
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'transmission' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('transmission')}
              >
                Transmission
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'genetic' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('genetic')}
              >
                Genetic Diversity
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-300 p-4">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>Lassa Virus Simulation Dashboard | Data visualized from simulation model</p>
          <p className="mt-1">This interactive visualization demonstrates potential viral spread patterns based on the provided simulation code.</p>
        </div>
      </footer>
    </div>
  );
}