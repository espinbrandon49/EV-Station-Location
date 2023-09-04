const apikey = '2RWEmIH2pRUJZcqZ1v5HIAPtokWgcKHxrzrK8GK2';
let stationArr = JSON.parse(localStorage.getItem('station')) || [];
const search = document.getElementById('search');
let map;

getApi(94133);

document.getElementById('searchButton').addEventListener('click', (e) => {
  e.preventDefault();
  getApi(search.value);
  search.value = '';
});

//1. Display data from search bar
// https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/nearest/
async function getApi(location) {
  const requestUrl = `https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?location=${location}&fuel_type_code='ELEC'&radius=5.0&api_key=${apikey}`

  const response = await fetch(requestUrl);
  const data = await response.json();

  try {
    let planes = [
      [data.fuel_stations[0].latitude, data.fuel_stations[0].longitude],
      [data.fuel_stations[1].latitude, data.fuel_stations[1].longitude],
      [data.fuel_stations[2].latitude, data.fuel_stations[2].longitude],
      [data.fuel_stations[3].latitude, data.fuel_stations[3].longitude],
      [data.fuel_stations[4].latitude, data.fuel_stations[4].longitude]
    ]
    // display station info for map view
    dataDisplay1(data.fuel_stations[0])
    // display nearby locations
    dataDisplay5(data.fuel_stations, 6)
    // display station on map
    latLon(data.latitude, data.longitude, planes)
  } catch (error) {
    search.value = `INVALID CITY OR ZIPCODE`
    search.setAttribute('style', 'color: red;')
  }
}

// 2. Display data with card buttons
// https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/get/
async function getApiByID(location) {
  const requestUrl = ` https://developer.nrel.gov/api/alt-fuel-stations/v1/${location}.json?api_key=${apikey}`;

  const response = await fetch(requestUrl);
  const data = await response.json();

  let planes = [[data.alt_fuel_station.latitude, data.alt_fuel_station.longitude]];
  // display station info for map view
  dataDisplay1(data.alt_fuel_station);
  // display station on map
  latLon(data.alt_fuel_station.latitude, data.alt_fuel_station.longitude, planes);
}

//3. Display data with saved search buttons
// https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/nearest/
async function getApiByZip(location) {
  const requestUrl = `https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?location=${location}&fuel_type_code='ELEC'&radius=5.0&api_key=${apikey}`

  const response = await fetch(requestUrl);
  const data = await response.json();

  let planes = [
    [data.fuel_stations[0].latitude, data.fuel_stations[0].longitude],
    [data.fuel_stations[1].latitude, data.fuel_stations[1].longitude],
    [data.fuel_stations[2].latitude, data.fuel_stations[2].longitude],
    [data.fuel_stations[3].latitude, data.fuel_stations[3].longitude],
    [data.fuel_stations[4].latitude, data.fuel_stations[4].longitude]
  ];
  // display nearby locations
  dataDisplay5(data.fuel_stations, 6)
  // display station on map
  latLon(data.fuel_stations[1].latitude, data.fuel_stations[1].longitude, planes)
}

// Create display for station-info on map_Section
function dataDisplay1(arr) {
  const mapDisplayCard = document.getElementById('mapDisplayCard');
  mapDisplayCard.innerHTML = '';
  mapDisplayCard.innerHTML = `
      <p class="mapDisplay-card-item mapDisplay-card-name">
        ${arr.station_name}
      </p>
      <p class="mapDisplay-card-item">
        ${arr.street_address}
      </p> 
      <p class="mapDisplay-card-item">
        ${arr.city}, ${arr.state}, ${arr.zip}
      </p>
      <div class="mapDisplay-card-item mapDisplay-card-stats">
        <div> <i class="fa-solid fa-phone green"></i> &nbsp; ${arr.station_phone}</div>
        <div><i class="fa-solid fa-plug green"></i> &nbsp; ${arr.ev_connector_types}</div>
        <div class="green"> ${arr.ev_pricing} </div>
      </div>
      `;
  saveStation([arr.station_name, arr.id, arr.zip, arr.city]);
};

//Create display for saved searches as buttons
function displaySavedSearches() {
  const savedLocations = document.getElementById('savedLocations');
  if (!localStorage.station) { return };
  savedLocations.innerHTML = '';

  for (let i = 0; i < stationArr.length; i++) {
    const savedLocationsDiv = document.createElement('li');
    savedLocationsDiv.classList.add("savedLocations-div");

    // create location button
    const savedLocationItem = document.createElement('li');
    savedLocationItem.classList.add("savedLocations-item");
    savedLocationItem.innerHTML = `
      <div>${stationArr[i][3]}</div>
      <p class="savedLocations-item-zip">${stationArr[i][2]}</div>
    ` ;
    savedLocationsDiv.appendChild(savedLocationItem);

    savedLocationItem.addEventListener('click', () => {
      getApiByID(stationArr[i][1]);
      getApiByZip(stationArr[i][2]);
    });

    // create delete button
    const deleteBtn = document.createElement('div');
    deleteBtn.innerHTML = `<i id=${i} class="fa-solid fa-xmark x"></i>`;
    savedLocationsDiv.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', (event) => {
      stationArr.splice(event.target.id, 1)
      let stations = JSON.stringify(stationArr)
      localStorage.setItem('station', stations)
      displaySavedSearches();
    });

    savedLocations.appendChild(savedLocationsDiv);
  }
} displaySavedSearches();

// Create display for .nearby
function dataDisplay5(arr, length) {
  const nearbyCardWrapper = document.getElementById('nearbyCardWrapper');
  nearbyCardWrapper.innerHTML = "";

  for (let i = 1; i < length; i++) {
    const nearbyCard = document.createElement('div')
    nearbyCard.classList.add("nearby-card")
    nearbyCard.value = `${arr[i].id}`
    nearbyCard.setAttribute('datazip', `${arr[i].zip}`)
    arr[i].ev_pricing == null ? price = '$$' : price = arr[i].ev_pricing

    nearbyCard.innerHTML = `
    <p class="nearby-card-item nearby-card-name">${arr[i].station_name} mi.</p>
    <p class="nearby-card-item">${arr[i].street_address}</p> 
    <p>${arr[i].city}, ${arr[i].state}, ${arr[i].zip}</p>
    <p class="nearby-card-item">
      ${arr[i].station_phone} | ${arr[i].ev_connector_types} | ${price}
    </p> 
    `
    nearbyCardWrapper.appendChild(nearbyCard);

    nearbyCard.addEventListener('click', () => {
      getApiByID(nearbyCard.value)
      saveStation([arr[i].station_name, nearbyCard.value, nearbyCard.getAttribute('datazip'), arr[i].city])
    })
  }
};

// Create display for map of EV stations in the search region
function latLon(lat, lon, arr) {
  const mapDiv = document.getElementById('mapDiv');
  //replace current map with new search
  if (map != undefined) { map.remove(); }

  map = L.map('mapDiv').setView([lat, lon], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  let marker;
  var myIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  //custom marker for map selection
  L.marker([lat, lon], { icon: myIcon }).addTo(map);

  //close by markers
  for (var i = 1; i < arr.length; i++) {
    marker = new L.marker([arr[i][0], arr[i][1]]).addTo(map)
  }
};

// Save searches in local storage
function saveStation(content) {
  let newArr = []
  stationArr.forEach(element => newArr.push(element[2]))
  if (!newArr.includes(content[2])) {
    stationArr.push(content)
    let stations = JSON.stringify(stationArr)
    localStorage.setItem('station', stations)
    displaySavedSearches()
  }
}

const showClearTextButton = () => {
  const clear = document.getElementById('clear');
  if (search.value.length) {
    clear.classList.add('flex')
    clear.classList.remove('none');
  } else {
    clear.classList.add('none');
    clear.classList.remove('flex');
  }
};
search.addEventListener('input', showClearTextButton);

const clearSearchText = (event) => {
  const clear = document.getElementById('clear');
  event.preventDefault()
  search.value = ''
  clear.classList.add('none')
  clear.classList.remove('flex')
}
document.getElementById('clear').addEventListener('click', clearSearchText);



