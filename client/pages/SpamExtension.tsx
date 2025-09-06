import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Shield,
  Puzzle,
  CheckCircle,
  Info,
  ExternalLink,
} from "lucide-react";

export default function SpamExtension() {
  const handleInstall = () => {
    window.open("https://chromewebstore.google.com/detail", "_blank");
  };

  const handleOpenExtension = () => {
    const extensionId = import.meta.env.VITE_SPAM_EXTENSION_ID as
      | string
      | undefined;
    if (!extensionId) {
      alert(
        "Set VITE_SPAM_EXTENSION_ID to your installed extension ID to open the popup.",
      );
      return;
    }

    // Try to open the popup programmatically first
    try {
      // @ts-ignore chrome types not available in Vite env
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        // @ts-ignore
        chrome.runtime.sendMessage(
          extensionId,
          { type: "OPEN_EXTENSION_POPUP" },
          (response: any) => {
            if (!response || response.success === false) {
              // Fallback: open popup page directly
              const url = `chrome-extension://${extensionId}/${response?.popupPath || "popup.html"}`;
              window.open(url, "_blank");
            }
          },
        );
        return;
      }
    } catch (e) {
      // ignore and fallback below
    }

    // Final fallback
    const url = `chrome-extension://${extensionId}/popup.html`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Spam Extension</h1>
          <p className="text-muted-foreground">
            Enhance detection in your browser with our threat extension
          </p>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button onClick={handleInstall} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Add Extension
          </Button>
          <Button
            onClick={handleOpenExtension}
            className="flex items-center justify-center w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Extension
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-primary" />
            What you get
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Real-time Link Guard</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Scans links and pages for phishing indicators before you click.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Email Overlay</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shows risk scores on webmail interfaces to prevent mistakes.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Auto-report Spam</span>
              </div>
              <p className="text-sm text-muted-foreground">
                One-click reporting feeds your analytics and filtering rules.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium">Supported Browsers</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">Chrome</Badge>
              <Badge variant="secondary">Edge</Badge>
              <Badge variant="secondary">Brave</Badge>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              After installing, sign in inside the extension to link with your
              SecureMail account.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
            <span>Click “Add Extension” above and install from the store.</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
            <span>
              Open the extension, sign in with your SecureMail credentials.
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
            <span>Toggle Real-time Link Guard to enable page scanning.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
