// Dictionary which convert a coutry name in JHUCSSE to one in Worldmeters and Vaccine
var jh_to_wm = {}


document.addEventListener('DOMContentLoaded', function() {
    SetDictionary();
    ShowMyCountryStats();
    ShowMyCountryTimeSeriesData();
    ShowMyCountryVaccine();
})


function SetDictionary() {
    const from = [
        'Bosnia and Herzegovina',
        'Burma',
        'Congo (Brazzaville)',
        "Cote d'Ivoire",
        'Eswatini',
        'Korea, South',
        'Laos',
        'Libya',
        'North Macedonia',
        'Syria',
        'Taiwan*',
        'US',
        'United Arab Emirates',
        'United Kingdom'
    ];
    const to = [
        'Bosnia',
        'Myanmar',
        'Congo',
        "Côte d'Ivoire",
        'Swaziland',
        'S. Korea',
        "Lao People's Democratic Republic",
        'Libyan Arab Jamahiriya',
        'Macedonia',
        'Syrian Arab Republic',
        'Taiwan',
        'USA',
        'UAE',
        'UK'
    ];
    for (let i = 0; i < from.length; i++) {
        jh_to_wm[from[i]] = to[i];
    }
}


// Show latest information of Covid19 in a particular country
function ShowMyCountryStats() {
    const jh_country = document.querySelector('#user-country').value;
    var wm_country;
    if (jh_country in jh_to_wm) {
        wm_country = jh_to_wm[jh_country];
    }
    else {
        wm_country = jh_country;
    }
    fetch(`https://corona.lmao.ninja/v3/covid-19/countries/${wm_country}`)
    .then(response => {
        return response.json();
    })
    .then(data => {
        document.querySelector('#my-country-name').innerHTML = data.country;
        document.querySelector('#my-country-flag').src = data.countryInfo.flag;

        const fields = ['cases', 'todayCases', 'deaths', 'todayDeaths', 'recovered', 'todayRecovered'];
        const names = ['Total Cases', 'Yesterday Cases', 'Total Deaths', 'Yesterday Deaths', 'Total Recovered', 'Yesterday Recovered'];
        for (let i = 0; i < fields.length; i++){
            const onefield = document.createElement('tr');
            const name = document.createElement('td');
            const number = document.createElement('td');
            name.innerHTML = names[i];
            number.innerHTML = data[fields[i]];
            onefield.appendChild(name);
            onefield.appendChild(number); 
            document.querySelector('#my-country-data > tbody').appendChild(onefield); 
        }
    })
}


// Show time series data of a particular country
function ShowMyCountryTimeSeriesData() {

    const jh_country = document.querySelector('#user-country').value;
    var url = `https://corona.lmao.ninja/v3/covid-19/historical/${jh_country}?lastdays=all`;

    fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        const fields = ['cases', 'deaths', 'recovered'];
        const colors = ['rgb(255, 99, 132)', 'rgb(255, 215, 0)', 'rgb(144, 238, 144)'];

        // Time series data of all fields throughout entire period 
        let labels = Object.keys(data.timeline[fields[0]]);
        let recovered_data = Object.values(data.timeline[fields[2]]);
        let after = false;
        for (let i = 0; i < labels.length; i++) {
            // Number of recovered is not available after 8/5/21
            if (after) {
                recovered_data[i] = null;
                continue;
            }
            if (labels[i] === '8/5/21') {
                after = true;
                recovered_data[i] = null;
                continue;
            }
        }

        const three_data = {
            labels: labels,
            datasets: [{
                label: fields[0],
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: Object.values(data.timeline[fields[0]]),
            }, {
                label: fields[1],
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: Object.values(data.timeline[fields[1]]),
            }, {
                label: fields[2],
                backgroundColor: colors[2],
                borderColor: colors[2],
                data: recovered_data,
            }]
        };
        chart_three_country = new Chart(document.getElementById('my-country-three-chart-all'), {
            type: 'line',
            data: three_data,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Entire Period'
                    }
                }
            }
        })

        // Time series data of all fields in last 30 days
        let labels_month = Object.keys(data.timeline[fields[0]]).slice(-30);
        let recovered_data_month = [];
        for (let i = 0; i < labels_month.length; i++) {
            // Number of recovered is not available after 8/5/21
            recovered_data_month[i] = null;
        }

        const three_data_month = {
            labels: labels_month,
            datasets: [{
                label: fields[0],
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: Object.values(data.timeline[fields[0]]).slice(-30),
            }, {
                label: fields[1],
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: Object.values(data.timeline[fields[1]]).slice(-30),
            }, {
                label: fields[2],
                backgroundColor: colors[2],
                borderColor: colors[2],
                data: recovered_data_month,
            }]
        };
        chart_three_month_country = new Chart(document.getElementById('my-country-three-chart-month'), {
            type: 'line',
            data: three_data_month,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Last 30 Days'
                    }
                }
            }
        })
    })
}


// Show country vaccine data
function ShowMyCountryVaccine() {

    const jh_country = document.querySelector('#user-country').value;
    var vac_country;
    if (jh_country in jh_to_wm) {
        vac_country = jh_to_wm[jh_country];
    }
    else {
        vac_country = jh_country;
    }
    var url = `https://corona.lmao.ninja/v3/covid-19/vaccine/coverage/countries/${vac_country}?lastdays=all&fullData=true`;

    fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        timeline = data.timeline;
        // Add to #country-data table
        const fields = ['total', 'daily', 'totalPerHundred'];
        const names = ['Total Doses', 'Day Before Yesterday Doses', 'Doses per Hundred'];
        for (let i = 0; i < fields.length; i++){
            const onefield = document.createElement('tr');
            const name = document.createElement('td');
            const number = document.createElement('td');
            name.innerHTML = names[i];
            number.innerHTML = timeline[timeline.length-2][fields[i]];
            onefield.appendChild(name);
            onefield.appendChild(number); 
            document.querySelector('#my-country-data > tbody').appendChild(onefield); 
        }

        // show time series graph
        let labels = [];
        let doses = [];
        for (let i = 0; i < timeline.length; i++) {
            labels[i] = timeline[i].date;
            doses[i] = timeline[i].total;
        }
        const all_data = {
            labels: labels,
            datasets: [{
                label: 'Total doses of vaccine',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: doses
            }]
        };

        vaccine_chart_all = new Chart(document.getElementById('my-country-vaccine-chart-all'), {
            type: 'line',
            data: all_data,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Entire Period'
                    }
                }
            }
        })

        const month_data = {
            labels: labels.slice(-30),
            datasets: [{
                label: 'Total doses of vaccine',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: doses.slice(-30)
            }]
        }

        vaccine_chart_month = new Chart(document.getElementById('my-country-vaccine-chart-month'), {
            type: 'line',
            data: month_data,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Last 30 days'
                    }
                }
            }
        })
    })
}