const weathercodeConvert = (code) => {
 const codeNumber = +code

 const weathercodeObject = {
   0: 'Clear sky',
   1: 'Mainly clear sky',
   2: 'Partly cloudy Sky',
   3: 'Overcast',
   45: 'Fog and depositing rime fog',
   48: 'Fog and depositing rime fog',
   51: 'Drizzle: Light intensity',
   53: 'Drizzle: Moderate intensity',
   55: 'Drizzle: Dense intensity',
   56: 'Freezing Drizzle: Light intensity',
   57: 'Freezing Drizzle: Dense intensity',
   61: 'Rain: Slight intensity',
   63: 'Rain: Moderate intensity',
   65: 'Rain: Heavy intensity',
   66: 'Freezing Rain: Light intensity',
   67: 'Freezing Rain: Heavy intensity',
   71: 'Snow fall: Slight intensity',
   73: 'Snow fall: Moderate intensity',
   75: 'Snow fall: Heavy intensity',
   77: 'Snow grains',
   80: 'Slight Rain showers',
   81: 'Moderate Rain showers',
   82: 'Violent Rain showers',
   85: 'Slight Snow showers',
   86: 'Heavy Snow showers',
   95: 'Thunderstorm',
   96: 'Thunderstorm with slight hail',
   99: 'Thunderstorm with heavy hail',
 }
 return weathercodeObject[codeNumber]
}
export default weathercodeConvert