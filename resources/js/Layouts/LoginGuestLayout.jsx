import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function LoginGuestLayout({ children }) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}
