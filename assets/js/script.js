// Global variables
var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'e903685476086266bcbebc1aa169ae7c';

// DOM element references
var searchButton = document.querySelector('#search-button');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today-container');
var forecastContainer = document.querySelector('#weekly-forecast');
var searchHistoryContainer = document.querySelector('#searched-cities');

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Function to display the search history list.
function renderSearchHistory() {
  searchHistoryContainer.innerHTML = '';
  /*CLEAR SEARCHHISTORYCONTAINER*/


  // Start at end of history array and count down to show the most recent at the top.
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    /*CREATE BTN*/
    var btn = document.createElement("button");
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-controls', 'today forecast');
    btn.classList.add('btn-light', 'btn-history');

    // `data-search` allows access to city name when click handler is invoked
    btn.setAttribute('data-search', searchHistory[i]);
    btn.textContent = searchHistory[i];
    /*APPEND BTN*/;
    searchHistoryContainer.appendChild(btn);
  }
};

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) {
  console.log(searchHistory);
  console.log(search);
  
  // If there is no search term return the function
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  // else if (searchHistory.includes("Richmond")) {
  //   return;
  // }
  searchHistory.push(search);
  /*SET IN LOCALSTORAGE*/
  localStorage.setItem('search-history', JSON.stringify(searchHistory));
  renderSearchHistory();
};

// Function to get search history from local storage
function initSearchHistory() {
  var storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    // Sets the global var of searchHistory to whatever localstorage had if any
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
};

// Function to display the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather, timezone) {
  console.log(city);
  console.log(weather);
  console.log(timezone);
  var date = dayjs().tz(timezone).format('M/D/YYYY');

  // Store response data from our fetch request in variables
  var tempF = weather.temp;
  var windMph = weather.wind_speed;
  var humidity = weather.humidity;
  var uvi = weather.uvi;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  console.log(tempF);
  console.log(windMph);
  console.log(humidity);
  console.log(uvi);
  console.log(iconUrl);

  // Create the UI elements as variables
  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var heading = document.createElement("h2");
  var weatherIconSpanEl = document.createElement("span")
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");
  var uvEl = document.createElement("p");
  var uviBadge = document.createElement("span");

  card.setAttribute('id', 'today-container-card');
  card.setAttribute('class', 'today-container-card')
  cardBody.setAttribute('id', 'today-container-card-body');
  cardBody.setAttribute('class', 'today-container-card-body');

  heading.textContent = city + " (" + date + ")";
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('class', 'weather-img');
  weatherIconSpanEl.appendChild(weatherIcon);
  heading.appendChild(weatherIconSpanEl);
  tempEl.textContent = "Temp: " + tempF + "°F";
  windEl.textContent = "Wind: " + windMph + " MPH";
  humidityEl.textContent = "Humidity: " + humidity + "%";
  uvEl.textContent = 'UV Index: ';
  uviBadge.classList.add('btn', 'btn-sm');

  /* Uses a condition to check the UV levels*/
  if (uvi < 3) {
    uviBadge.classList.add('btn-success');
  } else if (uvi < 7) {
    uviBadge.classList.add('btn-warning');
  } else {
    uviBadge.classList.add('btn-danger');
  }

  uviBadge.textContent = uvi;
  uvEl.appendChild(uviBadge);
  cardBody.appendChild(heading);
  cardBody.appendChild(tempEl);
  cardBody.appendChild(windEl);
  cardBody.appendChild(humidityEl);
  cardBody.appendChild(uvEl);
  
  card.appendChild(cardBody);

  todayContainer.innerHTML = "";
  todayContainer.append(card);
};

// Function to display a forecast card given an object from open weather api
// daily forecast.
function renderForecastCard(forecast, timezone) {
  console.log(forecast);
  // variables for data from api
  var unixTs = forecast.dt;
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var tempF = forecast.temp.day;
  var humidity = forecast.humidity;
  var windMph = forecast.wind_speed;

  // Create elements for a card
  var col = document.createElement("div");
  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var cardTitle = document.createElement("h4");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  col.appendChild(card);
  card.appendChild(cardBody);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(weatherIcon);
  cardBody.appendChild(tempEl);
  cardBody.appendChild(windEl);
  cardBody.appendChild(humidityEl);
  
  card.setAttribute('class', 'div-day-conditions');
  cardBody.setAttribute('class', 'day-conditions');

  // Add content to elements
  cardTitle.textContent = dayjs.unix(unixTs).tz(timezone).format('M/D/YYYY');
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = "Temp: " + tempF + "°F";
  windEl.textContent = "Wind: " + windMph + " MPH";
  humidityEl.textContent = "Humidity: " + humidity + "%";

  forecastContainer.appendChild(col);
}

// Function to display 5 day forecast.
function renderForecast(dailyForecast, timezone) {
  // Create unix timestamps for start and end of 5 day forecast
  var startDt = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
  var endDt = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();

  // Create elements
  var headingCol = document.createElement("div");
  var heading = document.createElement("h3");

  heading.textContent = '5-Day Forecast:';
  headingCol.appendChild(heading);

  forecastContainer.innerHTML = '';
  forecastContainer.appendChild(headingCol);
  for (var i = 0; i < dailyForecast.length; i++) {
    // The api returns forecast data which may include 12pm on the same day and
    // always includes the next 7 days. The api documentation does not provide
    // information on the behavior for including the same day. Results may have
    // 7 or 8 items.
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
      console.log(dailyForecast[i]);
      renderForecastCard(dailyForecast[i], timezone);
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.current, data.timezone);
  renderForecast(data.daily, data.timezone);
};

// Fetches weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.
function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;
  var apiUrl = `${weatherApiRootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`;

  /*FETCH APIURL*/
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    /*.THEN() CONVERT THE RESPONSE FROM JSON*/
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
};

function fetchCoords(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  /*FETCH APIURL*/
  fetch(apiUrl)
    /*.THEN() CONVERT THE RESPONSE FROM JSON*/
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
};

function handleSearchFormSubmit(e) {
  // Don't continue if there is nothing in the search form
  if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  fetchCoords(search);
  searchInput.value = '';
};

function handleSearchHistoryClick(e) {
  // Don't do search if current elements is not a search history button
  if (!e.target.matches('.btn-history')) {
    return;
  }

  var btn = e.target;
  var search = btn.getAttribute('data-search');
  console.log(search);

  fetchCoords(search);
};

initSearchHistory();
searchButton.addEventListener('click', handleSearchFormSubmit);
searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
