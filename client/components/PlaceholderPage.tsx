import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Construction className="h-5 w-5 text-warning" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <Construction className="h-16 w-16 text-warning mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Page Under Development</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {description || `The ${title} page is currently being developed. Please check back later or continue prompting to help build this feature.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
