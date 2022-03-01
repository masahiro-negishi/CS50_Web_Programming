document.addEventListener('DOMContentLoaded', function() {
    ShowVaccineStats();
})


function ShowVaccineStats() {
    fetch('https://corona.lmao.ninja/v3/covid-19/vaccine')
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        document.querySelector('#num-of-candidates').innerHTML = data.totalCandidates;
        const lines = ['candidate', 'institutions', 'mechanism', 'sponsors', 'trialPhase']
        for (let i = 0; i < data.data.length; i++) {
            const onefield = document.createElement('tr');
            for (let j = 0; j < lines.length; j++) {
                const cell = document.createElement('td');
                cell.innerHTML = data['data'][i][lines[j]];
                onefield.appendChild(cell);
            }
            document.querySelector('#vaccine-table > tbody').appendChild(onefield); 
        }
    })
}