// date used for STAC API request for mosaic view
export const convertDate = (dateTimeRef) => {
  return `${dateTimeRef[0]}/${dateTimeRef[1]}`
}

// date used for STAC API request for scene view
export const convertDateForURL = (dateTimeRef) =>
  encodeURIComponent(convertDate(dateTimeRef))

export function convertToUTC(dateString) {
  const [datePart, timePart] = dateString.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds] = timePart.slice(0, -1).split(':').map(Number)
  const utcDate = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds)
  )

  // Get the timezone offset in minutes
  const offsetInMinutes = utcDate.getTimezoneOffset()

  // Add the offset to the UTC date to get the correct date for UI presentation in datepicker
  const correctDate = new Date(utcDate.getTime() + offsetInMinutes * 60 * 1000)

  return correctDate
}
