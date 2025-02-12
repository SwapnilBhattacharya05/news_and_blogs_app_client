import { useEffect, useState } from "react";
import "./Weather.css";
import axios from "axios";

const Weather = () => {
  // STORE WEATHER DATA FETCHED FROM OPENWEATHERMAP API
  // {} => SINCE INITIALLY WE DON'T HAVE ANY WEATHER DATA TO DISPLAY AND IT WILL CHANGE BASED ON LOCATION INPUT BY USER
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");

  useEffect(() => {
    const fetchDefaultLocation = async () => {
      const defaultLocation = "Pune";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${defaultLocation}&units=metric&appid=${
        import.meta.env.VITE_REACT_APP_WEATHER_API_KEY
      }`;
      const res = await axios.get(url);
      setData(res.data);
    };
    fetchDefaultLocation();
  }, []);

  const search = async () => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${
      import.meta.env.VITE_REACT_APP_WEATHER_API_KEY
    }`;

    try {
      const res = await axios.get(url);
      // console.log(res);
      if (res.data.cod !== 200) {
        setData({ notFound: true });
      } else {
        setData(res.data);
        setLocation("");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setData({ notFound: true });
      } else {
        console.log("An error occurred:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const getWeatherIcon = (weatherType) => {
    switch (weatherType) {
      case "Clear":
        return <i className="bx bx-sun"></i>;
      case "Clouds":
        return <i className="bx bx-cloud"></i>;
      case "Rain":
        return <i className="bx bx-cloud-rain"></i>;
      case "Thunderstorm":
        return <i className="bx bx-cloud-lightning"></i>;
      case "Snow":
        return <i className="bx bx-cloud-snow"></i>;
      case "Drizzle":
        return <i className="bx bx-cloud-drizzle"></i>;
      case "Squall":
      case "Tornado":
        return <i className="bx bx-wind"></i>;
      default:
        return <i className="bx bx-cloud"></i>;
    }
  };

  return (
    <div className="weather">
      <div className="search">
        <div className="search-top">
          <i className="fa-solid fa-location-dot"></i>
          <div className="location">{data.name}</div>
        </div>
        <div className="search-location">
          <input
            type="text"
            placeholder="Enter Location"
            value={location}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <i className="fa-solid fa-magnifying-glass" onClick={search}></i>
        </div>
      </div>
      {data.notFound ? (
        <div className="not-found">What&apos;s that 🤔</div>
      ) : (
        <div className="weather-data">
          {data.weather &&
            data.weather[0].main &&
            getWeatherIcon(data.weather[0].main)}
          <div className="weather-type">
            {data.weather ? data.weather[0].main : null}
          </div>
          <div className="temp">
            {data.main ? `${Math.floor(data.main.temp)}°C` : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
