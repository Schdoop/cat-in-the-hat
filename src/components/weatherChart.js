import {Line} from "react-chartjs-2";
import {useEffect, useState} from "react";
import getWeather from "./getWeather";
import {Chart, registerables} from 'chart.js';
Chart.register(...registerables);

function WeatherChart() {

    let initialChartData = {
        labels: [],
        datasets: [
            {
                label: "Wind Speed (m/s)",
                data: [],
                fill: false,
                borderColor: "#742774"
            },
            {
                label: "Wind Gust (m/s)",
                data: [],
                fill: false,
                borderColor: "#215690"
            },
            {
                label: "Hat will fall",
                data: [],
                fill: true,
                backgroundColor: "#FF9999",
                borderColor: "#FF0000",
            }
        ]
    };

    let [weather, setWeather] = useState(null);
    let [fallTime, setFallTime] = useState('never fall');
    let [hatFallingSpeed, setHatFallingSpeed] = useState(15);

    const fetchData = async () => {
        const result = await getWeather();
        const json = await result.json();
        const intervals = json.data.timelines[0].intervals;

        intervals.forEach(item => {
            initialChartData.labels.push(
                new Date(item.startTime).toLocaleString(
                    'en-US',
                    { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
                )
            );
            initialChartData.datasets[0].data.push(item.values.windSpeed);
            initialChartData.datasets[1].data.push(item.values.windGust);
            initialChartData.datasets[2].data.push(hatFallingSpeed);

        });
        setWeather(initialChartData);
        checkTheFall();
    }

    const handleSpeedChange = (event) => {
        setHatFallingSpeed(event.target.value);
    }

    const checkTheFall = () => {
        if(!weather) {
            weather = initialChartData;
        }

        weather.datasets[2].data.fill(hatFallingSpeed);
        let hatFallen = false;

        for(let i = 0; i < weather.labels.length; ++i) {
            const time = weather.labels[i];
            const speed = weather.datasets[0].data[i];
            const gust = weather.datasets[1].data[i];
            if(!hatFallen && (hatFallingSpeed <= gust || hatFallingSpeed <= speed)) {
                setFallTime(`fall ${time}`);
                hatFallen = true;
            }
        }

        if(!hatFallen) {
            setFallTime('never fall');
        }
    }

    useEffect(() => {
        fetchData()
            .then(r => console.log('Chart updated'))
            .catch(e => console.log('Error updating chart:', e));
    }, []);

    useEffect( () => {
        checkTheFall();
    }, [hatFallingSpeed]);

    return (
        <div>
            <div id='header'>
                If the wind or gust speed is more than 
                <input type="number" value={hatFallingSpeed} onChange={handleSpeedChange} id='speedInput' />,
                the hat will {fallTime}!
            </div>
            <div>
                {weather &&
                    <Line
                        data={weather}
                        height={500}
                        options={{ maintainAspectRatio: false }}
                    />}
            </div>
        </div>
    )
}

export default WeatherChart;