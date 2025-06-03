import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
    const { data: session, status } = useSession();
    
    // Show loading state when NextAuth is determining session status
    if (status === 'loading') {
        return (
            <button disabled className="opacity-50 cursor-not-allowed">
                Loading...
            </button>
        );
    }
    
    // Show appropriate button based on auth status
    return session ? (
        <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
            Sign out
        </button>
    ) : (
        <button 
            onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
            Sign in with Microsoft
        </button>
    );
}