import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Pretty_Resume",
  description: "Get in touch with our team for any questions or support regarding our AI-powered resume builder.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 