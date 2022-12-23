import { setLocalStorage } from "./localStorage"

export const getEl = (selector) => {
 const element = document.querySelector(selector)
 if(!element) throw new Error(`No Element With Selector ${selector} was found`)
 return element
}
export const getEls = (selector) => {
 const element =
   [...document.querySelectorAll(selector)]
 if(!element) throw new Error(`No Element With Selector ${selector} was found`)
 return element
}
export const capitalize = (stringToCapizalize) => {
 const capitalized = `${stringToCapizalize[0].toUpperCase()}${stringToCapizalize.slice(
   1, stringToCapizalize.length)}`
 
 return capitalized
}

export const convertTime = (dateString) => {
  const date = new Date(dateString)
  const datetime = date.toLocaleTimeString('de-DE', {hour: "2-digit", minute: "2-digit", second:"2-digit"})
  return datetime
}

export const wait = (delay) => {
  return new Promise((res, rej) => {
    setTimeout(res, delay)
  })
}

export const enableDarkmode = () => {
  document.documentElement.classList.add('darkmode')
  setLocalStorage('darkmode', true)
}
export const disableDarkmode = () => {
  document.documentElement.classList.remove('darkmode')
  setLocalStorage('darkmode', undefined)
}

export const toggleNavlist = (e) => {
  if (getEl('.nav-btn').getAttribute('aria-expanded') === 'false') {
    getEl('.nav-btn').setAttribute('aria-expanded', 'true')
  } else {
    getEl('.nav-btn').setAttribute('aria-expanded', 'false')
  }
  getEl('.nav-links').classList.toggle('active')
}

export const closeNavlist = (e) => {
  if (!getEl('.nav-links')) return
  if (e.target.closest('.nav-links') || e.target.closest('.nav-btn')) return
  getEl('.nav-links').classList.remove('active')
}

export const debounce = (cb, delay = 1000) => {
  let timeout

  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
  }
}