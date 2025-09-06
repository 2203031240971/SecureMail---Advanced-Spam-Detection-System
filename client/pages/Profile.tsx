import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Shield, CheckCircle, AlertCircle, Crown, Link2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { SocialProvider } from '@/services/socialAuth';

export default function Profile() {
  const { user, updateUser, connectedProviders, disconnectProvider, socialLogin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context
      updateUser({
        name: formData.name,
        email: formData.email
      });
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleConnectProvider = async (provider: SocialProvider) => {
    setMessage(null);
    setIsLoading(true);

    try {
      const result = await socialLogin(provider);

      if (result.success) {
        setMessage({ type: 'success', text: `${provider === 'google' ? 'Google' : 'Apple'} account connected successfully!` });
      } else {
        setMessage({ type: 'error', text: result.error || `Failed to connect ${provider} account` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to connect ${provider} account. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectProvider = async (provider: SocialProvider) => {
    setMessage(null);

    try {
      const result = await disconnectProvider(provider);

      if (result.success) {
        setMessage({ type: 'success', text: `${provider === 'google' ? 'Google' : 'Apple'} account disconnected successfully!` });
      } else {
        setMessage({ type: 'error', text: result.error || `Failed to disconnect ${provider} account` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to disconnect ${provider} account. Please try again.` });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-success/50 text-success' : 'border-destructive/50 text-destructive'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-input border-border"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium relative">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                      {user?.role === 'admin' && (
                        <Crown className="absolute -top-1 -right-1 h-3 w-3 text-warning" />
                      )}
                    </div>
                    <span className="text-foreground font-medium">{user?.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-input border-border"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{user?.email}</span>
                    {user?.isVerified && (
                      <CheckCircle className="h-4 w-4 text-success ml-auto" />
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">Change your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Connections */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Connected Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your social accounts for easier sign-in and account recovery.
              </p>

              <div className="space-y-3">
                {/* Google Connection */}
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-foreground">Google</p>
                      <p className="text-xs text-muted-foreground">
                        {connectedProviders.includes('google') ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {connectedProviders.includes('google') ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectProvider('google')}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectProvider('google')}
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* Apple Connection */}
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-foreground">Apple</p>
                      <p className="text-xs text-muted-foreground">
                        {connectedProviders.includes('apple') ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {connectedProviders.includes('apple') ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectProvider('apple')}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectProvider('apple')}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Status Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {user?.role === 'admin' && <Crown className="h-3 w-3" />}
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>

              {/* Verification Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Verified</span>
                <div className="flex items-center gap-1">
                  {user?.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm">{user?.isVerified ? 'Verified' : 'Pending'}</span>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                Download Data
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" size="sm">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
