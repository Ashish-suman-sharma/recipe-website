document.addEventListener('DOMContentLoaded', () => {
    const temperatureElement = document.getElementById('temperature');
    const locationElement = document.getElementById('location');

    // Fetch API key from config.js
    const apiKey = config.OPEN_WEATHER_API_KEY;

    // Function to fetch weather data
    function fetchWeatherData() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        const temp = data.main.temp;
                        const location = data.name;
                        temperatureElement.textContent = `${temp}°C`;
                        locationElement.textContent = location;
                    })
                    .catch(error => {
                        console.error('Error fetching weather data:', error);
                        temperatureElement.textContent = 'N/A';
                        locationElement.textContent = 'N/A';
                    });
            }, error => {
                console.error('Geolocation error:', error);
                temperatureElement.textContent = 'N/A';
                locationElement.textContent = 'N/A';
            });
        } else {
            temperatureElement.textContent = 'Geolocation not supported';
            locationElement.textContent = 'N/A';
        }
    }

    // Fetch weather data on page load
    fetchWeatherData();
});
