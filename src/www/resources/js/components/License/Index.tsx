import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Check, Copy, LoaderCircle, LucideIcon, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { decryptData } from '../../utils/encryption';

// Detect Electron Node crypto
let cryptoNode: any = undefined;
if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
    cryptoNode = window.require('crypto'); // Electron renderer
}

let electronClipboard: any = null;

if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
    const { clipboard } = window.require('electron');
    electronClipboard = clipboard;
}

interface LicenseProps {
    mustVerifyEmail: boolean;
    license_key: string;
}

interface LicenseInfo {
    contact_person_name: string;
    email: string;
    expiry_date: string;
    license_key: string;
    location: string;
    name: string;
    number: string;
    status: string;
}

interface IconBoxProps {
    icon: LucideIcon;
}

const IconBox: React.FC<IconBoxProps> = ({ icon: Icon }) => (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
    </div>
);

interface InfoItemProps {
    icon: LucideIcon;
    label: string;
    value?: string | null;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <IconBox icon={icon} />
        <div>
            <span className="text-xs text-slate-400 uppercase">{label}</span>
            <p className="font-medium text-slate-800 dark:text-slate-200">{value || '-'}</p>
        </div>
    </div>
);

export default function License({ license_key, mustVerifyEmail }: LicenseProps) {
    const { auth } = usePage<SharedData>().props;

    const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [licenseSuccess, setLicenseSuccess] = useState<string | null>(null);

    const [machineId, setMachineId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const {
        data: licenseData,
        setData: setLicenseData,
        processing,
    } = useForm({
        license_key: '',
        machine_id: '',
        expiry_date: '', // optional if server provides expiry date
    });

    // Load machine ID from Electron
    useEffect(() => {
        async function loadMachineId() {
            const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
            if (isElectron) {
                const { ipcRenderer } = window.require('electron');
                const id = await ipcRenderer.invoke('get-machine-id');
                setMachineId(id);
                setLicenseData('machine_id', id);
            }
        }
        loadMachineId();
    }, []);

    // Offline license validation
    const submitLicense = async (e: React.FormEvent) => {
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

            const expiryDate = new Date(license.expiry_date);
            if (new Date() > expiryDate) {
                setLicenseError('License expired');
                return;
            }

            setLicenseSuccess('License activated successfully!');
            setLicenseError(null);
        } catch (err) {
            console.error(err);
            setLicenseSuccess(null);
            setLicenseError('Invalid license or mismatched machine.');
        }
    };

    // --- UI (your existing code) ---
    return (
        <div className="flex-1 overflow-auto rounded-xl">
            {licenseInfo && (
                <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                    {/* ... your existing license info UI ... */}
                </section>
            )}

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
                                            onChange={(e) => setLicenseData('machine_id', e.target.value)}
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
                                        value={licenseData.license_key}
                                        onChange={(e) => setLicenseData('license_key', e.target.value)}
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
