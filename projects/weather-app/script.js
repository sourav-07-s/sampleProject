const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityName");
const displayCityName = document.getElementById("displayCityName");
const tempEl = document.getElementById("temp");
const weatherEl = document.getElementById("weather");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const logo = document.getElementById("logo");
const searchBtn = document.getElementById("searchBtn");
const bgVideo = document.getElementById("bgVideo");


const VIDEOS = {
  night: "./assets/videos/night.mp4",
  rain: "./assets/videos/rain.mp4",
  clear: "./assets/videos/clear.mp4",
  clouds: "./assets/videos/clouds.mp4",
  snow: "./assets/videos/snow.mp4",
  default: "./assets/videos/sunny.mp4",
};


const NIGHT_FALLBACKS = ["clear", "default"];


const INPUT_CLASSES =
  "rounded-4xl p-2.5 flex-1 text-center font-semibold bg-white/10 text-white backdrop-blur-md border border-white/20 placeholder:text-white/60";
const BUTTON_CLASSES =
  "rounded-2xl px-5 h-10 cursor-pointer bg-white/10 text-white backdrop-blur-md border border-white/20";


let currentVideoKey = null;

function setWeatherTheme(condition, isNight) {
  const key = isNight && NIGHT_FALLBACKS.includes(condition) ? "night" : condition;

  if (key !== currentVideoKey) {
    currentVideoKey = key;
    bgVideo.src = VIDEOS[key] || VIDEOS.default;
    bgVideo.load(); 
    bgVideo.play().catch(() => {
     
    });
  }


  bgVideo.style.filter = isNight ? "brightness(0.5)" : "";

  bgVideo.classList.remove("hidden");
  document.body.classList.add("text-white");
  cityInput.className = INPUT_CLASSES;
  searchBtn.className = BUTTON_CLASSES;
}

function isAfterDark({ dt, sys: { sunrise, sunset } }) {
  if (!sunrise || !sunset) return false;
  return dt < sunrise || dt > sunset;
}

async function getWeather(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "No city by that name. Check the spelling and try again."
        : "Couldn't reach the weather service. Try again in a moment."
    );
  }

  return response.json();
}

function displayInfo(weatherData) {
  const {
    name: city,
    main: { temp, humidity },
    weather: [{ description }],
    wind: { speed },
  } = weatherData;

  const isNight = isAfterDark(weatherData);

  displayCityName.textContent = city;
  tempEl.textContent = Math.round(temp) + "°";
  weatherEl.textContent = description;
  humidityEl.textContent = `💧 Humidity: ${humidity}%`;
  windEl.textContent = `💨 Wind: ${speed} km/h`;

  if (description.includes("cloud")) {
    logo.textContent = isNight ? "☁️" : "⛅";
    setWeatherTheme("clouds", isNight);
  } else if (description.includes("rain") || description.includes("drizzle")) {
    logo.textContent = "🌧️";
    setWeatherTheme("rain", isNight);
  } else if (description.includes("clear")) {
    logo.textContent = isNight ? "🌙" : "☀️";
    setWeatherTheme("clear", isNight);
  } else if (description.includes("snow")) {
    logo.textContent = "❄️";
    setWeatherTheme("snow", isNight);
  } else {
    logo.textContent = isNight ? "🌙" : "🌤️";
    setWeatherTheme("default", isNight);
  }
}

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    alert("Enter a city name first.");
    return;
  }

  try {
    const weatherData = await getWeather(city);
    displayInfo(weatherData);
  } catch (error) {
    alert(error.message);
  }
});