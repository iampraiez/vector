import { XMarkIcon } from "@heroicons/react/24/outline";
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-5 sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-100 mb-0 flex-row justify-between items-start space-y-0">
          <div className="flex-1">
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
              {type === "terms" ? "Terms of Service" : "Privacy Policy"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-500 mt-1">
              {type === "terms"
                ? "Please read these terms carefully before using our services."
                : "We are committed to protecting your personal data and your right to privacy."}
            </DialogDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 cursor-pointer -mt-1 -mr-1 group"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
          </button>
        </DialogHeader>
        <div className="px-6 pb-10">
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
      </DialogContent>
    </Dialog>
  );
}
