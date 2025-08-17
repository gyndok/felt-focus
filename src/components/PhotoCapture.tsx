import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Camera as CameraIcon, Image as ImageIcon, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PhotoCaptureProps {
  onPhotoCapture: (imageUrl: string | null) => void;
  currentPhoto?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, currentPhoto }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentPhoto || null);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadImageToSupabase = async (imageBase64: string, fileName: string) => {
    if (!user) throw new Error('User not authenticated');

    // Convert base64 to blob
    const response = await fetch(imageBase64);
    const blob = await response.blob();

    const filePath = `${user.id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const captureFromCamera = async () => {
    try {
      setIsUploading(true);
      
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        const fileName = `receipt_${Date.now()}.jpg`;
        const imageUrl = await uploadImageToSupabase(image.dataUrl, fileName);
        
        setPreviewImage(image.dataUrl);
        onPhotoCapture(imageUrl);
        
        toast({
          title: "Photo captured",
          description: "Receipt photo has been saved successfully",
        });
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: "Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      setIsUploading(true);
      
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        const fileName = `receipt_${Date.now()}.jpg`;
        const imageUrl = await uploadImageToSupabase(image.dataUrl, fileName);
        
        setPreviewImage(image.dataUrl);
        onPhotoCapture(imageUrl);
        
        toast({
          title: "Photo selected",
          description: "Receipt photo has been saved successfully",
        });
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      toast({
        title: "Error",
        description: "Failed to select photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleWebFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Convert file to data URL for preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewImage(dataUrl);
        
        try {
          const fileName = `receipt_${Date.now()}.${file.name.split('.').pop()}`;
          const imageUrl = await uploadImageToSupabase(dataUrl, fileName);
          
          onPhotoCapture(imageUrl);
          
          toast({
            title: "Photo uploaded",
            description: "Receipt photo has been saved successfully",
          });
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast({
            title: "Error",
            description: "Failed to upload photo. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process photo. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setPreviewImage(null);
    onPhotoCapture(null);
    
    toast({
      title: "Photo removed",
      description: "Receipt photo has been removed",
    });
  };

  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Receipt Photo (Optional)</div>
      
      {previewImage ? (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="relative">
              <img 
                src={previewImage} 
                alt="Receipt preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removePhoto}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {isNative ? (
            <>
              <Button
                variant="outline"
                onClick={captureFromCamera}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <CameraIcon className="w-4 h-4" />
                {isUploading ? 'Processing...' : 'Take Photo'}
              </Button>
              
              <Button
                variant="outline"
                onClick={selectFromGallery}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                {isUploading ? 'Processing...' : 'Choose from Gallery'}
              </Button>
            </>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleWebFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="photo-upload"
              />
              <Button
                variant="outline"
                disabled={isUploading}
                className="w-full flex items-center gap-2"
                asChild
              >
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload Receipt Photo'}
                </label>
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {isNative ? 
          'Capture a new photo or select from your gallery' : 
          'Upload a photo of your receipt for record keeping'
        }
      </div>
    </div>
  );
};