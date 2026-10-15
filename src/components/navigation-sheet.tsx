import { useState } from "react";
import { Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Vision & Mission", href: "#vision-mission" },
  { name: "Framework", href: "#framework" },
  { name: "Brands", href: "#brands" },
  { name: "Events", href: "#events" },
  { name: "Leadership", href: "#leadership" },
  { name: "Future Vision", href: "#roadmap" },
  { name: "Contact", href: "#contact" },
];

export const NavigationSheet = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="rounded-full w-10 h-10 p-0" size="icon" variant="outline" aria-label="Open Menu" />}>
        <Menu className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[85vw] max-w-[360px] p-6 flex flex-col justify-between bg-white/85 backdrop-blur-md border-l border-ink/10 text-ink shadow-2xl">
        <div>
          {/* Header */}
          <SheetHeader className="text-left pb-6 border-b border-ink/10">
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <Logo />
          </SheetHeader>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-base font-semibold text-ink hover:text-brand hover:bg-brand/[0.04] rounded-xl transition-all"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </nav>
        </div>

        {/* Footer CTA inside drawer */}
        <div className="pt-6 border-t border-ink/10 space-y-3">
          <a
            href="#specializations"
            onClick={() => setOpen(false)}
            className="block w-full"
          >
            <Button className="w-full rounded-full py-6 text-sm font-bold bg-[#0026ff] text-white shadow-md hover:bg-brand/90">
              Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
          <p className="text-center text-xs text-mute font-medium">
            © U Fill Academy. All rights reserved.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
