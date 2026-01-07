import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import logo from '@/assets/logo.png'; // or "../assets/logo.png"

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    subscriptionExpired?: boolean; // trial expired flag
}

export default function Login({ status, canResetPassword, subscriptionExpired }: LoginProps) {
    const [trialExpired, setTrialExpired] = useState(subscriptionExpired || false);
    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [subsriptionError, setSubsriptionError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Normal login form
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        expiry_date: '', // hidden field for license expiry

        license_key: '',
        machine_id: '',
    });

    // License activation form
    const {
        data: licenseData,
        setData: setLicenseData,
        processing: processingLicense,
        reset: resetLicense,
    } = useForm({
        license_key: '',
        machine_id: '',
    });

    const [machineId, setMachineId] = useState(null);

    useEffect(() => {
        async function loadMachineId() {
            // Running inside Electron?
            const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';

            if (isElectron) {
                const { ipcRenderer } = window.require('electron');
                const id = await ipcRenderer.invoke('get-machine-id');
                console.log('Machine ID (Electron):', id);
                setMachineId(id);
                setData('machine_id', id);
                setLicenseData('machine_id', id);
            }
        }

        loadMachineId();
    }, []);

    // Normal login submit
    const submitLogin: FormEventHandler = (e) => {
        setSubsriptionError(null);
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: (err) => {
                if (err?.error) setError(err?.error);
                if (err?.subsription) setTrialExpired(true);

                setSubsriptionError(err?.subsription);
            },
        });
    };

    // License activation submit (GET method)
    const submitLicense: FormEventHandler = async (e) => {
        setSubsriptionError(null);
        e.preventDefault();
        setLicenseError(null);

        try {
            const params = new URLSearchParams({ license_key: licenseData.license_key });
            const response = await fetch(`https://debackend.myhotel2cloud.com/api/validate-license?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.status === 200 && result.success) {
                // License activated successfully
                const expiryDate = result?.data?.expiry_date || '';

                // Set expiry_date in login form hidden field
                setData('expiry_date', expiryDate);
                setData('license_key', licenseData.license_key);

                // Reset license form
                resetLicense();

                // Allow login form to show again
                setTrialExpired(false);
            } else {
                setLicenseError(result.message || 'License activation failed');
            }
        } catch (err) {
            console.error(err);
            setLicenseError('Network or server error');
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gray-100 p-6 md:p-10 dark:bg-black">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {!trialExpired ? (
                        <form
                            id="login-form"
                            className="mx-5 mx-auto flex max-w-md flex-col gap-8 rounded-xl bg-white p-8 shadow-xl dark:bg-gray-900"
                            onSubmit={submitLogin}
                        >
                            {/* Normal login form */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-[150px]">
                                    <img src={logo} alt="Logo" className="object-contain" />
                                </div>
                                <h2 className="text-center text-2xl font-semibold text-gray-800 dark:text-gray-100">Welcome Back!</h2>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Enter your credentials to access your account</p>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                                        User Name
                                    </Label>
                                    <Input
                                        id="email"
                                        required
                                        autoFocus
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin"
                                        className="focus:border-primary focus:ring-primary/30 rounded-md border-gray-300 focus:ring dark:border-gray-700 dark:bg-gray-800"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Your password"
                                        className="focus:border-primary focus:ring-primary/30 rounded-md border-gray-300 focus:ring dark:border-gray-700 dark:bg-gray-800"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Hidden field for expiry_date */}
                                <input type="hidden" name="machine_id" value={machineId || ''} />
                                <input type="hidden" name="expiry_date" value={data.expiry_date || ''} />
                                <input type="hidden" name="license_key" value={data.license_key || ''} />

                                {error && <div className="mb-2 text-center font-medium text-red-600 dark:text-red-400">{error}</div>}

                                {subsriptionError && (
                                    <div className="mb-2 text-center font-medium text-red-600 dark:text-red-400">{subsriptionError}</div>
                                )}

                                <GradientButton disabled={processing}>
                                    {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                                    Log in
                                </GradientButton>
                            </div>
                        </form>
                    ) : (
                        // License activation form
                        <form
                            className="mx-auto flex max-w-md flex-col gap-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-900"
                            onSubmit={submitLicense}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-[150px]">
                                    <img src={logo} alt="Logo" className="object-contain" />
                                </div>
                                <h2 className="text-center text-2xl font-semibold text-gray-800 dark:text-gray-100">Activate License</h2>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    Your trial expired. Enter your license key to continue.
                                </p>
                            </div>

                            <div className="grid gap-6">
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
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                        className="focus:border-primary focus:ring-primary/30 rounded-md border-gray-300 focus:ring dark:border-gray-700 dark:bg-gray-800"
                                    />
                                    {licenseError && (
                                        <div className="mt-1 text-center font-medium text-red-600 dark:text-red-400">{licenseError}</div>
                                    )}
                                </div>

                                <GradientButton disabled={processingLicense}>
                                    {processingLicense && <LoaderCircle className="h-5 w-5 animate-spin" />}
                                    Activate License
                                </GradientButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
