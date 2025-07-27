import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Warning, ArrowClockwise, House } from '@phosphor-icons/react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  React.useEffect(() => {
    // Log error for debugging
    console.error('Component Error:', error);
  }, [error]);

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Warning className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This section encountered an error and couldn't load properly.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={resetErrorBoundary}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <ArrowClockwise className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <House className="mr-2 h-4 w-4" />
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}