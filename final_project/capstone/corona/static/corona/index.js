// Get Time series data from JHUCSSE : 198 countries
// Get Total data from Worldmeters : 226 countries

// Dictionary which convert a coutry name in JHUCSSE to one in Worldmeters and Vaccine
var jh_to_wm = {}
const only_jh = new Set();

// Charts on Country page
var chart_three_country = null;
var chart_three_month_country = null;
var country_vaccine_chart_all = null;
var country_vaccine_chart_month = null;


document.addEventListener('DOMContentLoaded', function() {
    SetDictionary();
    ShowGlobalStats();
    ShowGlobalTimeSeriesData();
    ShowGlobalVaccine();
    ShowCountryOptions();
    document.querySelector('#country-statistics').style.display = 'none';
})

document.addEventListener('click', event => {
    const element = event.target;
    if (element.id === 'global-button') {
        document.querySelector('#global-statistics').style.display = 'block';
        document.querySelector('#country-statistics').style.display = 'none';
    }
    else if(element.id === 'country-button') {
        document.querySelector('#global-statistics').style.display = 'none';
        document.querySelector('#country-statistics').style.display = 'block';
    }
    else if(element.id === 'search-button') {
        ShowCountryStats();
        ShowCountryTimeSeriesData();
        ShowCountryVaccine();
    }
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
    only_jh.add('Antarctica');
    only_jh.add('Congo (Kinshasa)');
    only_jh.add('Diamond Princess');
    only_jh.add('Eritrea');
    only_jh.add('Holy See');
    only_jh.add('Kosovo');
    only_jh.add('MS Zaandam');
    only_jh.add('Marshall Islands');
    only_jh.add('Micronesia');
    only_jh.add('Palau');
    only_jh.add('Summer Olympics 2020');
    only_jh.add('West Bank and Gaza');
    only_jh.add('Winter Olympics 2022');
}


// Show latest world-wide information of Covid19  
function ShowGlobalStats() {
    fetch('https://corona.lmao.ninja/v3/covid-19/all?yesterday')
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        const fields = ['cases', 'todayCases', 'deaths', 'todayDeaths', 'recovered', 'todayRecovered'];
        const names = ['Total Cases', 'Yesterday Cases', 'Total Deaths', 'Yesterday Deaths', 'Total Recovered', 'Yesterday Recovered']
        for (let i = 0; i < fields.length; i++){
            const onefield = document.createElement('tr');
            const name = document.createElement('td');
            const number = document.createElement('td');
            name.innerHTML = names[i];
            number.innerHTML = data[fields[i]];
            onefield.appendChild(name);
            onefield.appendChild(number); 
            document.querySelector('#global-data > tbody').appendChild(onefield); 
        }
    })
}


// Show time series data
function ShowGlobalTimeSeriesData() {
    fetch('https://corona.lmao.ninja/v3/covid-19/historical/all?lastdays=all')
    .then(response => {
        return response.json();
    })
    .then(data => {
        const fields = ['cases', 'deaths', 'recovered'];
        const colors = ['rgb(255, 99, 132)', 'rgb(255, 215, 0)', 'rgb(144, 238, 144)'];

        // Time series data of all fields throughout entire period 
        let labels = Object.keys(data[fields[0]]);
        let recovered_data = Object.values(data[fields[2]]);
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
                label: `Total ${fields[0]}`,
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: Object.values(data[fields[0]]),
            }, {
                label: `Total ${fields[1]}`,
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: Object.values(data[fields[1]]),
            }, {
                label: `Total ${fields[2]}`,
                backgroundColor: colors[2],
                borderColor: colors[2],
                data: recovered_data,
            }]
        };
        const chart_three = new Chart(document.getElementById('three-chart-all'), {
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
        let labels_month = Object.keys(data[fields[0]]).slice(-30);
        console.log(labels_month.length)
        let recovered_data_month = [];
        for (let i = 0; i < labels_month.length; i++) {
            // Number of recovered is not available after 8/5/21
            recovered_data_month[i] = null;
        }

        const three_data_month = {
            labels: labels_month,
            datasets: [{
                label: `Total ${fields[0]}`,
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: Object.values(data[fields[0]]).slice(-30),
            }, {
                label: `Total ${fields[1]}`,
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: Object.values(data[fields[1]]).slice(-30),
            }, {
                label: `Total ${fields[2]}`,
                backgroundColor: colors[2],
                borderColor: colors[2],
                data: recovered_data_month,
            }]
        };
        const chart_three_month = new Chart(document.getElementById('three-chart-month'), {
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


// Show global Vaccine data
function ShowGlobalVaccine() {
    fetch('https://corona.lmao.ninja/v3/covid-19/vaccine/coverage?lastdays=all&fullData=true')
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        // Add to #global-data table
        const fields = ['total', 'daily', 'totalPerHundred'];
        const names = ['Total Doses', 'Day Before Yesterday Doses', 'Doses per Hundred'];
        for (let i = 0; i < fields.length; i++){
            const onefield = document.createElement('tr');
            const name = document.createElement('td');
            const number = document.createElement('td');
            name.innerHTML = names[i];
            number.innerHTML = data[data.length-2][fields[i]];
            onefield.appendChild(name);
            onefield.appendChild(number); 
            document.querySelector('#global-data > tbody').appendChild(onefield); 
        }

        // show time series graph
        let labels = [];
        let doses = [];
        for (let i = 0; i < data.length; i++) {
            labels[i] = data[i].date;
            doses[i] = data[i].total;
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

        vaccine_chart_all = new Chart(document.getElementById('vaccine-chart-all'), {
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

        vaccine_chart_month = new Chart(document.getElementById('vaccine-chart-month'), {
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


// Let Users to choose a particular country
function ShowCountryOptions() {
    fetch('https://corona.lmao.ninja/v3/covid-19/jhucsse')
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        const select = document.querySelector('select');
        var countries = new Set();
        /*
        for (let i = 0; i < data.length; i++) {
            if (data[i].province === null && countries.has(data[i].country)) {
                continue;
            }
            const option = document.createElement('option');
            var area = data[i].country;
            if (data[i].province !== null) {
                area += `/${data[i].province}`
                if (!countries.has(data[i].country)) {
                    const country = document.createElement('option');
                    country.value = data[i].country;
                    country.innerHTML = data[i].country;
                    select.appendChild(country);
                }
            }
            option.value = area;
            option.innerHTML = area;
            select.appendChild(option);
            countries.add(data[i].country);
        }
        */
        for (let i = 0; i < data.length; i++) {
            if (countries.has(data[i].country) || only_jh.has(data[i].country)) {
                continue;
            }
            const option = document.createElement('option');
            option.value = data[i].country;
            option.innerHTML = data[i].country;
            select.appendChild(option);
            countries.add(data[i].country);
            if (data[i].country in jh_to_wm) {
                continue;
            }
            else {
                jh_to_wm[data[i].country] = data[i].country;
            }
        }
    })
}


/*
var countries = new Set();
var countries_2 = new Set();
// Compare two set of countries
function compare_country() {
    fetch('https://corona.lmao.ninja/v3/covid-19/jhucsse')
    .then(response => {
        return response.json();
    })
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            countries.add(data[i].country);
        }
    });

    //fetch('https://corona.lmao.ninja/v3/covid-19/countries')
    fetch('https://corona.lmao.ninja/v3/covid-19/vaccine/coverage/countries')
    .then(response => {
        return response.json();
    })
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            countries_2.add(data[i].country);
        }
    });
}

function diff() {
    console.log(countries);
    console.log(countries_2);
    var diff1 = new Set();
    for (var country of countries) {
        if (countries_2.has(country)) {
            continue;
        }
        diff1.add(country);
    }
    var diff2 = new Set();
    for (var country of countries_2) {
        if (countries.has(country)) {
            continue;
        }
        diff2.add(country);
    }
    console.log(diff1);
    console.log(diff2);
}
*/


// Show latest information of Covid19 in a particular country
function ShowCountryStats() {
    document.querySelector('#country-data > tbody').innerHTML = '';
    const options = document.querySelector('#choose-country > select');
    const index = options.selectedIndex;
    const option = options.options[index].value;
    wm_country = jh_to_wm[option];
    fetch(`https://corona.lmao.ninja/v3/covid-19/countries/${wm_country}`)
    .then(response => {
        return response.json();
    })
    .then(data => {
        document.querySelector('#country-name').innerHTML = data.country;
        document.querySelector('#country-flag').src = data.countryInfo.flag;

        const fields = ['cases', 'todayCases', 'deaths', 'todayDeaths', 'recovered', 'todayRecovered'];
        const names = ['Total Cases', 'Yesterday Cases', 'Total Deaths', 'Yesterday Deaths', 'Total Recovered', 'Yesterday Recovered']
        for (let i = 0; i < fields.length; i++){
            const onefield = document.createElement('tr');
            const name = document.createElement('td');
            const number = document.createElement('td');
            name.innerHTML = names[i];
            number.innerHTML = data[fields[i]];
            onefield.appendChild(name);
            onefield.appendChild(number); 
            document.querySelector('#country-data > tbody').appendChild(onefield); 
        }
    })
}


// Show time series data of a particular country
function ShowCountryTimeSeriesData() {

    if (chart_three_country) {
        chart_three_country.destroy();
    }
    if (chart_three_month_country) {
        chart_three_month_country.destroy();
    }

    const options = document.querySelector('#choose-country > select');
    const index = options.selectedIndex;
    const option = options.options[index].value;
    var url = `https://corona.lmao.ninja/v3/covid-19/historical/${option}?lastdays=all`;

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
        chart_three_country = new Chart(document.getElementById('country-three-chart-all'), {
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
        chart_three_month_country = new Chart(document.getElementById('country-three-chart-month'), {
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
function ShowCountryVaccine() {
    if (country_vaccine_chart_all) {
        country_vaccinechart_all.destroy();
    }
    if (country_vaccine_chart_month) {
        country_vaccinechart_month.destroy();
    }

    const options = document.querySelector('#choose-country > select');
    const index = options.selectedIndex;
    const option = options.options[index].value;
    const vac_country = jh_to_wm[option];
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
            document.querySelector('#country-data > tbody').appendChild(onefield); 
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

        vaccine_chart_all = new Chart(document.getElementById('country-vaccine-chart-all'), {
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

        vaccine_chart_month = new Chart(document.getElementById('country-vaccine-chart-month'), {
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