import { RecipientHeader } from "@/components/recipient/RecipientHeader";

export default function RecipientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-100">
      <RecipientHeader />
      {children}
    </div>
  );
}
