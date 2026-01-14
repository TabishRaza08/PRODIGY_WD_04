import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import { fetchWeather } from './services/weatherService';
import { WeatherData } from './types';

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleSearch = async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(term);
      setWeatherData(data);
    } catch (err) {
      setError("Could not fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // We pass the coordinates directly to Gemini, it figures it out.
        const query = `${latitude}, ${longitude}`;
        
        try {
          setLoading(true);
          // Optional: You could reverse geocode here, but the AI handles lat/long well.
          const data = await fetchWeather(query);
          setWeatherData(data);
        } catch (err) {
          setError("Could not fetch weather for your location.");
        } finally {
          setLoading(false);
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setError("Unable to retrieve your location.");
      }
    );
  }, []);

  // Initial load - try to get location if permission was already granted?
  // Or just leave blank. The prompt asks to fetch based on user location OR input.
  // A clean "Use my location" button is better UI than auto-prompting on load which can be annoying.

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-light text-gray-800 tracking-tight">Weather</h1>
          <p className="text-gray-400 text-sm mt-2">Real-time local updates</p>
        </header>

        <SearchBar onSearch={handleSearch} isLoading={loading} />
        
        <div className="flex justify-center mb-8">
           <button 
             onClick={handleLocationClick}
             disabled={loading || isLocating}
             className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
           >
             {isLocating ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
             )}
             <span>Use my current location</span>
           </button>
        </div>

        <WeatherCard data={weatherData} error={error} />
        
      </div>
      
      <footer className="mt-16 text-xs text-gray-300">
        Data provided by Google
      </footer>
    </div>
  );
}

export default App;
