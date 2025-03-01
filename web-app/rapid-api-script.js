const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://jsearch.p.rapidapi.com/search',
  params: {
    query: 'java developer in austin',
    page: '1',
    num_pages: '1'
  },
  headers: {
    'X-RapidAPI-Key': '0525d098f9msh0a57d19842976ffp1fd60bjsn715f898783f1',
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
  console.log(JSON.stringify(response.data, null, 2));
}).catch(function (error) {
  console.error(error);
});