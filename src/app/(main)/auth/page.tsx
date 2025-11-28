import AuthForm from '@/components/Auth/AuthForm';
import Logout from '@/components/Auth/Logout';
import VerificationNotice from '@/components/Auth/VerificationNotice';
import { cookies } from 'next/headers';

interface AuthProps {
  searchParams: { 
    verified?: string;
    email?: string;
    pendingVerification?: string
  };
}

const Auth = ({ searchParams }: AuthProps ) => {
    const token = cookies().get("token")?.value;
    const email = searchParams?.email
    const showVerificationUI = searchParams?.pendingVerification === "true" && email;

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] max-w-sm mx-auto p-4">
            {token ? (
                <Logout /> 
            ): showVerificationUI ? (
                <VerificationNotice email={searchParams.email!}/>
            ) : (
                <>
                    {searchParams?.verified && (
                        <div className="text-center my-6">
                            <h1 className="text-2xl font-bold text-green-600">Account Verified</h1>
                            <p className="mt-4">You can now log in to your account.</p>
                        </div>
                    )}
                    <AuthForm emailPrefill={email}/>
                </>
            )}
        </div>
    )
}

export default Auth