import { LearnLayoutChrome } from "@/components/learn/LearnLayoutChrome";

export default function AprenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearnLayoutChrome>{children}</LearnLayoutChrome>;
}
