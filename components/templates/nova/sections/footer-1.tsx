import Link from 'next/link'

const Logo = ({ className }: { className?: string }) => (
  <svg
    className={`text-foreground h-5 w-auto ${className ?? ""}`}
    viewBox="0 0 120 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="LabourIn logo"
  >
    <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="5.25" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7 20V8h1.5v10.5h5.5V20H7Z"
      fill="currentColor"
    />
    <circle cx="19" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.25" />
    <path d="M19 12.5V20" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <text x="32" y="20" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="600" letterSpacing="-0.02em">LabourIn</text>
  </svg>
);

const links = {
    services: [
        { label: 'Electricians', href: '/select-role' },
        { label: 'Plumbers', href: '/select-role' },
        { label: 'AC Technicians', href: '/select-role' },
        { label: 'Carpenters', href: '/select-role' },
        { label: 'Painters', href: '/select-role' },
    ],
    cities: [
        { label: 'Lahore', href: '/select-role' },
        { label: 'Karachi', href: '/select-role' },
        { label: 'Islamabad', href: '/select-role' },
    ],
    platform: [
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQs', href: '#faqs' },
    ],
    legal: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'CNIC Policy', href: '#' },
    ],
}

export default function Footer() {
    return (
        <footer className="bg-background @container border-t py-12">
            <div className="mx-auto max-w-2xl px-6">
                <div className="@sm:grid-cols-3 grid grid-cols-2 gap-8">
                    <div className="col-span-full">
                        <Link
                            href="/"
                            className="flex items-center gap-2">
                            <Logo className="h-5 w-fit" />
                        </Link>
                        <p className="text-muted-foreground mt-4 max-w-xs text-sm">Verified workers, direct contact, zero commissions.</p>
                    </div>
                    <div>
                        <h3 className="text-foreground mb-3 text-sm font-medium">Services</h3>
                        <ul className="space-y-2">
                            {links.services.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-foreground mb-3 text-sm font-medium">Cities</h3>
                        <ul className="space-y-2">
                            {links.cities.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-foreground mb-3 text-sm font-medium">Platform</h3>
                        <ul className="space-y-2">
                            {links.platform.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
                    <p className="text-muted-foreground text-sm">&copy; {2026} LabourIn. All rights reserved.</p>
                    <div className="flex gap-4">
                        {links.legal.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
