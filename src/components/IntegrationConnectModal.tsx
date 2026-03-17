import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

interface IntegrationConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationName: string;
  integrationId: string;
  credentialFields: CredentialField[];
  onConnect: (credentials: Record<string, string>) => Promise<void>;
  loading: boolean;
}

const IntegrationConnectModal = ({
  open, onOpenChange, integrationName, integrationId,
  credentialFields, onConnect, loading,
}: IntegrationConnectModalProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConnect(values);
    setValues({});
  };

  const toggleShow = (key: string) =>
    setShowFields((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-display">Connect {integrationName}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter your API credentials below. They are encrypted and stored securely.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {credentialFields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-xs font-medium">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id={field.key}
                  type={showFields[field.key] ? "text" : "password"}
                  placeholder={field.placeholder}
                  value={values[field.key] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  required={field.required}
                  maxLength={500}
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(field.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showFields[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ShieldCheck size={12} className="text-primary" />
            Credentials are encrypted at rest and never shared.
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 text-xs" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Connect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationConnectModal;
