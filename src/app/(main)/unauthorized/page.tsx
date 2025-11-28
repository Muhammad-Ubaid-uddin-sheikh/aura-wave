import CommonButton from "@/components/Common/CommonButton";
import Link from "next/link";

export default function UnauthorizedPage({ searchParams } : { searchParams: { error?: string } }) {
    const error = searchParams?.error || "unknown";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 text-xl text-center gap-3">
            <h1>Access Denied</h1>
            {error === "not_admin" && <p>You must be an admin to access this page.</p>}
            {error === "invalid_token" && <p>Your session is invalid or expired.</p>}
            <Link href={"/"}>
                <CommonButton>Go to Home</CommonButton>
            </Link>
        </div>
    );
}