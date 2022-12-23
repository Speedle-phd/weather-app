export const setLocalStorage = (key, toBeStored = null) => {
 if(window === "undefined") return
 if(!toBeStored) return localStorage.removeItem(key)
 localStorage.setItem(key, JSON.stringify(toBeStored))
}

export const getLocalStorage = (key) => {
 if(!localStorage.getItem(key)) return
 const localStorageData = JSON.parse(localStorage.getItem(key))
 return localStorageData
}