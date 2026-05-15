import { Link as WouterLink } from "wouter";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function Link({ href, children, className }: LinkProps) {
  return (
    <WouterLink href={href} className={className}>
      {children}
    </WouterLink>
  );
}
