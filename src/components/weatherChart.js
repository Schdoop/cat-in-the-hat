import {Line} from "react-chartjs-2";
import {useEffect, useState} from "react";
import getWeather from "./getWeather";
import {initialChartData} from "./initialChartData";

import {Chart, registerables} from 'chart.js';
Chart.register(...registerables);

function WeatherChart() {

    const SPEED_DATASET = 0;
    const GUST_DATASET = 1;
    const FALL_DATASET = 2;

    const [weather, setWeather] = useState(null);
    const [fallTime, setFallTime] = useState(null);
    const [hatFallingSpeed, setHatFallingSpeed] = useState(15);

    const updateWeather = (intervals) => {
        let updatedWeather = {
            labels: initialChartData.labels,
            datasets: initialChartData.datasets
        }

        intervals.forEach(item => {
            updatedWeather.labels.push(
                new Date(item.startTime).toLocaleString(
                    'en-US',
                    { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
                )
            );
            updatedWeather.datasets[SPEED_DATASET].data.push(item.values.windSpeed);
            updatedWeather.datasets[GUST_DATASET].data.push(item.values.windGust);
            updatedWeather.datasets[FALL_DATASET].data.push(hatFallingSpeed);
        });

        return updatedWeather;
    }

    const handleSpeedChange = (event) => {
        setHatFallingSpeed(event.target.value);
    }

    const checkTheFall = () => {
        if(weather === null) return;

        weather.datasets[FALL_DATASET].data.fill(hatFallingSpeed);
        let hatFallen = false;

        for(let i = 0; i < weather.labels.length; ++i) {
            const time = weather.labels[i];
            const speed = weather.datasets[SPEED_DATASET].data[i];
            const gust = weather.datasets[GUST_DATASET].data[i];
            if(!hatFallen && (hatFallingSpeed <= gust || hatFallingSpeed <= speed)) {
                setFallTime(time);
                hatFallen = true;
            }
        }

        if(!hatFallen) {
            setFallTime(null);
        }
    }

    useEffect(() => {
        getWeather()
            .then(res => {
                const updatedWeather = updateWeather(res);
                setWeather(updatedWeather);
            })
            .catch(e => {
                console.log('Error updating chart:', e)
            });
    }, []);

    useEffect( () => {
        checkTheFall();
    }, [hatFallingSpeed, weather]);

    return (
        <div>
            <div id='header'>
                If the wind or gust speed is more than 
                <input type="number" value={hatFallingSpeed} onChange={handleSpeedChange} id='speedInput' />,
                the hat will {fallTime ? 'fall' + fallTime : 'never fall'}!
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