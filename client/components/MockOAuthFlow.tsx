import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, X } from 'lucide-react';

interface MockUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  provider: 'google' | 'apple';
}

interface MockOAuthFlowProps {
  provider: 'google' | 'apple';
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: MockUser) => void;
}

const mockGoogleUsers: MockUser[] = [
  {
    id: 'google-1',
    email: 'john.doe@gmail.com',
    name: 'John Doe',
    picture: 'https://ui-avatars.com/api/?name=John+Doe&background=4285f4&color=fff',
    provider: 'google'
  },
  {
    id: 'google-2',
    email: 'sarah.wilson@gmail.com',
    name: 'Sarah Wilson',
    picture: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=ea4335&color=fff',
    provider: 'google'
  },
  {
    id: 'google-3',
    email: 'mike.johnson@company.com',
    name: 'Mike Johnson',
    picture: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=34a853&color=fff',
    provider: 'google'
  }
];

const mockAppleUsers: MockUser[] = [
  {
    id: 'apple-1',
    email: 'emma.smith@icloud.com',
    name: 'Emma Smith',
    picture: 'https://ui-avatars.com/api/?name=Emma+Smith&background=000000&color=fff',
    provider: 'apple'
  },
  {
    id: 'apple-2',
    email: 'david.brown@me.com',
    name: 'David Brown',
    picture: 'https://ui-avatars.com/api/?name=David+Brown&background=333333&color=fff',
    provider: 'apple'
  },
  {
    id: 'apple-3',
    email: 'lisa.garcia@privaterelay.appleid.com',
    name: 'Lisa Garcia',
    picture: 'https://ui-avatars.com/api/?name=Lisa+Garcia&background=666666&color=fff',
    provider: 'apple'
  }
];

export function MockOAuthFlow({ provider, isOpen, onClose, onLogin }: MockOAuthFlowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const users = provider === 'google' ? mockGoogleUsers : mockAppleUsers;
  const brandColor = provider === 'google' ? 'bg-blue-500' : 'bg-black';
  const brandName = provider === 'google' ? 'Google' : 'Apple';

  if (!isOpen) return null;

  const handleUserSelect = async (user: MockUser) => {
    setIsLoading(true);
    
    // Simulate OAuth processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onLogin(user);
    onClose();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {provider === 'google' ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              <CardTitle>Sign in with {brandName}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Choose an account to continue to SecureMail
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              className="w-full p-4 h-auto justify-start hover:bg-muted"
              onClick={() => handleUserSelect(user)}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                {isLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                )}
              </div>
            </Button>
          ))}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            🎭 This is a demo simulation of {brandName} OAuth
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
