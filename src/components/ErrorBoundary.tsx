import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-destructive/20 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground text-center">
                An unexpected error occurred while loading this section.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={resetErrorBoundary}
                variant="default"
                size="sm"
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function ErrorBoundary({ children, fallback: Fallback = ErrorFallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, errorInfo) => {
        // Log error for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error Boundary caught an error:', error, errorInfo);
        }
      }}
      onReset={() => {
        // Optionally clear any error-related state here
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}