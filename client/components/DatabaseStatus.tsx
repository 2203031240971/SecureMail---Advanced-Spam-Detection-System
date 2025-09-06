import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { healthCheck } from '../services/api';

export function DatabaseStatus() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    isLoading: boolean;
    error?: string;
  }>({ isConnected: false, isLoading: true });

  const checkDatabaseStatus = async () => {
    try {
      setStatus({ isConnected: false, isLoading: true });
      const health = await healthCheck();
      setStatus({
        isConnected: health.database === 'connected',
        isLoading: false,
        error: health.database === 'disconnected' ? 'Database connection failed' : undefined
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: 'Failed to check database status'
      });
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  if (status.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database className="h-4 w-4 animate-pulse" />
        Checking database...
      </div>
    );
  }

  if (status.isConnected) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-success" />
        <Badge variant="secondary" className="bg-success/20 text-success border-success">
          Database Connected
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-warning" />
        <Badge variant="secondary" className="bg-warning/20 text-warning border-warning">
          Using Mock Data
        </Badge>
      </div>
      
      <Alert className="border-warning">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="text-sm">
              No database connected. The app is running with mock data for demonstration.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('#open-mcp-popover', '_self')}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Connect Database
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkDatabaseStatus}
                className="text-xs"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
