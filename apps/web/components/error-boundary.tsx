'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode | ((reset: () => void, error: Error | null) => ReactNode)
  onReset?: () => void
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return (this.props.fallback as (reset: () => void, error: Error | null) => ReactNode)(
            this.reset,
            this.state.error,
          )
        }
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="text-destructive text-4xl">!</div>
          <h2 className="text-xl font-semibold">Algo deu errado</h2>
          <p className="text-muted-foreground max-w-md text-center text-sm">
            {this.state.error?.message ?? 'Ocorreu um erro inesperado.'}
          </p>
          <button
            onClick={this.reset}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
