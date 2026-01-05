import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GradientButton } from '../ui/GradientButton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'License settings',
        href: '/settings/license',
    },
];

export default function License({ mustVerifyEmail }: { mustVerifyEmail: boolean }) {
    const { auth } = usePage<SharedData>().props;

    const [machineId] = useState('45354345'); // Example, can get dynamically if needed
    const [licenseKey, setLicenseKey] = useState('');
    const [status, setStatus] = useState('');
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch license status on page load
    useEffect(() => {
        checkLicense();
    }, []);

    const checkLicense = async () => {
        setLoading(true);
        setError('');
        try {
            const url = `http://localhost:8005/api/validate-license?machine_id=${machineId}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                setStatus('expired');
                setExpiryDate(data.data?.expiry_date ?? null);
                setError(data.message);
            } else {
                setStatus(data.data?.status ?? 'trial');
                setExpiryDate(data.data?.expiry_date ?? null);
            }
        } catch (err: any) {
            setError('Unable to check license. Try again.');
            setStatus('unknown');
        } finally {
            setLoading(false);
        }
    };

    const activateLicense: FormEventHandler = async (e) => {
        e.preventDefault();
        if (!licenseKey) {
            setError('Please enter license key');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const url = `http://localhost:8005/api/validate-license?machine_id=${machineId}&license_key=${licenseKey}`;
            const res = await fetch(url, { method: 'GET' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
            } else {
                setStatus('active');
                setExpiryDate(data.data?.expiry_date ?? null);
                setError('');
            }
        } catch (err: any) {
            setError('License activation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-700">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-6 py-5 dark:border-gray-700 dark:bg-gray-800/30">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">License Information</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your smart queue license status and activation.</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Expired
                    </span>
                </div>
                <div className="space-y-8 p-6">
                    <div>
                        <Label htmlFor="licenseKey">Expiry Date</Label>

                        <div className="relative w-[300px] rounded-md shadow-sm">
                            <Input
                                className="focus:ring-primary focus:border-primary block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                id="licenseKey"
                                value={expiryDate || ''}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">This is the date your current license became invalid.</p>
                    </div>
                    <div>
                        <Label htmlFor="licenseKey">License Key</Label>
                        <div className="relative w-[300px] rounded-md shadow-sm">
                            <Input
                                className="focus:ring-primary focus:border-primary block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                id="licenseKey"
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                value={licenseKey || ''}
                            />
                        </div>
                        <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                            <span className="material-icons-round mr-1 text-sm">warning</span>
                            Trial expired. A valid license key is required to continue.
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row dark:border-gray-700">
                       <GradientButton>Activate License</GradientButton>
                       
                    </div>
                </div>
            </div>
            {/* <HeadingSmall title="License information" description="Manage your license status" />
            <form onSubmit={activateLicense} className="space-y-4 mt-10">
                <div className="grid gap-2">
                    <Label htmlFor="licenseKey">Expiry Date</Label>
                    <Input id="licenseKey" placeholder="XXXX-XXXX-XXXX-XXXX" value={expiryDate || ''} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="licenseKey">License Key</Label>
                    <Input id="licenseKey" placeholder="XXXX-XXXX-XXXX-XXXX" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <InputError className="mt-1" message={error} />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Activate License'}
                </Button>
            </form> */}
        </div>
    );
}
