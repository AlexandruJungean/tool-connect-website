/**
 * Next.js 16 Instrumentation
 * Used for monitoring, tracing, and initialization code that runs once
 * when the server starts up.
 */

export async function register() {
  // This runs once when the server starts
  
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization (Node.js runtime)
    console.log('[Instrumentation] Server initialized')
    
    // You can initialize monitoring services here
    // Example: Sentry, OpenTelemetry, etc.
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    console.log('[Instrumentation] Edge runtime initialized')
  }
}

// Called when an error is caught during rendering
export function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string }
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'render' | 'route' | 'action' | 'middleware'
    renderSource: 'react-server-components' | 'react-server-components-payload' | 'server-rendering'
    revalidateReason: 'on-demand' | 'stale' | undefined
    renderType: 'dynamic' | 'dynamic-resume'
  }
) {
  // Log errors to your monitoring service
  console.error('[Request Error]', {
    error: error.message,
    digest: error.digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  })
  
  // Example: Send to error tracking service
  // await sendToErrorTracking({
  //   error,
  //   request,
  //   context,
  // })
}

