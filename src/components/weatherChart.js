import { Line } from "react-chartjs-2";
import { useEffect, useState, useMemo } from "react";
import getWeather from "./getWeather";
import { initialChartData } from "./initialChartData";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function WeatherChart() {
    const SPEED_DATASET = 0;
    const GUST_DATASET = 1;
    const FALL_DATASET = 2;

    const [serverData, setServerData] = useState(null);
    const [hatFallingSpeed, setHatFallingSpeed] = useState(15);

    const windSpeedDataSet = useMemo(
        () => ({
            label: "Wind Speed (m/s)",
            data: serverData ? serverData.map((item) => item.values.windSpeed) : [],
            fill: false,
            borderColor: "#742774"
        }),
        [serverData]
    );

    const windDustDataSet = useMemo(
        () => ({
            label: "Wind Gust (m/s)",
            data: serverData ? serverData.map((item) => item.values.windGust) : [],
            fill: false,
            borderColor: "#215690"
        }),
        [serverData]
    );

    const hatFallingSpeedDataSet = useMemo(
        () => ({
            label: "Hat will fall",
            data: serverData ? serverData.map(() => hatFallingSpeed) : [],
            fill: true,
            backgroundColor: "rgba(200, 50, 50, 0.5)",
            borderColor: "#FF0000"
        }),
        [hatFallingSpeed, serverData]
    );

    const labels = useMemo(
        () =>
            serverData
                ? serverData.map((item) =>
                    new Date(item.startTime).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                    })
                )
                : [],
        [serverData]
    );

    const chartData = useMemo(() => {
        if (!serverData) {
            return initialChartData;
        }

        return {
            labels,
            datasets: [windSpeedDataSet, windDustDataSet, hatFallingSpeedDataSet]
        };
    }, [
        windSpeedDataSet,
        windDustDataSet,
        hatFallingSpeedDataSet,
        labels,
        serverData
    ]);

    const [weather, setWeather] = useState(null);
    const [fallTime, setFallTime] = useState(null);

    const handleSpeedChange = (event) => {
        setHatFallingSpeed(event.target.value);
    };

    const checkTheFall = () => {
        if (weather === null) return;

        weather.datasets[FALL_DATASET].data.fill(hatFallingSpeed);
        let hatFallen = false;

        for (let i = 0; i < weather.labels.length; ++i) {
            const time = weather.labels[i];
            const speed = weather.datasets[SPEED_DATASET].data[i];
            const gust = weather.datasets[GUST_DATASET].data[i];
            if (!hatFallen && (hatFallingSpeed <= gust || hatFallingSpeed <= speed)) {
                setFallTime(time);
                hatFallen = true;
            }
        }

        if (!hatFallen) {
            setFallTime(null);
        }
    };

    useEffect(() => {
        getWeather().then(setServerData);
    }, []);

    useEffect(() => {
        checkTheFall();
    }, [hatFallingSpeed, weather]);

    if (!serverData) {
        return null;
    }

    return (
        <div>
            <div id="header">
                If the wind or gust speed is more than
                <input
                    type="number"
                    value={hatFallingSpeed}
                    onChange={handleSpeedChange}
                    id="speedInput"
                />
                m/s, the hat will {fallTime ? "fall " + fallTime : "never fall"}!
            </div>
            <div>
                <Line
                    data={chartData}
                    height={500}
                    options={{ maintainAspectRatio: false }}
                />
            </div>
        </div>
    );
}

export default WeatherChart;
