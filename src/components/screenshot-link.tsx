import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function ScreenshotLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  if (!path) return null;

  const open = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("payment-screenshots")
        .createSignedUrl(path, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="View payment screenshot"
      disabled={loading}
      onClick={open}
    >
      <ImageIcon className="h-4 w-4" />
    </Button>
  );
}
