import React from 'react'
import PropTypes from 'prop-types'

/**
 * FilmDrop error boundary.
 *
 * onError contract: onError(error, { componentStack, phase }) — synchronous,
 * must not throw. Fires at most once per error instance. If onError is
 * omitted we console.error and render the fallback UI.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    const { onError } = this.props
    const payload = {
      componentStack: info?.componentStack || '',
      phase: 'render'
    }
    if (typeof onError === 'function') {
      try {
        onError(error, payload)
      } catch (handlerErr) {
        console.error('FilmDrop onError handler threw:', handlerErr)
      }
    } else {
      console.error('FilmDrop error boundary caught:', error, payload)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error)
          : this.props.fallback
      }
      return (
        <div
          role="alert"
          className="filmdrop-error-boundary"
          style={{ padding: '1rem' }}
        >
          <h2>Something went wrong.</h2>
          <p>
            FilmDrop encountered an error. Please reload the page. If the
            problem persists, contact support.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  onError: PropTypes.func,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  children: PropTypes.node
}
