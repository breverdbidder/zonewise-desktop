import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SavedProperties() {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: properties, isLoading } = trpc.properties.getProperties.useQuery();

  const deletePropertyMutation = trpc.properties.deleteProperty.useMutation({
    onSuccess: () => {
      toast.success('Property deleted');
      utils.properties.getProperties.invalidate();
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete property');
      setDeletingId(null);
    },
  });

  const handleDelete = (propertyId: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setDeletingId(propertyId);
      deletePropertyMutation.mutate({ propertyId });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Properties</CardTitle>
          <CardDescription>Loading your saved properties...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Properties</CardTitle>
          <CardDescription>Your saved property analyses will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved properties yet</p>
            <p className="text-sm mt-2">Analyze a property and save it to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Properties ({properties.length})</CardTitle>
        <CardDescription>Your saved property analyses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              {/* Thumbnail */}
              {property.thumbnail && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={property.thumbnail}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold">{property.name}</h3>
                    <p className="text-sm text-muted-foreground">{property.address}</p>
                  </div>
                </div>

                {property.zoningCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Zoning:</span>
                    <span className="text-muted-foreground">{property.zoningCode}</span>
                  </div>
                )}

                {property.tags && (
                  <div className="flex flex-wrap gap-2">
                    {property.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Saved {new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {property.municipalityUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(property.municipalityUrl || '', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(property.id)}
                  disabled={deletingId === property.id}
                >
                  {deletingId === property.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
