import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

interface SavePropertyButtonProps {
  propertyData: {
    jurisdiction?: string;
    district?: string;
    address?: string;
    dimensions?: any;
    latitude?: number;
    longitude?: number;
  };
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function SavePropertyButton({ propertyData, canvasRef }: SavePropertyButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const savePropertyMutation = trpc.properties.saveProperty.useMutation({
    onSuccess: () => {
      toast.success('Property saved successfully!');
      setIsSaving(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save property');
      setIsSaving(false);
    },
  });

  const handleSave = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!propertyData.address || !propertyData.latitude || !propertyData.longitude) {
      toast.error('Property location data is missing');
      return;
    }

    setIsSaving(true);

    const name = propertyData.address || 'Unnamed Property';

    // Capture thumbnail from canvas
    let thumbnailDataUrl: string | undefined;
    if (canvasRef?.current) {
      try {
        thumbnailDataUrl = canvasRef.current.toDataURL('image/png');
      } catch (error) {
        console.error('Failed to capture thumbnail:', error);
        // Continue without thumbnail
      }
    }

    savePropertyMutation.mutate({
      name,
      address: propertyData.address,
      latitude: propertyData.latitude.toString(),
      longitude: propertyData.longitude.toString(),
      zoningCode: propertyData.district,
      zoningDescription: `${propertyData.jurisdiction} - ${propertyData.district}`,
      zoningDataJson: propertyData.dimensions,
      municipalityUrl: propertyData.jurisdiction ? `https://www.brevardfl.gov/` : undefined,
      tags: [propertyData.jurisdiction, propertyData.district].filter(Boolean).join(','),
      thumbnail: thumbnailDataUrl,
    });
  };

  return (
    <Button onClick={handleSave} disabled={isSaving} className="w-full">
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save Property
        </>
      )}
    </Button>
  );
}
