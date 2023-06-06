export function GetMosaicBoundsService(mosaicURL) {
  return new Promise(function (resolve, reject) {
    fetch(mosaicURL, {
      method: 'GET'
    })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error()
      })
      .then((json) => {
        resolve(json.bounds)
      })
      .catch((error) => {
        const message = 'Error Fetching Mosaicjson Tile Results'
        // log full error for diagnosing client side errors if needed
        console.error(message, error)
        reject(error)
      })
  })
}
