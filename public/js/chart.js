const ctx = document.getElementById('lineChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2017', '2017', '2017'],
        datasets: [{
            // label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3, 19, 5, 9, 10],
            borderColor: 'rgba(219, 68, 68, 1)',
            tension: 0.1
        }]
    },
    options: {
         plugins:{
            legend:{
                display:false
            }
         },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});