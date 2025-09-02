import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Settings, Key, CheckCircle, AlertCircle } from 'lucide-react';
// Simple toast replacement - you can integrate with your preferred toast library

interface AIConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  // Simple toast function for notifications
  const showToast = (title: string, description: string, variant?: 'destructive') => {
    console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`);
    // You can replace this with your preferred toast implementation
  };

  const handleConfigureAI = async () => {
    if (!apiKey.trim()) {
      showToast("Error", "Please enter a valid API key", "destructive");
      return;
    }

    setIsConfiguring(true);

    try {
      const response = await fetch('/api/maritime/configure-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      if (response.ok) {
        setIsConfigured(true);
        showToast("Success", "AI service configured successfully! Enhanced responses are now available.");
        
        // Clear the API key from state for security
        setApiKey('');
      } else {
        const error = await response.json();
        showToast("Configuration Failed", error.error || "Failed to configure AI service", "destructive");
      }
    } catch (error) {
      showToast("Error", "Failed to connect to AI service", "destructive");
    } finally {
      setIsConfiguring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Assistant Configuration
          </CardTitle>
          <CardDescription>
            Configure Gemini AI for enhanced maritime assistance with detailed port information, route analysis, and intelligent responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConfigured ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Gemini API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Enhanced Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Detailed port facility information</li>
                  <li>• Intelligent route optimization</li>
                  <li>• Weather pattern analysis</li>
                  <li>• Maritime regulation guidance</li>
                  <li>• Natural language queries</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleConfigureAI}
                  disabled={isConfiguring || !apiKey.trim()}
                  className="flex-1"
                >
                  {isConfiguring ? 'Configuring...' : 'Configure AI'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">AI Service Configured</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI assistant is now ready with enhanced capabilities. You can start asking detailed questions about ports, routes, and maritime operations.
              </p>
              <Button onClick={onClose} className="w-full">
                Start Using AI Assistant
              </Button>
            </>
          )}

          <div className="border-t pt-3">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Your API key is processed securely and not stored permanently. You may need to reconfigure after server restarts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
