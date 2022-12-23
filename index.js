
import {
  getEl,
  wait,
  enableDarkmode,
  disableDarkmode,
  toggleNavlist,
  closeNavlist,
} from './utils/ulitityFunctions.js'
import weathercodeConvert from './utils/weathercode.js'
import axios from 'axios'
import _, { get } from 'lodash'
import {setLocalStorage, getLocalStorage} from './utils/localStorage.js'

//---------------------------getLocalePosition-------------------------------------
let myPosition;
const success = (pos) => {
 const {coords: {longitude, latitude}} = pos
 myPosition = {longitude, latitude}
 setLocalStorage('gps', myPosition)
 return myPosition
}
const error = (err) => {
 console.log(`${err.code}: ${err.message}`)
 setLocalStorage('gps')
}
navigator.geolocation.getCurrentPosition(success, error, {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
})
//---------------------------------------------------------------------------------
const localStorageData = getLocalStorage("locationCollection")?.find(el => el.favorite === true) || []
//--------------------------------------------------------------------------------

let currentTime = new Date().toLocaleTimeString('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
})
const darkmodeToggle = getEl('#darkmode-toggle')
let loadingScreen = getEl('.loading')
let globalWeatherData = null;
let reverseGEOBaseUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?`
let baseWeatherUrl =
  'https://api.open-meteo.com/v1/forecast?timezone=auto&current_weather=true'


//checking current time and changing background-image on my weather card on landing page

const checkTime = (time) => {
  const hour = time.slice(0,2)
  if(hour >= 21 || hour <= 8) {
    getEl('.location-card').className = "location-card nighttime"
    getEl('.location-card-text-content').style.color = "#fff"
  } else if (hour >= 8 && hour <=15){
    getEl('.location-card').className = 'location-card daytime'
    getEl('.location-card-text-content').style.color = "#222"
  } else {
    getEl('.location-card').className = 'location-card evetime'
    getEl('.location-card-text-content').style.color = "#fff"
  }
}

//fetchGEOData for favorite Location

const fetchGEOData = async(url, options = {}) => {
  const fetchQuery = await axios.get(url, options)
  const { data } = fetchQuery
  if (!data) return
  if (fetchQuery.status !== 200) throw new Error({msg: 'Something went wrong. Please try again!'})
  return data.city
}

//fetchWeatherData for favorite Location --> currentWeather

const fetchWeatherData = async({latitude, longitude}, options={}) => {
  if (!latitude || !longitude) return
  if(typeof latitude != 'number' || typeof longitude != "number") return
  let url = `${baseWeatherUrl}&latitude=${latitude}&longitude=${longitude}`
  const fetchQuery = await axios.get(url, options)
  if(fetchQuery.status !== 200) throw new Error({ msg: 'Something went wrong. Please try again!' })
  const {data} = fetchQuery
  if(!data) return
  globalWeatherData = data
  const currentCity = await fetchGEOData(`${reverseGEOBaseUrl}&latitude=${latitude}&longitude=${longitude}`)
  renderWeather(data, currentCity)
}

// render the current Temperature

//TODO refresh button with timestamp

const renderWeather = ({current_weather: {temperature, weathercode}}, city) => {
  getEl('.landing-location').innerHTML = `
            <a href="/pages/location.html" class="location-link">
            <div class="location-card">
            </div>
            <div class="location-card-text-content">
              <h2 id="weather-card-name">${city}</h2>
              <div style="justify-content: center; gap: 1.6rem;" class="flex-display">
                <div class="time-container">
                  <i class="fa-regular fa-clock"></i>
                  <div class="location-card-time"></div>
                </div>
                <div class="temperature-container">
                  <i class="fa-solid fa-temperature-three-quarters"></i>
                  <div class="location-card-temperature">${temperature} °C</div>
                </div>
              </div>
              <div class="">${weathercodeConvert(weathercode)}</div>
            </div>
          </a>
  `
  getEl('.location-card-time').innerHTML = new Date().toLocaleTimeString(
    'de-DE',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
  checkTime(currentTime)
}

//--------------------------Live Time Display-------------------------------------

setInterval(() => {
  const timeDisplay = getEl('.location-card-time')
  currentTime = new Date().toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
  if(!timeDisplay) return
  timeDisplay.innerHTML = currentTime
  checkTime(currentTime)
}, 1000)

//------------------------------------------------------------------------------

window.addEventListener('load', async() => {
let preferedLocation = null;
if(localStorageData) {
  preferedLocation = {longitude: localStorageData.dataArray[0].longitude, latitude: localStorageData.dataArray[0].latitude}
} else if(!localStorageData && myPosition) {
  preferedLocation = myPosition
} else {
  if (loadingScreen) {
    wait(500).then(() =>loadingScreen.remove())
  }
  return getEl('.location-card-text-content').innerHTML = 'No Data has been selected yet or you disallowed location call. Please add a location.' 
}
fetchWeatherData(preferedLocation)
if (loadingScreen) {
  wait(500).then(() => loadingScreen.remove())
}
})

getEl('.nav-btn').addEventListener('click', toggleNavlist)
window.addEventListener('click', closeNavlist)

// darkmode toggle

const initialDarkmodeSettings = getLocalStorage('darkmode')
if(initialDarkmodeSettings) {
  darkmodeToggle.checked = false
  enableDarkmode()
} else {
  darkmodeToggle.checked = true
  disableDarkmode()
}

darkmodeToggle.addEventListener('click', () => {
  if(darkmodeToggle.checked) disableDarkmode()
  if(!darkmodeToggle.checked) enableDarkmode()
})