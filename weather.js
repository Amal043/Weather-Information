let forecastDataCache = [];

async function getWeather() {
    const cityInput = document.getElementById('cityInput').value.trim();
    const apiKey = '623d9905aff6dd3fcd162f0c70a25178';
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityInput)}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityInput)}&appid=${apiKey}&units=metric`;

    const resultDiv = document.getElementById('weatherResult');
    const toggleButton = document.getElementById('forecastToggle');
    const forecastContainer = document.getElementById('forecastContainer');

    resultDiv.innerHTML = 'Loading...';
    forecastContainer.style.display = 'none';
    toggleButton.style.display = 'none';

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        if (currentData.cod !== 200) throw new Error(currentData.message);
        if (forecastData.cod !== "200") throw new Error(forecastData.message);

        const emoji = getWeatherEmoji(currentData.weather[0].main.toLowerCase());
        forecastDataCache = get3DayForecast(forecastData.list); // forecast for later

        resultDiv.innerHTML = `
            <h2>${currentData.name}, ${currentData.sys.country}</h2>
            <div style="font-size: 3em;">${emoji}</div>
            <p><b>Temperature:</b> ${currentData.main.temp}°C</p>
            <p><b>Weather:</b> ${currentData.weather[0].description}</p>
            <p><b>Humidity:</b> ${currentData.main.humidity}%</p>
            <p><b>Wind Speed:</b> ${currentData.wind.speed} m/s</p>
        `;

        toggleButton.style.display = 'inline-block';
    } catch (error) {
        console.error('Error:', error.message);
        resultDiv.innerHTML = `<p style="color:black;">Error: ${error.message}</p>`;
    }
}

function showForecast() {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = `<h3>Next 3 Days Forecast</h3>` + forecastDataCache.map(day => `
        <div class="forecast-day">
            <b>${day.date}</b><br>
            <div style="font-size: 2em;">${getWeatherEmoji(day.weather)}</div>
            <div>${day.temp}°C</div>
            <small>${capitalize(day.weather)}</small>
        </div>
    `).join('');
    container.style.display = 'block';
}

function get3DayForecast(forecastList) {
    const dailyData = {};
    forecastList.forEach(entry => {
        const date = entry.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(entry);
    });

    const dates = Object.keys(dailyData).slice(1, 4);
    return dates.map(date => {
        const temps = dailyData[date].map(e => e.main.temp);
        const weathers = dailyData[date].map(e => e.weather[0].main.toLowerCase());
        return {
            date,
            temp: Math.round(temps.reduce((a, b) => a + b) / temps.length),
            weather: mostCommon(weathers)
        };
    });
}

function mostCommon(arr) {
    const freq = {};
    arr.forEach(val => freq[val] = (freq[val] || 0) + 1);
    return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
}

function getWeatherEmoji(condition) {
    if (condition.includes("clear")) return "☀️";
    if (condition.includes("cloud")) return condition.includes("few") || condition.includes("scattered") ? "🌤️" : "☁️";
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("thunderstorm")) return "⛈️";
    if (condition.includes("snow")) return "❄️";
    if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) return "🌫️";
    return "🌡️";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}





