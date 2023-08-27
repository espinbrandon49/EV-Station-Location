const apikey = '2RWEmIH2pRUJZcqZ1v5HIAPtokWgcKHxrzrK8GK2';
let stationArr = JSON.parse(localStorage.getItem('station')) || [];
const searchInput = document.getElementById('searchInput');
const mapDisplay = document.getElementById('mapDisplay');
const tileCards = document.getElementById('tileCards');
const savedLocations = document.getElementById('savedLocations');
const mapDiv = document.getElementById('mapDiv');
let map;

const searchBtn = document.getElementById('searchBtn')
searchInput.setAttribute('onfocus', "this.value=''")
searchBtn.addEventListener('click', (e) => {
  e.preventDefault()
  getApi(searchInput.value)
  searchInput.value = ''
});

//1. Retrieve and display station location and retailer information from search bar
// https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/nearest/
function getApi(location) {
  const requestUrl = `https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?location=${location}&fuel_type_code='ELEC'&radius=5.0&api_key=${apikey}`

  fetch(requestUrl)
    .then(function (response) {
      if (!response.ok) {
        searchInput.value = `INVALID CITY OR ZIPCODE`
        searchInput.setAttribute('style', 'color: red;')
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      // display station info for map view
      dataDisplay1(data.fuel_stations[0])
      // display nearby locations
      dataDisplay5(data.fuel_stations, 10)
      // display station on map
      let planes = [
        [data.fuel_stations[0].latitude, data.fuel_stations[0].longitude],
        [data.fuel_stations[1].latitude, data.fuel_stations[1].longitude],
        [data.fuel_stations[2].latitude, data.fuel_stations[2].longitude],
        [data.fuel_stations[3].latitude, data.fuel_stations[3].longitude],
        [data.fuel_stations[4].latitude, data.fuel_stations[4].longitude]
      ]
      latLon(data.latitude, data.longitude, planes)
    });
};

//2. Retrieve and display station location and retailer information with card buttons
// https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/get/
function getApiByID(location) {
  const requestUrl = ` https://developer.nrel.gov/api/alt-fuel-stations/v1/${location}.json?api_key=${apikey}`

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      // display station info for map view
      dataDisplay1(data.alt_fuel_station)
      // display station on map
      let planes = [[data.alt_fuel_station.latitude, data.alt_fuel_station.longitude]]
      latLon(data.alt_fuel_station.latitude, data.alt_fuel_station.longitude, planes)
    });
};

//3. Retrieve and display station location and retailer information with saved search buttons
// https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/nearest/
function getApiByZip(location) {
  const requestUrl = `https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?location=${location}&fuel_type_code='ELEC'&radius=5.0&api_key=${apikey}`

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      // display nearby locations
      dataDisplay5(data.fuel_stations, 10)
      // display station on map
      let planes = [
        [data.fuel_stations[0].latitude, data.fuel_stations[0].longitude],
        [data.fuel_stations[1].latitude, data.fuel_stations[1].longitude],
        [data.fuel_stations[2].latitude, data.fuel_stations[2].longitude],
        [data.fuel_stations[3].latitude, data.fuel_stations[3].longitude],
        [data.fuel_stations[4].latitude, data.fuel_stations[4].longitude]
      ]
      latLon(data.fuel_stations[1].latitude, data.fuel_stations[1].longitude, planes)
    });
};

// Load default map of Berkeley, California
map = L.map('mapDiv').setView([37.871, -122.259], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

// Create display for map of EV stations in the search region
function latLon(lat, lon, arr) {
  //replace current map with new search
  if (map != undefined) { map.remove(); }

  map = L.map('mapDiv').setView([lat, lon], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // var marker = L.marker([lat, lon]).addTo(map)
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

// Create display for station-info on map_Section
function dataDisplay1(arr, price) {
  mapDisplay.innerHTML = ''
  const BLC = document.createElement('div')
  arr.ev_pricing == null ? price = 'free' : price = arr.ev_pricing
  BLC.innerHTML = `
      <h4 class="">${arr.station_name}</h4>
      <p class=""> ${arr.street_address} ${arr.city}, ${arr.state}, ${arr.zip}</p> 
      </br>
      <div class="">
      <div class="">
      <i class=""></i> 
      <p class="">${arr.station_phone}</p> 
      </div>
      <div  class="">
      <i class=""></i> 
      <p class="">${arr.ev_connector_types}</p> 
      </div>
      <div class="">
      <i class=""></i>
      <p class=""> ${price}</p> 
      </div>
      </div>
      `
  mapDisplay.appendChild(BLC);
  // BLC.classList.add('has-background-success', 'box', "mb-3")
  saveStation([arr.station_name, arr.id, arr.zip]);
}

// Create display for station-info in nearby_Locations_section
function dataDisplay5(arr, length) {
  const cardDiv = document.createElement('div')
  tileCards.innerHTML = "";

  for (let i = 1; i < length; i++) {
    arr[i].ev_pricing == null ? price = 'free' : price = arr[i].ev_pricing
    // create cardTile text
    const stationInfo = document.createElement('div')
    // stationInfo.classList.add('box')
    stationInfo.innerHTML = `
    <p class="">${arr[i].distance.toFixed(2)} mi.</p>
    <hr>
    <p class="">${arr[i].street_address} ${arr[i].city}, ${arr[i].state}, ${arr[i].zip}</p> 
    </br>
    <p class="">${arr[i].station_phone}</p> 
    <p class="">${arr[i].ev_connector_types}</p> 
    <p class="">${price}</p> 
    `
    cardDiv.appendChild(stationInfo)
    // cardDiv.classList.add('is-flex', 'is-flex-wrap-wrap', 'is-justify-content-space-evenly')
    // stationInfo.classList.add('stationInfo')
    //create button
    const cardBtn = document.createElement('div')
    // cardBtn.classList.add("is-size-4", "block", "has-text-centered")
    cardBtn.textContent = arr[i].station_name
    cardBtn.setAttribute('value', `${arr[i].id}`)
    cardBtn.setAttribute('datazip', `${arr[i].zip}`)
    stationInfo.prepend(cardBtn)

    stationInfo.addEventListener('click', (event) => {
      let value = cardBtn.getAttribute('value')
      getApiByID(value)
      saveStation([cardBtn.textContent, value, cardBtn.getAttribute('datazip')])
    })
  }
  tileCards.appendChild(cardDiv)
};

//Create display for saved searches as buttons
function displaySearches() {
  if (!localStorage.station) { return }
  let searches = JSON.parse(localStorage.getItem('station'))

  function truncateString(str) {
    // Clear out that junk in your trunk
    if (str.length > 35) {
      return str.slice(0, 25) + "...";
    } else {
      return str;
    }
  }

  //create location button
  savedLocations.innerHTML = ''
  for (let i = 0; i < searches.length; i++) {
    const buttonDiv = document.createElement('div')
    // buttonDiv.classList.add('mb-3')
    const searchItem = document.createElement('button')
    // searchItem.classList.add('button', 'is-link', 'is-small', 'is-fullwidth', 'is-size-5')
    // searchItem.textContent = searches[i][0]
    searchItem.textContent = truncateString(searches[i][0])
    buttonDiv.appendChild(searchItem)
    searchItem.addEventListener('click', () => {
      getApiByID(searches[i][1])
      getApiByZip(searches[i][2])
    })

    //create delete button
    const deleteBtn = document.createElement('button')
    // deleteBtn.classList.add("button", "is-fullwidth", "has-background-danger", "has-text-white", 'is-link', 'is-small')
    deleteBtn.id = i
    deleteBtn.textContent = "Delete"
    buttonDiv.appendChild(deleteBtn)
    deleteBtn.addEventListener('click', (event) => {
      let btnId = event.target.id
      deleteSearch(stationArr, btnId)
    })
    savedLocations.appendChild(buttonDiv)
  }
  const savedHeader = document.createElement('h2')
  // savedHeader.classList.add('subtitle', "is-size-4", "has-text-centered")
  savedHeader.textContent = 'SAVED SEARCHES'
  savedLocations.prepend(savedHeader)
} displaySearches();

// Delete items from search history
function deleteSearch(arr, content) {
  arr.splice(content, 1)
  let stations = JSON.stringify(arr)
  localStorage.setItem('station', stations)
  displaySearches()
}

// Save searches in local storage
function saveStation(content) {
  let newArr = []
  stationArr.forEach(element => newArr.push(element[0]))
  if (!newArr.includes(content[0])) {
    stationArr.push(content)
    let stations = JSON.stringify(stationArr)
    localStorage.setItem('station', stations)
    displaySearches()
  }
}

