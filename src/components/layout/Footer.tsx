import Link from "next/link";
import { Church, Heart } from "lucide-react";

const FOOTER_LINKS = {
  Ministry: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Events", href: "/events" },
  ],
  Connect: [
    { label: "Contact", href: "/contact" },
    { label: "Prayer Request", href: "/prayer-request" },
    { label: "Give", href: "/give" },
  ],
  Account: [
    { label: "Sign In", href: "/login" },
    { label: "Sign Up", href: "/signup" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Church className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">MHD Ministry</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A sacred online space dedicated to fostering spiritual growth,
              healing, and deliverance.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ministry of Healing and
            Deliverance. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-500 fill-red-500" />{" "}
            and faith
          </p>
        </div>
      </div>
    </footer>
  );
}
