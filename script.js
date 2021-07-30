// A distribution is a discrete function that represent a pattern of activity.
// Although this is not always the case with my implementations there are a few expectations for a distribution function:
//  1. the sum of the function over the interval[0, days] should be 1.
//  2. The function should be deterministic for a given set of inputs (an optional randomizer configuation variable is passed in)
const DISTRIBUTIONS = {
    uniform: (_day, days, _randomizer) => 1 / days,
    weekends: (day, days, _randomizer) => {
        if (dayToWeekday(day) === "Sa" || dayToWeekday(day) === "Su")
            return 1.33/days
        else
            return 0.66/days
    },
    sinusoidal: (day, days, randomizer) => {
        return (1 + Math.sin(day/(4 * randomizer * Math.PI) + map(randomizer, 0, 1, 0, Math.PI)))/ (days)
    },
    linear: (day, days, randomizer) => {
        return (1 - map(day, 0, days, 0 + randomizer / 5, 1 - randomizer /5)) / days
    }
}

generate();

function generate() {
    const TOTAL_TALLIES = 300
    const DAYS = 31
    let tallies = []
    //the current tally
    let current;

    let save = document.getElementById("save");
    let gen = document.getElementById("gen");
    let times = document.getElementById("times");
    let skip = document.getElementById("skip");
    let clear = document.getElementById("clear");
    let download = document.getElementById("download");
    let label = document.getElementById("label")

    regenData()

    save.onclick = () => {
        tallies.push({ "tally": current, "label": label.value });
        regenData()
    }

    skip.onclick = () => {
        regenData()
    }

    clear.onclick = () => {
        tallies = []
    }

    download.onclick = () => {
        downloadJSON(tallies, "tallies")
    }

    label.onkeypress = e => {
        if (e.key === "Enter")
            save.click()
    }

    label.onkeyup = e => {
        if (e.key == "Backspace")
            skip.click()
    }

    window.onresize = () => {
        drawData(current)
    }

    //generate new batch of data using a random distribution and draw it
    function regenData() {
        label.value = ""
        let distribution = Math.round(Math.random() * 4)
        current = generateData(TOTAL_TALLIES, Object.values(DISTRIBUTIONS).distribution, DAYS);
        label.value = Object.keys(DISTRIBUTIONS)[distribution]
        drawData(current);
    }

    //autogenerate the given number of tallies
    gen.onclick = () => {
        for (let i = 0; i < times.value; i++) {
            let dataPoints = map(Math.random(), 0, 1, 20, 250)
            let distribution = Object.keys(DISTRIBUTIONS)[Math.round(Math.random() * 3)]

            current = generateData(dataPoints, DISTRIBUTIONS[distribution])

            label.value = distribution
            tallies.push({ tally: current, label: distribution })
            
            console.log(`${i}: ${distribution}, ${dataPoints}`)
        }
        drawData(current)
    }
}

function drawData(data) {
    
    let margin = { top: 30, right: 30, bottom: 70, left: 30 }
    
    let width = window.innerWidth - margin.left - margin.right
    let height = 500 - margin.top - margin.bottom

    let count = countPerDay(data);
    
    // modified from https://www.d3-graph-gallery.com/graph/barplot_basic.html
    // append the svg object to the body of the page
    d3.select("#chart").selectAll('svg').remove()
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(count.map((d, i) => `${d.day} ${i}`))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(count.map(c => c.count)) * 1.05])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("bar")
        .data(count)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(`${d.day} ${i}`))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", d => (d.day === "Sa" || d.day === "Su") ? "#ccaa00":  "#69b3a2")

}

//generate a tally from the given number of data points, the distribution function, and number of days
function generateData(dataPoints, distribution = DISTRIBUTIONS.uniform, days = 31) {
    data = []

    //maximum precent increase and decrease from deterministic distribution value for a given day
    const noise = 0.15

    //random configuration variable for the distribution functions
    const randomizer = Math.random();

    //for each day
    for (let i = 0; i < days; i++) {
        //generate a number of tallies as specified by the distribution within the range allowed by the noise variable
        for (let j = 0; j < dataPoints * distribution(i, days, randomizer) * map(Math.random(), 0, 1, 1 - noise, 1 + noise); j++) {
            //add a new tally for the day
            data.push({
                _endDate: undefined,
                _geoPosition: undefined,
                _journey: false,
                _lastModified: new Date(),
                _note: undefined,
                _number: undefined,
                _startDate: randomDate(new Date(2020, 11, i + 1), new Date(2020, 11, i + 2)),
                Rec: 1
            })
        }
    }

    //sort the tallies by date
    data.sort((a, b) => a._startDate - b._startDate);

    return data;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

//takes a 31 day month of data and counts the amount of tallies per day
function countPerDay(data) {
    let numberPerDay = new Array(31);

    //initialize each entry to 0
    for (let i = 0; i < numberPerDay.length; i++) {
        numberPerDay[i] = {"day": dayToWeekday(i) + "", "count": 0}
    }

    data.forEach(tally => { numberPerDay[tally._startDate.getDate() - 1].count++; })

    return numberPerDay;
}

function dayToWeekday(day) {
    const weekdays = ["Su", "M", "T", "W", "Th", "F", "Sa"]

    return weekdays[day % 7]
}

//downloads a json file with the give name
function downloadJSON(json, name) {
    let url = URL.createObjectURL(new Blob([JSON.stringify(json)], { type: "text/plain" }))
    let downloadNode = document.createElement('a')
    downloadNode.setAttribute('href', url)
    downloadNode.setAttribute("download", `${name}.json`)
    document.body.appendChild(downloadNode)
    downloadNode.click()
    downloadNode.remove()
}


//applies a linear transform from [in_min, in_max] to [out_min, out_max] to value
function map(value, in_min, in_max, out_min, out_max) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}