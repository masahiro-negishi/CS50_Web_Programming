var chart_three_country = null;
var chart_three_month_country = null;
var country_to_slug = {};


document.addEventListener('DOMContentLoaded', function() {
    ShowGlobalStats();
    //ShowTimeSeriesData();
    ShowAreaOptions();
    document.querySelector('#local-statistics').style.display = 'none';
})

document.addEventListener('click', event => {
    const element = event.target;
    if (element.id === 'global-button') {
        document.querySelector('#global-statistics').style.display = 'block';
        document.querySelector('#local-statistics').style.display = 'none';
    }
    else if(element.id === 'local-button') {
        document.querySelector('#global-statistics').style.display = 'none';
        document.querySelector('#local-statistics').style.display = 'block';
    }
    else if(element.id === 'search-button') {
        ShowAreaData();
    }
})


// Show latest world-wide information of Covid19  
function ShowGlobalStats() {
    fetch('https://api.covid19api.com/summary')
    .then(response => {
        return response.json();
    })
    .then(data => {
        const global = data.Global;
        const fields = ['NewConfirmed', 'TotalConfirmed', 'NewDeaths', 'TotalDeaths', 'NewRecovered', 'TotalRecovered'];
        const names = ['New Confirmed', 'Total Confirmed', 'New Deaths', 'Total Deaths', 'New Recovered', 'Total Recovered'];
        for (let i = 0; i < fields.length; i++){
            const onefield = document.createElement('tr');
            const name = document.createElement('td');
            const number = document.createElement('td');
            onefield.className = 'global-data-row';
            name.className = 'field';
            name.innerHTML = names[i];
            number.innerHTML = global[fields[i]];
            onefield.appendChild(name);
            onefield.appendChild(number); 
            document.querySelector('.global-data > tbody').appendChild(onefield); 
        }
    })
}


// Show time series data
function ShowTimeSeriesData() {
    //'https://corona.lmao.ninja/v2/historical/all?lastdays=all'
    fetch('https://corona.lmao.ninja/v3/covid-19/historical/all?lastdays=all')
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
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
                label: fields[0],
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: Object.values(data[fields[0]]),
            }, {
                label: fields[1],
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: Object.values(data[fields[1]]),
            }, {
                label: fields[2],
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

        /*
        // Time series data of a particular field throughout entire period 
        ids = ['cases-chart-all', 'deaths-chart-all', 'recovered-chart-all'];
        for (let i = 0; i < fields.length; i++) {
            const onefield = data[fields[i]];
            let onefielddata = Object.values(onefield);
            if (fields[i] === 'recovered') {
                onefielddata = recovered_data;
            }
            const chart_data = {
                labels: labels,
                datasets: [{
                    label: fields[i],
                    backgroundColor: colors[i],
                    borderColor: colors[i],
                    data: onefielddata,
                }]
            };
            const chart = new Chart(document.getElementById(ids[i]), {
                type: 'line',
                data: chart_data,
                options: {
                }
            })
        }
        document.querySelector('#cases-chart-all').style.display = 'none';
        document.querySelector('#deaths-chart-all').style.display = 'none';
        document.querySelector('#recovered-chart-all').style.display = 'none';
        */

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
                label: fields[0],
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: Object.values(data[fields[0]]).slice(-30),
            }, {
                label: fields[1],
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: Object.values(data[fields[1]]).slice(-30),
            }, {
                label: fields[2],
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


// Let Users to choose a particular area
function ShowAreaOptions() {
    fetch('https://api.covid19api.com/countries')
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        const select = document.querySelector('select');
        for (let i = 0; i < data.length; i++) {
            const option = document.createElement('option');
            option.value = data[i].Country;
            option.innerHTML = data[i].Country;
            select.appendChild(option);
            country_to_slug[data[i].Country] = data[i].Slug;
        }
    })
}


// Show data of a particular area
function ShowAreaData() {

    if (chart_three_country) {
        chart_three_country.destroy();
    }
    if (chart_three_month_country) {
        chart_three_month_country.destroy();
    }

    const options = document.querySelector('.choose-area > select');
    const index = options.selectedIndex;
    const area = options.options[index].value;
    console.log(area);
    const slug = country_to_slug[area];

    var url = `https://api.covid19api.com/total/country/${slug}?from=2020-03-01T00:00:00Z&to=2022-02-27T00:00:00Z`;
    console.log(url);

    fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        
        const fields = ['Confirmed', 'Deaths', 'Recovered'];
        const colors = ['rgb(255, 99, 132)', 'rgb(255, 215, 0)', 'rgb(144, 238, 144)'];

        // Time series data of all fields throughout entire period 
        let labels = [];
        let confirmed = [];
        let death = [];
        let recovered = [];
        let after = false;
        for (let i = 0; i < data.length; i++) {
            labels[i] = data[i].Date.split('T')[0];
            confirmed[i] = data[i].Confirmed;
            death[i] = data[i].Deaths;
            if (after) {
                recovered[i] = null;
            }
            else if (labels[i] === '2021-08-05') {
                after = true;
                recovered[i] = null;
            }
            else {
                recovered[i] = data[i].Recovered;
            }
        }

        const three_data = {
            labels: labels,
            datasets: [{
                label: fields[0],
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: confirmed,
            }, {
                label: fields[1],
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: death,
            }, {
                label: fields[2],
                backgroundColor: colors[2],
                borderColor: colors[2],
                data: recovered,
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
        let labels_month = labels.slice(-30);

        const three_data_month = {
            labels: labels_month,
            datasets: [{
                label: fields[0],
                backgroundColor: colors[0],
                borderColor: colors[0],
                data: confirmed.slice(-30),
            }, {
                label: fields[1],
                backgroundColor: colors[1],
                borderColor: colors[1],
                data: death.slice(-30),
            }, {
                label: fields[2],
                backgroundColor: colors[2],
                borderColor: colors[2],
                data: recovered.slice(-30),
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