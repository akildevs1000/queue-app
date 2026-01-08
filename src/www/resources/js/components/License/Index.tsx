import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Check, Copy, LoaderCircle, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { decryptData } from '../../utils/encryption';

let electronClipboard: any = null;

if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
    const { clipboard } = window.require('electron');
    electronClipboard = clipboard;
}

export default function License() {
    const { auth } = usePage<SharedData>().props;

    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [licenseSuccess, setLicenseSuccess] = useState<string | null>(null);

    const [machineId, setMachineId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { data, setData, patch, transform, processing } = useForm({
        license_key: '',
        machine_id: '',
        expiry_date: '', // This will be filled during decryption
    });

    // Load machine ID from Electron
    useEffect(() => {
        setData("license_key",auth?.user?.license_key);
    }, []);

     useEffect(() => {
        async function loadMachineId() {
            const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
            if (isElectron) {
                const { ipcRenderer } = window.require('electron');
                const id = await ipcRenderer.invoke('get-machine-id');
                setMachineId(id);
                setData('machine_id', id);
            }
        }
        loadMachineId();
    }, []);

    const submitLicense = (e: React.FormEvent) => {
        e.preventDefault();
        setLicenseError(null);
        setLicenseSuccess(null);
        let licenseKey = data.license_key;

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
                    setLicenseSuccess('License activated successfully!');
                    setLicenseError(null);
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
        <div className="flex-1 overflow-auto rounded-xl">
            <section className="rounded-xl border border-indigo-100 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500 p-2 text-white shadow-lg shadow-indigo-500/30">
                                    <Unlock />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Activate Your License</h3>
                            </div>
                            <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                Enter your license key to activate your app.
                            </p>
                            <form className="space-y-4" onSubmit={submitLicense}>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Machine Code</label>
                                    <div className="relative">
                                        <Input
                                            className="rounded border dark:border-slate-700 dark:bg-slate-900"
                                            required
                                            value={machineId || ''}
                                            onChange={(e) => setData('machine_id', e.target.value)}
                                            placeholder=""
                                        />
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
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">License Key</label>
                                    <Input
                                        className="rounded border dark:border-slate-700 dark:bg-slate-900"
                                        required
                                        value={data.license_key}
                                        onChange={(e) => setData('license_key', e.target.value)}
                                        placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                                    />
                                </div>

                                {licenseError && <div className="text-red-600 dark:text-red-400">{licenseError}</div>}
                                {licenseSuccess && <div className="text-green-600 dark:text-green-400">{licenseSuccess}</div>}

                                <div className="flex justify-end pt-2">
                                    <GradientButton disabled={processing} type="submit">
                                        {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />} Activate License
                                    </GradientButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
