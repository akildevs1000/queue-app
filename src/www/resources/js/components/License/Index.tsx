import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GradientButton } from '@/components/ui/GradientButton';
import AppLogoIcon from '@/components/app-logo-icon';

interface LicenseProps {
    mustVerifyEmail: boolean;
}

export default function License({ mustVerifyEmail }: LicenseProps) {
    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // License activation form state
    const { data: licenseData, setData: setLicenseData, processing, reset } = useForm({
        license_key: '',
    });

    const submitLicense = async (e: React.FormEvent) => {
        e.preventDefault();
        setLicenseError(null);

        try {
            const params = new URLSearchParams({ license_key: licenseData.license_key });
            const response = await fetch(
                `https://debackend.myhotel2cloud.com/api/validate-license?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const result = await response.json();

            if (response.status === 200 && result.success) {
                // License activated successfully
                const expiryDate = result?.data?.expiry_date || '';

                // Optional toast notification
                setToastMessage(`License activated! Expiry: ${expiryDate}`);
                setTimeout(() => setToastMessage(null), 3000);

                // Reset license input
                reset();
            } else {
                setLicenseError(result.message || 'License activation failed');
            }
        } catch (err) {
            console.error(err);
            setLicenseError('Network or server error');
        }
    };

    return (
        <div className="max-w-sm  bg-white dark:bg-gray-800 rounded-xl">
            {/* Heading */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Activate Your License
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enter your license key below to continue.
                </p>
            </div>

            <form onSubmit={submitLicense} className="flex flex-col gap-4 mt-5">
                <div className="grid gap-2">
                    <Label htmlFor="license_key" className="text-gray-700 dark:text-gray-200">
                        License Key
                    </Label>
                    <Input
                        id="license_key"
                        required
                        autoFocus
                        value={licenseData.license_key}
                        onChange={(e) => setLicenseData('license_key', e.target.value)}
                        placeholder="LIC-9F3A-72KD-8XQ2"
                        className="rounded-md border-gray-300 dark:border-gray-700 focus:border-primary focus:ring focus:ring-primary/30 dark:bg-gray-700"
                    />
                    {licenseError && (
                        <div className="text-red-600 dark:text-red-400 font-medium mt-1">
                            {licenseError}
                        </div>
                    )}
                </div>

                <GradientButton disabled={processing} className="mt-4 w-auto px-6 flex justify-center">
                    {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                    Activate License
                </GradientButton>
            </form>
        </div>

    );
}
