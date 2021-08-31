// const fetch =  require('node-fetch');


// // FETCH WEATHER DATA
// async function getBreweryData(req, res){

//   const search = req.query.search;
//   const apiResp = await fetch(`http://beermapping.com/webservice/loccity/${process.env.API_KEY}/${search}&s=json`);
//   const apiData = await apiResp.json();
//   const returnData = {
//     formatted_query: apiData[0].display_name,
//     latitude: apiData[0].lat,
//     longitude: apiData[0].lon,
//   };

//   res.json(returnData);

// }

// module.exports = {
//   getBreweryData
// };
// const apiData = await apiResponse.json();
    

//   const data = apiData.map((obj) => {
//     return {
//        time: new Date(obj.ts * 1000).toLocaleDateString('en-US', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       }),
//       name:
//     };
//   });
//   return data;