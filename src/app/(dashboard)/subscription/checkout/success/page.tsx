// /src/app/checkout/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SuccessPage = () => {
    const router = useRouter();
    
    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            router.push("/dashboard");
        }, 2000);
        
        return () => clearTimeout(redirectTimer);
    }, [router]);
    
    return (
        <div className="text-center space-y-4 p-8 max-w-2xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Payment Successful!
                </h1>
                <p className="text-muted-foreground">
                    Your subscription has been activated. You now have full access to Pretty_Resume&apos;s premium features.
                </p>
                <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
        </div>
    );
};

export default SuccessPage;