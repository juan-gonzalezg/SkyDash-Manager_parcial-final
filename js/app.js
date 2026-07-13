"use strict";

// ---------- Elementos DOM ----------
const welcomeScreen = document.getElementById("welcome-screen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginSpinner = document.getElementById("login-spinner-container");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

const mapContainer = document.getElementById("map-container");
const latSpan = document.getElementById("lat");
const lngSpan = document.getElementById("lng");
const locationNameSpan = document.getElementById("location-name");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchSpinner = document.getElementById("search-spinner");
const searchText = document.getElementById("search-text");

// Detalle Meteorológico
const weatherIcon = document.getElementById("weather-icon");
const weatherTemp = document.getElementById("weather-temp");
const weatherDesc = document.getElementById("weather-desc");
const humiditySpan = document.getElementById("humidity");
const windSpan = document.getElementById("wind");
const pressureSpan = document.getElementById("pressure");

// Pronóstico de 7 días
const forecastList = document.getElementById("forecast-list");

// Gestión de ubicaciones
const savedLocationsList = document.getElementById("saved-locations-list");
const saveLocationBtn = document.getElementById("save-location-btn");
const saveFeedback = document.getElementById("save-feedback");

// Banners e Indicadores
const offlineBanner = document.getElementById("offline-banner");
const themeLight = document.getElementById("theme-light");
const themeDark = document.getElementById("theme-dark");
const toastContainer = document.getElementById("toast-container");

// ---------- Estado de la Aplicación ----------
let currentLat = 10.4632;
let currentLng = -66.9758;
let currentLocationName = "Caracas (UCAB Montalbán), Venezuela";
let map = null;
let marker = null;
let isOffline = !navigator.onLine;

// Mapas de códigos climáticos oficiales de Open-Meteo
const WEATHER_EMOJIS = {
  0: "☀️", // Despejado
  1: "🌤️", // Mayormente despejado
  2: "⛅", // Parcialmente nublado
  3: "☁️", // Nublado
  45: "🌫️", // Niebla
  48: "🌫️", // Niebla con escarcha
  51: "🌧️", // Llovizna ligera
  53: "🌧️", // Llovizna moderada
  55: "🌧️", // Llovizna densa
  61: "🌧️", // Lluvia ligera
  63: "🌧️", // Lluvia moderada
  65: "🌧️", // Lluvia fuerte
  71: "❄️", // Nevada ligera
  73: "❄️", // Nevada moderada
  75: "❄️", // Nevada fuerte
  77: "🌨️", // Granos de nieve
  80: "🌧️", // Chubascos ligeros
  81: "🌧️", // Chubascos moderados
  82: "🌧️", // Chubascos fuertes
  95: "⛈️", // Tormenta ligera
  96: "⛈️", // Tormenta con granizo ligero
  99: "⛈️", // Tormenta con granizo fuerte
};

const WEATHER_DESCRIPTIONS = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla densa",
  48: "Niebla escarchada",
  51: "Llovizna ligera",
  53: "Llovizna templada",
  55: "Llovizna persistente",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia torrencial",
  71: "Nieve intermitente",
  73: "Nevada moderada",
  75: "Nevada intensa",
  77: "Granizo fino",
  80: "Chubascos suaves",
  81: "Chubascos intensos",
  82: "Chubascos severos",
  95: "Tormenta eléctrica",
  96: "Tormenta de granizo",
  99: "Tormenta eléctrica violenta",
};

function getWeatherEmoji(code) {
  return WEATHER_EMOJIS[code] || "🌈";
}

function getWeatherDescription(code) {
  return WEATHER_DESCRIPTIONS[code] || "Condición desconocida";
}

// ---------- Sistema de Notificación Toast (Reemplaza a alert) ----------
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
          <span>${message}</span>
          <button style="background:transparent; border:none; color:inherit; font-weight:bold; cursor:pointer; margin-left:12px;">✕</button>
        `;
  toastContainer.appendChild(toast);

  const closeBtn = toast.querySelector("button");
  closeBtn.addEventListener("click", () => toast.remove());

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 4000);
}

// ---------- Geocodificación Inversa (Nominatim) ----------
async function reverseGeocode(lat, lng) {
  if (isOffline) {
    return `Ubicación Offline (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&accept-language=es`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SkyDash-Manager/2.0 (ucab-academic-project)",
      },
    });
    if (!response.ok) throw new Error("Fallo de red en Nominatim");
    const data = await response.json();
    if (data && data.address) {
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.suburb ||
        "";
      const country = data.address.country || "";
      return city
        ? `${city}, ${country}`
        : data.display_name.split(",").slice(0, 2).join(",") ||
            `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.warn("Error en reverseGeocode:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// ---------- Búsqueda de Ubicación Geográfica ----------
async function geocodeSearch(query) {
  if (isOffline) {
    showToast("La búsqueda requiere conexión a internet activa.", "error");
    return null;
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=es`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SkyDash-Manager/2.0 (ucab-academic-project)",
      },
    });
    if (!response.ok) throw new Error("Fallo de API Nominatim");
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        name: data[0].display_name.split(",").slice(0, 2).join(","),
      };
    }
    return null;
  } catch (error) {
    console.error("Error buscando ubicación:", error);
    return null;
  }
}

// ---------- Obtención de Clima Real desde Open-Meteo ----------
async function fetchWeather(lat, lng) {
  if (isOffline) return null;
  try {
    // Solicitamos datos reales específicos de las métricas solicitadas
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error en Open-Meteo");
    return await response.json();
  } catch (error) {
    console.warn("Fallo cargando clima en vivo:", error);
    return null;
  }
}

// ---------- Renderizado de la Interfaz de Clima ----------
function updateWeatherUI(weatherData) {
  if (!weatherData) {
    // Mostrar indicativo de vacío o fallas
    weatherIcon.textContent = "⚠️";
    weatherTemp.textContent = "--";
    weatherDesc.textContent = "Datos no disponibles";
    humiditySpan.textContent = "--%";
    windSpan.textContent = "-- km/h";
    pressureSpan.textContent = "-- hPa";
    forecastList.innerHTML = "<li>Sin conexión para pronósticos</li>";
    return;
  }

  const current = weatherData.current;
  const daily = weatherData.daily;

  // Clima en Tiempo Real
  const code = current.weather_code;
  const emoji = getWeatherEmoji(code);
  weatherIcon.textContent = emoji;
  weatherTemp.textContent = `${Math.round(current.temperature_2m)} °C`;
  weatherDesc.textContent = getWeatherDescription(code);

  // Métricas 100% reales solicitadas por la UCAB
  humiditySpan.textContent = `${current.relative_humidity_2m}%`;
  windSpan.textContent = `${current.wind_speed_10m} km/h`;
  pressureSpan.textContent = `${Math.round(current.surface_pressure)} hPa`;

  // Marcador Dinámico de Leaflet
  if (marker) {
    const customIcon = L.divIcon({
      html: emoji,
      className: "custom-leaflet-marker",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
    marker.setIcon(customIcon);
  }

  // Renderizado del Pronóstico de 7 Días (Requisito Jerárquico)
  if (daily && daily.time) {
    let htmlContent = "";
    for (let i = 0; i < daily.time.length; i++) {
      const date = new Date(daily.time[i] + "T00:00:00");
      const dayOfWeek = date.toLocaleDateString("es-ES", {
        weekday: "long",
      });
      const capitalizedDay =
        dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
      const dailyCode = daily.weather_code[i];
      const dailyEmoji = getWeatherEmoji(dailyCode);
      const tMax = Math.round(daily.temperature_2m_max[i]);
      const tMin = Math.round(daily.temperature_2m_min[i]);

      htmlContent += `
              <li class="forecast-day">
                <span class="day-name">${capitalizedDay}</span>
                <span class="day-icon">${dailyEmoji}</span>
                <span class="day-temp">${tMax}° / ${tMin}°</span>
                <span class="day-desc">${getWeatherDescription(dailyCode)}</span>
              </li>
            `;
    }
    forecastList.innerHTML = htmlContent;
  } else {
    forecastList.innerHTML =
      "<li>Pronóstico no disponible transitoriamente</li>";
  }
}

// ---------- Cargar Ubicación Dinámicamente ----------
async function loadLocation(lat, lng, name = null) {
  currentLat = lat;
  currentLng = lng;

  if (!name) {
    currentLocationName = await reverseGeocode(lat, lng);
  } else {
    currentLocationName = name;
  }

  locationNameSpan.textContent = currentLocationName;
  latSpan.textContent = lat.toFixed(4);
  lngSpan.textContent = lng.toFixed(4);

  // Actualizar vista del mapa e icono del marcador
  if (map) {
    map.setView([lat, lng], 12);
    if (!marker) {
      marker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: "☀️",
          className: "custom-leaflet-marker",
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        }),
      }).addTo(map);
    } else {
      marker.setLatLng([lat, lng]);
    }
  }

  // Obtener clima de forma asíncrona
  const weatherData = await fetchWeather(lat, lng);
  if (weatherData) {
    updateWeatherUI(weatherData);
    // Caché local para persistencia resiliente
    try {
      const cacheKey = `weather_${lat.toFixed(4)}_${lng.toFixed(4)}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          name: currentLocationName,
          weather: weatherData,
          timestamp: Date.now(),
        }),
      );
      localStorage.setItem(
        "lastSearchedLocation",
        JSON.stringify({ lat, lng, name: currentLocationName }),
      );
    } catch (err) {
      console.error("Fallo de almacenamiento de caché:", err);
    }
  } else {
    // Intentar rescatar desde la caché local multi-ubicación en modo offline
    const cacheKey = `weather_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      try {
        const parsed = JSON.parse(cachedItem);
        updateWeatherUI(parsed.weather);
        showToast(
          "Mostrando datos de la última sincronización guardada offline.",
          "info",
        );
      } catch (e) {
        updateWeatherUI(null);
      }
    } else {
      updateWeatherUI(null);
    }
  }
}

// ---------- Inicializador de Mapas Leaflet (GIS) ----------
function initMap() {
  if (map) return; // Ya se encuentra instanciado

  map = L.map(mapContainer).setView([currentLat, currentLng], 12);

  // Capa de mosaicos estéticos de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Añadir marcador principal dinámico
  marker = L.marker([currentLat, currentLng], {
    icon: L.divIcon({
      html: "☀️",
      className: "custom-leaflet-marker",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    }),
  }).addTo(map);

  // Control del Evento Clic en el Mapa (Georreferenciación)
  map.on("click", async function (e) {
    const { lat, lng } = e.latlng;
    await loadLocation(lat, lng);
  });
}

// ---------- Gestión de Favoritos LocalStorage ----------
function getSavedLocations() {
  try {
    const list = localStorage.getItem("skyDashFavorites");
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
}

function saveLocationsToStorage(locations) {
  try {
    localStorage.setItem("skyDashFavorites", JSON.stringify(locations));
  } catch (e) {}
}

function renderSavedLocations() {
  const locations = getSavedLocations();
  if (locations.length === 0) {
    savedLocationsList.innerHTML = `<li style="padding: 15px; color: var(--text-muted); font-style: italic; grid-column: 1/-1; text-align: center;">No posees ubicaciones agregadas a favoritos.</li>`;
    return;
  }

  savedLocationsList.innerHTML = locations
    .map(
      (loc, idx) => `
          <li class="saved-item">
            <div class="saved-info">
              <h4>${loc.name}</h4>
              <p>Lat: ${loc.lat.toFixed(3)} | Lng: ${loc.lng.toFixed(3)}</p>
            </div>
            <div class="saved-actions">
              <button class="btn-small load" data-lat="${loc.lat}" data-lng="${loc.lng}" data-name="${loc.name}">Cargar</button>
              <button class="btn-small delete" data-index="${idx}">Eliminar</button>
            </div>
          </li>
        `,
    )
    .join("");

  // Delegación de Eventos en Favoritos
  savedLocationsList.querySelectorAll(".load").forEach((btn) => {
    btn.addEventListener("click", function () {
      const lat = parseFloat(this.dataset.lat);
      const lng = parseFloat(this.dataset.lng);
      const name = this.dataset.name;
      loadLocation(lat, lng, name);
      showToast(`Cargando información favorita: ${name}`, "success");
      // Efecto scroll sutil para mobile
      if (window.innerWidth < 992) {
        document
          .getElementById("map-section")
          .scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  savedLocationsList.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.dataset.index);
      const locations = getSavedLocations();
      const removed = locations.splice(index, 1);
      saveLocationsToStorage(locations);
      renderSavedLocations();
      showToast(`Ubicación removida de favoritos: ${removed[0].name}`, "info");
    });
  });
}

// ---------- Manejo del Formulario de Autenticación ----------
function handleLogin(e) {
  e.preventDefault();
  const userVal = document.getElementById("username").value.trim();
  const passVal = document.getElementById("password").value.trim();

  // Limpiar errores previos
  loginError.style.display = "none";
  loginSpinner.style.display = "flex";

  // Simulación asíncrona robusta (spinners y feedback obligado por el enunciado)
  setTimeout(() => {
    loginSpinner.style.display = "none";
    if (userVal === "admin" && passVal === "admin") {
      // Guardar Estado
      localStorage.setItem("skyDashSessionToken", "token_demo_seguro_2026");

      // Animación y visualización
      welcomeScreen.style.display = "none";
      dashboard.style.display = "block";

      // Inicialización de componentes interactivos
      initMap();
      renderSavedLocations();

      // Restaurar última búsqueda guardada si existe
      const lastSearch = localStorage.getItem("lastSearchedLocation");
      if (lastSearch) {
        try {
          const parsed = JSON.parse(lastSearch);
          loadLocation(parsed.lat, parsed.lng, parsed.name);
        } catch (e) {
          loadLocation(currentLat, currentLng, currentLocationName);
        }
      } else {
        loadLocation(currentLat, currentLng, currentLocationName);
      }

      showToast("Autenticado con éxito. ¡Bienvenido!", "success");
    } else {
      loginError.style.display = "block";
      loginError.textContent =
        "Credenciales incorrectas de demostración. Intenta con usuario 'admin' y clave 'admin'.";
      showToast("Acceso denegado. Revisa tus credenciales.", "error");
    }
  }, 1200);
}

// Cierre de Sesión Seguro (Eliminar tokens y retornar a bienvenida)
function handleLogout() {
  localStorage.removeItem("skyDashSessionToken");
  dashboard.style.display = "none";
  welcomeScreen.style.display = "block";
  loginForm.reset();

  // Destruir mapa Leaflet para re-crearlo limpiamente en futuros logins
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
  showToast("Sesión cerrada con éxito. Datos temporales limpiados.", "info");
}

// ---------- Gestión de Modos Duales (Claro / Oscuro) ----------
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeDark.classList.add("active");
    themeLight.classList.remove("active");
    localStorage.setItem("skyDashThemePreference", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeLight.classList.add("active");
    themeDark.classList.remove("active");
    localStorage.setItem("skyDashThemePreference", "light");
  }
}

// ---------- Monitoreo de Conexión de Red (Offline/Online) ----------
function updateNetworkStatus() {
  isOffline = !navigator.onLine;
  if (isOffline) {
    offlineBanner.style.display = "block";
    showToast(
      "Has perdido la conexión a internet. Cambiando a modo de resiliencia fuera de línea.",
      "error",
    );
  } else {
    offlineBanner.style.display = "none";
    showToast(
      "Conexión a internet restablecida. Sincronizando datos meteorológicos en tiempo real.",
      "success",
    );
    // Re-cargar la ubicación actual en vivo al volver online
    loadLocation(currentLat, currentLng, currentLocationName);
  }
}

// ---------- Registro de Escuchas de Eventos ----------
document.addEventListener("DOMContentLoaded", function () {
  // Carga de Tema Configurado previamente
  const savedTheme = localStorage.getItem("skyDashThemePreference") || "light";
  applyTheme(savedTheme);

  // Control de Sesión Persistente
  const token = localStorage.getItem("skyDashSessionToken");
  if (token) {
    welcomeScreen.style.display = "none";
    dashboard.style.display = "block";
    initMap();
    renderSavedLocations();

    // Restaurar ubicación
    const lastLoc = localStorage.getItem("lastSearchedLocation");
    if (lastLoc) {
      try {
        const parsed = JSON.parse(lastLoc);
        loadLocation(parsed.lat, parsed.lng, parsed.name);
      } catch (err) {
        loadLocation(currentLat, currentLng, currentLocationName);
      }
    } else {
      loadLocation(currentLat, currentLng, currentLocationName);
    }
  } else {
    welcomeScreen.style.display = "block";
    dashboard.style.display = "none";
  }

  // Formularios y Login
  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);

  // Control de Temas
  themeLight.addEventListener("click", () => applyTheme("light"));
  themeDark.addEventListener("click", () => applyTheme("dark"));

  // Buscador de Localización
  searchBtn.addEventListener("click", async function () {
    const query = searchInput.value.trim();
    if (!query) {
      showToast("Escribe una ciudad o lugar para buscar.", "info");
      return;
    }

    // Visualización de carga
    searchSpinner.style.display = "inline-block";
    searchText.style.display = "none";
    searchBtn.disabled = true;

    const result = await geocodeSearch(query);

    searchSpinner.style.display = "none";
    searchText.style.display = "inline";
    searchBtn.disabled = false;

    if (result) {
      await loadLocation(result.lat, result.lng, result.name);
      showToast(`Ubicada con éxito: ${result.name}`, "success");
    } else {
      showToast(
        "No pudimos hallar esta ubicación. Prueba especificando el país o revisa la ortografía.",
        "error",
      );
    }
  });

  // Búsqueda al pulsar Enter
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  // Almacenar en Favoritos
  saveLocationBtn.addEventListener("click", function () {
    const favorites = getSavedLocations();

    // Evitar duplicados analizando coordenadas cercanas (aproximadas a 3 decimales)
    const alreadyExists = favorites.some(
      (loc) =>
        loc.lat.toFixed(3) === currentLat.toFixed(3) &&
        loc.lng.toFixed(3) === currentLng.toFixed(3),
    );

    if (alreadyExists) {
      showToast(
        "Esta localización ya se encuentra almacenada en tu colección privada.",
        "info",
      );
      return;
    }

    favorites.push({
      lat: currentLat,
      lng: currentLng,
      name: currentLocationName,
    });

    saveLocationsToStorage(favorites);
    renderSavedLocations();

    saveFeedback.textContent = "¡Ubicación guardada con éxito!";
    saveFeedback.style.color = "var(--success-color)";
    showToast(`Guardada en favoritos: ${currentLocationName}`, "success");

    setTimeout(() => {
      saveFeedback.textContent = "";
    }, 3000);
  });

  // Escuchar cambios de conectividad física
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);

  // Comprobar estado inicial de red
  if (isOffline) {
    offlineBanner.style.display = "block";
  }
});
