// throttle function to prevent map from rendering too quickly
export default function debounce(func, waitInMillis) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, waitInMillis)
  }
}
