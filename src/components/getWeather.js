async function getWeather() {
    const result = await fetch('https://schdoop.dev:8443/weather');
    const json = await result.json();
    return json.data.timelines[0].intervals;
}

export default getWeather;