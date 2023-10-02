import axios from 'axios';


const API_ENDPOINT = 'https://api.fda.gov/device/event.json?search=device.generic_name:tomography&count=event_type.exact';

async function fetchTomographyEventCounts() {
    try {
        const response = await axios.get(API_ENDPOINT);
        const data = response.data;

        if (data.results && data.results.length > 0) {
            console.log('Adverse Event Counts for Tomography Devices:');
            data.results.forEach(result => {
                console.log(`${result.term}: ${result.count}`);
            });
        } else {
            console.log('No adverse events found for tomography devices.');
        }
    } catch (error) {
        console.error('Error fetching data from OpenFDA:', error);
    }
}

fetchTomographyEventCounts();

