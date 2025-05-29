import { Metadata } from "next";
import { AuthDialog } from "@/components/auth/auth-dialog";

export const metadata: Metadata = {
  title: "Login | Pretty_Resume",
  description: "Log in to your Pretty_Resume account to manage your resumes.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const showErrorDialog = params?.error === 'email_confirmation' || params?.error === 'auth_code_missing';

  return (
    <main className="min-h-screen flex items-center justify-center">
      <AuthDialog autoOpen={true}>
        <div className="hidden" /> {/* Hidden trigger to auto-open dialog */}
      </AuthDialog>
    </main>
  );
}
