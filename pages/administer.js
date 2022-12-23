import { setLocalStorage, getLocalStorage } from '../utils/localStorage.js'
import axios from 'axios'
import {
  getEl,
  getEls,

  wait,
  enableDarkmode,
  disableDarkmode,
  toggleNavlist,
  closeNavlist,
  debounce
} from '../utils/ulitityFunctions.js'
import weathercodeConvert from '../utils/weathercode.js'
import { countriesFlags, convertName } from '../utils/countryFlags.js'

//toggleNavlist

getEl('.nav-btn').addEventListener('click', toggleNavlist)
window.addEventListener('click', closeNavlist)

// darkmodeToggle

const darkmodeToggle = getEl('#darkmode-toggle')
const initialDarkmodeSettings = getLocalStorage('darkmode')
if (initialDarkmodeSettings) {
  darkmodeToggle.checked = false
  enableDarkmode()
} else {
  darkmodeToggle.checked = true
  disableDarkmode()
}

darkmodeToggle.addEventListener('click', () => {
  if (darkmodeToggle.checked) disableDarkmode()
  if (!darkmodeToggle.checked) enableDarkmode()
})

// administer logic
let baseGEOUrl = 'https://geocoding-api.open-meteo.com/v1/search?name='
let reverseGEOBaseUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?`
let baseWeatherUrl =
  'https://api.open-meteo.com/v1/forecast?timezone=auto&current_weather=true'
let userLocations = getLocalStorage('locationCollection') || []
const gps = getLocalStorage('gps')

const renderEmptyCard = () => {
  getEl('#favorite-tile').innerHTML = `
  <div class="favorite-container">
    <div class="empty-container">
      <h3>You have not chosen a favorite location yet.</h3>
      <button class="jump-to-search-btn">Click here to add a location</button>
    </div>
  </div>
  `
  getEl('.jump-to-search-btn').addEventListener('click', () => getEl('#location').focus())
}
// TODO render it into favorite card
const setFavorite = (e) => {
  if(!e.target.closest('.favorite-slot')) return
  const isStarActive = document.querySelector('.star-active')
  console.log(isStarActive)
  if(isStarActive){
    if(e.target.matches('.star-active')) return
    getEl('.star-active').classList.remove('star-active')
  }
  const long = e.target.closest('.saved-location-tile').dataset.longitude
  const lat = e.target.closest('.saved-location-tile').dataset.latitude
  e.target.closest('.fa-star').classList.add('star-active')
  let isGPS = false;
  if(e.target.closest('.saved-location-tile').querySelector('.fa-location-dot')) {
    isGPS = true
  }
  const newUserLocations = userLocations.map(el => {
    if(el.dataArray[0].longitude === +long && el.dataArray[0].latitude === +lat && el.gps === isGPS) {
      return {...el, favorite: true}
    }
    return {...el, favorite: false}
  })
  
  setLocalStorage('locationCollection', newUserLocations)
  renderFavoriteCard({longitude: long, latitude: lat}, isGPS)
}

const removeSingleItem = (e) => {
  const lat = e.target.closest('.saved-location-tile').dataset.latitude
  const long = e.target.closest('.saved-location-tile').dataset.longitude
  console.log(userLocations, lat, long)
  for(let i = 0; i<userLocations.length; i++) {
    if(userLocations[i].dataArray[0].latitude === +lat && userLocations[i].dataArray[0].longitude === +long) {
      if(userLocations[i].favorite === true) {
        renderEmptyCard()
      }
      userLocations.splice(i, 1)
      if(userLocations.length === 0) {
        renderEmptyCard()
        setLocalStorage('locationCollection', [])
      } else {
        setLocalStorage('locationCollection', userLocations)
      }
      e.target.closest('.saved-location-tile').remove()
      
    }
  }
}

const addRemoveEvents = () => {
  getEls('.fa-trash').forEach((el) => {
    el.addEventListener('click', removeSingleItem)
  })
}

const renderCollection = () => {
  getEl('.saved-locations-container').innerHTML = userLocations?.map(el => {
    const {
        city,
        longitude,
        latitude,
        countryName,
        localityInfo: { administrative },
      } = el.dataArray[0]
    const { name: state } = administrative[1]
    return `
          <div data-longitude="${longitude}" data-latitude="${latitude}" class="saved-location-tile">
            ${el.gps ? "<div style='display: none'></div>" : '<div class="trash-icon"><i class="fas fa-trash"></i></div>'}
            <div class="tile-location-geo">
              <h3 class="tile-location-name">${city}${
      el.gps ? "<i class='fas fa-location-dot'></i>" : '<div></div>'
    }</h3>
              <h4 class="tile-admin-name">${state}, ${countryName}</h4>
              <p class="tile-location-time">${new Date().toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}</p>
            </div>
            <div class="favorite-slot">${
              el.favorite
                ? "<i class='fas fa-star star-active'></i>"
                : "<i class='fas fa-star'></i>"
            }
          </div>
          </div>
    `
  }).join("")
  getEls('.fa-star').forEach(el => {
    el.addEventListener('click', setFavorite)
  })
}

const renderFavoriteCard = async({longitude: long, latitude: lat}, gps = false) => {

  if(!long || !lat) return
  let url = `${reverseGEOBaseUrl}longitude=${long}&latitude=${lat}`
  const fetchedLocation = await axios(url)
  if(fetchedLocation.status !== 200) throw new Error()
  const {
    data: {
      city,
      longitude,
      latitude,
      countryName,
      localityInfo: { administrative },
    },
  } = fetchedLocation
  const {name: state} = administrative[1]
  
  
  url = `${baseWeatherUrl}&longitude=${longitude}&latitude=${latitude}`
  const fetchedWeather = await axios(url)
  if (fetchedWeather.status !== 200) throw new Error()
  const {data: {current_weather: {temperature, weathercode}}} = fetchedWeather
  
  getEl('#favorite-tile').innerHTML = `
          <h2 class="favorite-tile-headline">Favorite Location</h2>
          <div class="favorite-container">
            <div class="location-geo">
              <h3 class="location-name">${city}${gps ? "<i class='fas fa-location-dot'></i>" : "<div></div>"}</h3>
              <h4 class="admin-name">${state}, ${countryName}</h4>
              <p class="location-time">${new Date().toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}</p>
            </div>
            <div class="location-weather">
              <div class="current-temperature">
                <i class="fas ${
                  new Date().getHours() > 8 && new Date().getHours() < 19
                    ? 'fa-sun'
                    : 'fa-moon'
                }"></i>
                <span>${temperature}</span>
              </div>
            <div class="weathercode">${weathercodeConvert(weathercode)}</div>
            </div>
          </div>
  `
}

const extendDataArray = async({longitude: long, latitude: lat}, gps = false, favorite = false) => {
  let url = `${reverseGEOBaseUrl}longitude=${long}&latitude=${lat}`
  const fetchedLocation = await axios(url)
  if (fetchedLocation.status !== 200) throw new Error()
  url = `${baseWeatherUrl}&longitude=${long}&latitude=${lat}`
  const fetchedWeather = await axios(url)
  if (fetchedWeather.status !== 200) throw new Error()
  console.log(fetchedLocation)
  const returnValue = {dataArray: [fetchedLocation.data, fetchedWeather.data], gps, favorite}
  console.log(returnValue)
  return returnValue
}

const renderFirstPaint = async() => {
  if(gps && userLocations.length === 0) {
    const gpsData = await extendDataArray(gps, true, true)
    userLocations = [gpsData]
    setLocalStorage('locationCollection', userLocations)
    renderFavoriteCard(gps, true)
    if(getEl('.loading')) {
      wait(500).then(() => getEl('.loading').remove())
    }
  } else if (
    (!gps && userLocations.length === 0)
  ) {
    if (getEl('.loading')) {
      wait(500).then(() => getEl('.loading').remove())
    }
    renderEmptyCard()
  } else if (userLocations.length > 0 && !userLocations?.find((el) => el.favorite)) {
        if (getEl('.loading')) {
          wait(500).then(() => getEl('.loading').remove())
        }
        renderEmptyCard()
        renderCollection()
        addRemoveEvents()
  } else {
    if (userLocations?.length === 0) return
    const favLocation = userLocations?.find((el) => el.favorite)

    renderFavoriteCard(favLocation.dataArray[0], favLocation.gps)
    renderCollection()

    if (getEl('.loading')) {
      wait(500).then(() => getEl('.loading').remove())
    }
    addRemoveEvents()
  }
}

renderFirstPaint()

const updateDebounceText = debounce((e) => {
  handleQuery(e)
}, 500)

const renderSearchResults = (arr) => {
  getEl('.query-container').innerHTML = arr.map((el) => {
    const { name, longitude, latitude, country, country_code, admin1 } = el
    console.log(name, country, country_code, admin1)
    let flag = null;
    for ( let key in countriesFlags) {
      if (
        key === convertName(country) ||
        countriesFlags[key].alias === convertName(country)
      ) {
        flag = countriesFlags[key].mini
      }
    }
    return `
      <div data-longitude=${longitude} data-latitude=${latitude} tabindex="0" class="query-single-item">
        <header class="single-item-header">
          <h4>${name}</h4>
          <h5>${admin1}, ${country_code}</h5>
        </header>
        <img class="single-item-flag" src='${flag}' alt="flag">
      </div>
    `
  }).join("")
}

const hideQueryList = () => {
  getEl('.query-container').className = 'query-container'
}


window.addEventListener('click', (e) => {
  if(!e.target.closest('.query-container')) {
    hideQueryList()
    cleanUpEventListener()
  }
})

const addToListByMouse = async(e) => {
  const lat = e.target.closest('.query-single-item').dataset.latitude
  const long = e.target.closest('.query-single-item').dataset.longitude
  const newData = await extendDataArray({ longitude: long, latitude: lat })
  userLocations = [
    ...userLocations, newData ] || [newData]
  setLocalStorage('locationCollection', userLocations)
  renderCollection()
  hideQueryList()
  
  cleanUpEventListener()
  addRemoveEvents()
}

const addToListByKey = async(e) => {
  if(e.key !== "Enter") return
  const lat = e.target.dataset.latitude
  const long = e.target.dataset.longitude
  const newData = await extendDataArray({ longitude: long, latitude: lat })
  userLocations = [...userLocations, newData] || [newData]
  setLocalStorage('locationCollection', userLocations)
  renderCollection()
  hideQueryList()
  
  cleanUpEventListener()
  addRemoveEvents()
}



const handleQuery = async(e) => {
  let url = `${baseGEOUrl}${e.target.value}`
  let fetchedPositions = await axios(url)
  if(!fetchedPositions.status === 200) return
  const {data: {results}} = fetchedPositions
  console.log(results)
  if(results) {
    getEl('.query-container').className += " query-active"
  } else {
    return hideQueryList()
  }
  renderSearchResults(results)
  getEls('.query-single-item').forEach(el => {
    el.addEventListener('click', addToListByMouse)
    el.addEventListener('keydown', addToListByKey)
  })
}

const cleanUpEventListener = () => {
    getEls('.query-single-item').forEach((el) => {
      el.removeEventListener('click', addToListByMouse)
      el.removeEventListener('keydown', addToListByKey)
    })
}


getEl('#location').addEventListener('keyup', updateDebounceText)