import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { TermsContent } from "../../features/marketing/pages/Terms";
import { PrivacyContent } from "../../features/marketing/pages/Privacy";

interface LegalModalProps {
  type: "terms" | "privacy" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalModal({ type, open, onOpenChange }: LegalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-4 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100 mb-0">
          <DialogTitle className="text-2xl font-black text-gray-900">
            {type === "terms" ? "Terms of Service" : "Privacy Policy"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-500">
            {type === "terms"
              ? "Please read these terms carefully before using our services."
              : "We are committed to protecting your personal data and your right to privacy."}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          {type === "terms" && (
            <div className="-mt-8">
              <TermsContent className="py-8 space-y-8" />
            </div>
          )}
          {type === "privacy" && (
            <div className="-mt-8">
              <PrivacyContent className="py-8 space-y-8" />
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer text-sm shadow-sm"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
