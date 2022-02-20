async function getWeather() {
    const result = await fetch('http://localhost:3000/weather');
    const json = await result.json();
    return json.data.timelines[0].intervals;
}

export default getWeather;