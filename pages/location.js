import { getLocalStorage } from '../utils/localStorage.js'
import axios from 'axios'
import {
  getEl,
  enableDarkmode,
  disableDarkmode,
  toggleNavlist,
  closeNavlist,
} from '../utils/ulitityFunctions.js'
import weathercodeConvert from '../utils/weathercode.js'

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

// location logic

let baseWeatherUrl =
  'https://api.open-meteo.com/v1/forecast?timezone=auto&current_weather=true&daily=temperature_2m_max,precipitation_hours,precipitation_sum,sunrise,sunset,weathercode,temperature_2m_min&hourly=temperature_2m&'
const favoritePosition = getLocalStorage('locationCollection').find(
  (el) => el.favorite
)
document.title = `Weather the weather in ${favoritePosition.dataArray[0].city}`
getEl(
  '.nav-headline span'
).innerHTML = `Weather in ${favoritePosition.dataArray[0].city}`


const renderHourlyWeather = (chartData) => {
  const chartConfig = {
    type: 'line',
    renderAt: 'chart-container',
    width: '100%',
    height: '400',
    dataFormat: 'json',
    dataSource: {
      // Chart Configuration
      chart: {
        caption: 'Temperature in the next 24 hours',
        xAxisName: 'Time in hours',
        yAxisName: 'Temperature in °C',
        theme: 'fusion',
      },
      // Chart Data
      data: chartData,
    },
  }
  FusionCharts.ready(function () {
    var fusioncharts = new FusionCharts(chartConfig)
    fusioncharts.render()
  })
}

const renderGeneralInfo = ({weathercode: code, windspeed, temperature}) => {
  getEl('.weather-data').innerHTML = `
              <td>${
                temperature
              } °C</td>
              <td>${weathercodeConvert(
                code
              )}</td>
              <td>${
                windspeed
              } m/s</td>
  `
}

const renderDailyWeather = ({
  sunrise,
  sunset,
  weathercode: code,
  temperature_2m_max: maxT,
  temperature_2m_min: minT,
  time
}) => {
  getEl('.daily-table-body').innerHTML = time.map((el, index) => {
    return `
            <tr>
              <td>${el.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3.$2.$1')}</td>
              <td>${sunrise[index].slice(
                sunrise[index].length - 5,
                sunrise[index].length
              )}</td>
              <td>${minT[index]}°C</td>
              <td>${maxT[index]}°C</td>
              <td>${weathercodeConvert(code[index])}</td>
              <td>${sunset[index].slice(
                sunset[index].length - 5,
                sunset[index].length
              )}</td>
            </tr>
    `
  }).join("")
}

const renderDailyRainSum = ({
  precipitation_sum: rainSum,
  precipitation_hours: rainHours,
  time
}) => {
  const chartData = time.reduce((total, curr, index) => {
    const singleItemObj = {
      label: curr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3.$2.$1'), value: rainSum[index]
    }
    if(total.length === 0) return total = [singleItemObj]
    return total = [...total, singleItemObj]
  }, [])
  const chartConfig = {
    type: 'line',
    renderAt: 'chart-rain-container',
    width: '100%',
    height: '400',
    dataFormat: 'json',
    dataSource: {
      // Chart Configuration
      chart: {
        caption: 'Sum of rain for the next 7 days',
        numbersuffix: " mm",
        xAxisName: 'Time in days',
        yAxisName: 'Sum of rain',
        theme: 'fusion',
      },
      // Chart Data
      data: chartData,
    },
  }
  FusionCharts.ready(function () {
    var fusioncharts = new FusionCharts(chartConfig)
    fusioncharts.render()
  })
}
const renderDailyRainHours = ({
  precipitation_sum: rainSum,
  precipitation_hours: rainHours,
  time
}) => {
  const chartData = time.reduce((total, curr, index) => {
    const singleItemObj = {
      label: curr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3.$2.$1'), value: rainHours[index]
    }
    if(total.length === 0) return total = [singleItemObj]
    return total = [...total, singleItemObj]
  }, [])
  const chartConfig = {
    type: 'line',
    renderAt: 'chart-rainHours-container',
    width: '100%',
    height: '400',
    dataFormat: 'json',
    dataSource: {
      // Chart Configuration
      chart: {
        caption: 'Sum of rain for the next 7 days',
        numbersuffix: " h",
        xAxisName: 'Time in days',
        yAxisName: 'Raining hours',
        theme: 'fusion',
      },
      // Chart Data
      data: chartData,
    },
  }
  FusionCharts.ready(function () {
    var fusioncharts = new FusionCharts(chartConfig)
    fusioncharts.render()
  })
}

const getChartData = async () => {
  let url = `${baseWeatherUrl}&longitude=${favoritePosition.dataArray[0].longitude}&latitude=${favoritePosition.dataArray[0].latitude}`

  const fetchedWeatherData = await axios(url)
  if (fetchedWeatherData.status !== 200) throw new Error()
  if (getEl('.loading')) {
    getEl('.loading').remove()
  }
  const {
    data: {
      hourly: { time, temperature_2m: temp },
      daily: {
        temperature_2m_max: maxT,
        temperature_2m_min: minT,
        weathercode: code,
      },
    },
  } = fetchedWeatherData
  const hourlyData = time
    .reduce((total, curr, index) => {
      const singleItemObj = {
        label: `${new Date(curr).getHours().toString()}:00`,
        value: temp[index],
      }

      if (!total.length) {
        total = [singleItemObj]
        return total
      }
      total = [...total, singleItemObj]

      return total
    }, [])
    .slice(0, 24)
  renderHourlyWeather(hourlyData)
  renderDailyWeather(fetchedWeatherData.data.daily)
  renderDailyRainSum(fetchedWeatherData.data.daily)
  renderDailyRainHours(fetchedWeatherData.data.daily)
  renderGeneralInfo(fetchedWeatherData.data.current_weather)
}

getChartData()
