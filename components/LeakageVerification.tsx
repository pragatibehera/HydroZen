"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { uploadImage } from "@/lib/firebase";
import { verifyLeakageImage } from "@/lib/gemini";
import { addPointsForLeakage } from "@/lib/points";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import { Loader2 } from "lucide-react";

export function LeakageVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const user = useUser();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadStatus("");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedImage || !user) return;

    try {
      setIsLoading(true);
      setUploadStatus("Uploading image...");

      // Upload image to Firebase
      const imageUrl = await uploadImage(selectedImage);
      console.log("Image uploaded:", imageUrl);
      setUploadStatus("Verifying image...");

      // Verify image using Gemini AI
      const verificationResult = await verifyLeakageImage(imageUrl);
      console.log("Verification result:", verificationResult);

      if (verificationResult.isLeakage && verificationResult.confidence > 0.7) {
        setUploadStatus("Adding points...");
        // Add points to user's account
        await addPointsForLeakage(user.id, imageUrl, verificationResult);

        toast({
          title: "Leakage Verified!",
          description: `${verificationResult.description}. Points have been added to your account!`,
        });

        // Clear the form
        setSelectedImage(null);
        setPreviewUrl(null);
        setUploadStatus("");
      } else {
        toast({
          title: "Not a Valid Leakage",
          description: verificationResult.description,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process the image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <p className="text-center text-gray-500">
          Please sign in to report water leakages and earn points.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium">
            Upload Leakage Image
          </label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={isLoading}
          />
        </div>

        {previewUrl && (
          <div className="mt-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={!selectedImage || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Leakage"
          )}
        </Button>
      </form>
    </Card>
  );
}
