"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Zap } from "lucide-react";

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[#0f111a] border-border/40 shadow-2xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="p-8 space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                Premium Access
              </span>
            </div>
            <DialogTitle className="text-3xl font-bold text-white">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base pt-2">
              You&apos;ve reached the free limit of 3 expenses per day. Upgrade to Pro for unlimited tracking and advanced insights.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {[
              "Unlimited transactions",
              "Advanced AI insights & reports",
              "Smart budget alerts",
              "Multi-currency support",
              "Spending trend analysis",
              "Export to CSV & PDF",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/20 border-none"
              onClick={() => {
                // We'll use the monthly price by default for the modal
                window.location.href = "/#pricing";
              }}
            >
              <Zap className="mr-2 h-5 w-5 fill-current" />
              Upgrade for ₹9/mo
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground hover:text-white">
              Maybe later
            </Button>
          </DialogFooter>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
      </DialogContent>
    </Dialog>
  );
}
