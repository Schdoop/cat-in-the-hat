async function getWeather() {
    return await fetch('http://localhost:3000/weather');
}

export default getWeather;