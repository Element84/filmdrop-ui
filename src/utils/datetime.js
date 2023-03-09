// function to convert DateTime Range Picker values to STAC compliant format
export default function convertDateTimeForAPI(dateTimeRef, urlEscaped) {
  function convertDate(dateTime) {
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

  const fromDate = convertDate(dateTimeRef[0])
  const toDate = convertDate(dateTimeRef[1])

  const datetime = `${fromDate}/${toDate}`
  return urlEscaped ? encodeURIComponent(datetime) : datetime
}
