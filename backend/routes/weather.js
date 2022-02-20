const fetch = require("node-fetch");
const fs = require('fs');
const express = require('express');
const router = express.Router();

const getWeatherData = async () => {
    const postTimelinesURL = "https://api.tomorrow.io/v4/timelines";
    const apikey = "Od0r1DrKCiBLt7WP1LdKqlX46p2ZXe5h";
    const location = "44.2704863,-71.305348";
    const startTime = new Date(new Date().getTime()+(2*24*3600*1000)).toISOString(); // two days from now

    const data = await fetch(postTimelinesURL + `?apikey=${apikey}&location=${location}`
        + `&startTime=${startTime}&fields=windGust&fields=windSpeed&units=metric&timezone=America/New_York`
        + '&timesteps=1h');

    return await data.json();
};

const cachePath = 'cache/cache.json';

router.get('/', function (req, res, next) {
    let result = '';
    try {
        const stats = fs.statSync(cachePath);
        if(new Date().getTime() - new Date(stats.mtime).getTime() < 3600 * 1000) {
            console.log('Cache is less than 1 hour old, doesn\'t need update');
            result = fs.readFileSync(cachePath, 'utf8');
            res.send(result);
            return;
        }
    } catch (error) {
        console.log(error);
    }

    getWeatherData()
        .then(r => {
            if (r.data !== undefined) {
                result = JSON.stringify(r);
                fs.writeFileSync(cachePath, result, 'utf8');
            } else {
                result = fs.readFileSync(cachePath, 'utf8');
                console.log('Limits are reached, reading from cache...');
            }
            res.send(result);
        })
        .catch(e => {
            res.send(e);
        });
});

module.exports = router;
