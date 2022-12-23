class CustomError{
 constructor(message, rootElement){
  this.message = message;
  this.rootElement = rootElement;
  this.x = rootElement.offsetLeft + rootElement.offsetHeight;
  this.y = rootElement.offsetTop + rootElement.offsetWidth;
  this.errorTimeout = null;
  this.html = this.generateHTML()
 }

 generateHTML(){
  const errorBox = document.createElement('div')
  errorBox.classList.add('error-container')
  errorBox.innerHTML = `
   <h4>Error</h4>
   <h5>${this.message}</h5>
  `
  errorBox.style.top = `${this.y}`
  errorBox.style.left = `${this.x}`
  document.body.insertAdjacentElement("afterbegin", errorBox)
  this.errorTimeout = setTimeout(() => {
   if(!getEl('.error-container')) return
   getEl('.error-container').remove()
  })
 }

}

// You can't delete a location that is set as favorite.
//    Please set another location as favorite first
export default CustomError