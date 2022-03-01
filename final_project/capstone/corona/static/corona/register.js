document.addEventListener('DOMContentLoaded', function() {
    SetOnlyJH();
    ShowCountryOptions();
})


const only_jh = new Set();


function SetOnlyJH() {
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
        for (let i = 0; i < data.length; i++) {
            if (only_jh.has(data[i].country)) {
                continue;
            }
            if (countries.has(data[i].country)) {
                continue;
            }
            const option = document.createElement('option');
            option.value = data[i].country;
            option.innerHTML = data[i].country;
            select.appendChild(option);
            countries.add(data[i].country);
        }
    })
}