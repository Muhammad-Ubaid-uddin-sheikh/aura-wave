import ForgotPassword from "@/components/Auth/ForgotPassword";

export default function ForgotPasswordPage({ searchParams }: {searchParams: {email?: string;}}) {
  const email = searchParams?.email

  return (
    <ForgotPassword emailPrefill={email}/>
  );
}