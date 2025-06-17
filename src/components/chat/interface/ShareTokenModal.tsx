import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShareTokenModalProps {
  shareToken: string | null;
  onClose: () => void;
}

export function ShareTokenModal({ shareToken, onClose }: ShareTokenModalProps) {
  if (!shareToken) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Chat Shared!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">
            Your chat has been shared. The link has been copied to your
            clipboard.
          </p>
          <div className="bg-slate-700 p-3 rounded text-sm text-slate-300 break-all mb-4">
            {`${window.location.origin}/shared/${shareToken}`}
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}