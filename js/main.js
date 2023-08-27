import {showClearTextButton} from "./searchBar.js"

const initApp = () => {
  const search = document.getElementById('search')
  search.addEventListener('input', showClearTextButton)
}

initApp()