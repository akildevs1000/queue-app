import { useForm } from '@inertiajs/react';
import { Check, Copy, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import logo from '@/assets/logo.png'; // or "../assets/logo.png"
import { decryptData } from '@/utils/encryption';

let electronClipboard: any = null;

if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
    const { clipboard } = window.require('electron');
    electronClipboard = clipboard;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    subscriptionExpired?: boolean; // trial expired flag
}

export default function Login({ status, canResetPassword, subscriptionExpired }: LoginProps) {
    const [trialExpired, setTrialExpired] = useState(subscriptionExpired || false);
    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [licenseSuccess, setLicenseSuccess] = useState<string | null>(null);
    const [subsriptionError, setSubsriptionError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [copied, setCopied] = useState(false);

    // Normal login form
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        expiry_date: '', // hidden field for license expiry

        license_key: '',
        machine_id: '',
        is_electron: false,
    });

    // License activation form
    const {
        data: licenseData,
        setData: setLicenseData,
        processing: processingLicense,
        transform,
        patch,
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
                setData('is_electron', true);
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

    const submitLicense = (e: React.FormEvent) => {
        e.preventDefault();
        setLicenseError(null);
        setLicenseSuccess(null);

        let licenseKey = licenseData.license_key;

        try {
            if (!licenseKey || !machineId) {
                setLicenseError('License key or machine ID is missing.');
                return;
            }

            const license = decryptData(licenseKey, machineId);

            if (!license) {
                setLicenseError('Invalid License Key');
                return;
            }

            // 2. The critical part: Transform the data right before sending
            // This injects the expiry_date from the decryption process
            // into the actual request payload.
            transform((data) => ({
                ...data,
                expiry_date: license.expiry_date,
            }));

            // 3. Fire the request
            patch(route('license.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    if (new Date() > new Date(license.expiry_date)) {
                        setLicenseError('License expired');
                        return;
                    }
                    window.location.reload();
                },
                onError: (err) => {
                    setLicenseSuccess(null);
                    setLicenseError('Activation failed on the server.');
                },
            });
        } catch (err) {
            setLicenseError('Invalid license.');
            setLicenseSuccess(null);
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
                                <div className="relative grid gap-2">
                                    <Label htmlFor="machine_id" className="text-gray-700 dark:text-gray-200">
                                        Machine Code{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!machineId) return;

                                                if (electronClipboard) {
                                                    electronClipboard.writeText(machineId);
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 1500);
                                                }
                                            }}
                                            className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </Label>
                                </div>

                                <Input
                                    id="machine_id"
                                    required
                                    autoFocus
                                    value={licenseData.machine_id}
                                    onChange={(e) => setLicenseData('machine_id', e.target.value)}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="rounded border dark:border-slate-700 dark:bg-slate-900"
                                />

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
