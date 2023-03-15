// function to convert DateTime Range Picker values to STAC compliant format
function convertDateTime(dateTime) {
  return (
    dateTime.getUTCFullYear() +
    '-' +
    ('0' + (dateTime.getUTCMonth() + 1)).slice(-2) +
    '-' +
    ('0' + dateTime.getUTCDate()).slice(-2) +
    'T' +
    '00:00:00Z'
  )
}

// date used for STAC API request for mosaic view
export const convertDate = (dateTimeRef) => {
  const fromDate = convertDateTime(dateTimeRef[0])
  const toDate = convertDateTime(dateTimeRef[1])

  return `${fromDate}/${toDate}`
}

// date used for STAC API request for scene view
export const convertDateForURL = (dateTimeRef) =>
  encodeURIComponent(convertDate(dateTimeRef))
