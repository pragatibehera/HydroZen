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
import { Loader2, Upload } from "lucide-react";

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
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
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
      setUploadStatus("Uploading image to secure storage...");

      // Upload image to Firebase
      const imageUrl = await uploadImage(selectedImage);
      console.log("Firebase image URL:", imageUrl);

      setUploadStatus("Analyzing image with AI...");
      // Verify image using AI
      const verificationResult = await verifyLeakageImage(imageUrl);
      console.log("Verification result:", verificationResult);

      if (verificationResult.isLeakage && verificationResult.confidence > 0.7) {
        setUploadStatus("Verified! Processing rewards...");
        // Add points and create leakage report
        await addPointsForLeakage(user.id, imageUrl, verificationResult);

        toast({
          title: "Leakage Verified!",
          description:
            "Thank you for your report! Points have been added to your account.",
        });

        // Clear the form
        setSelectedImage(null);
        setPreviewUrl(null);
      } else {
        toast({
          title: "Not a Valid Leakage",
          description:
            verificationResult.description ||
            "The image doesn't show a clear water leakage. Please try another image.",
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
            : "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadStatus("");
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
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="mx-auto flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Leak Photo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Take a clear photo of the water leakage
            </p>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isLoading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" /> Select Photo
            </Button>
          </div>
        </div>

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {uploadStatus && (
          <div className="text-sm text-blue-500 text-center animate-pulse">
            {uploadStatus}
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

        <p className="text-xs text-gray-500 text-center">
          Supported formats: JPG, PNG. Maximum size: 5MB
        </p>
      </form>
    </Card>
  );
}
