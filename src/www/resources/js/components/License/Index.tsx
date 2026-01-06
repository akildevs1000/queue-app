import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { CalendarClock, Check, Copy, KeyRound, LoaderCircle, LucideIcon, Mail, Phone, Unlock, User } from 'lucide-react';
import { useEffect, useState } from 'react';

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

    // License activation form state
    const {
        data: licenseData,
        setData: setLicenseData,
        processing,
        reset,
    } = useForm({
        license_key: '',
        machine_id: '',
    });

    const getLicenseInfo = async () => {
        if (!license_key) return;

        try {
            const params = new URLSearchParams({ license_key });

            const response = await fetch(`https://debackend.myhotel2cloud.com/api/get-license?${params.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setLicenseInfo({
                    contact_person_name: result.data.contact_person_name,
                    email: result.data.email,
                    expiry_date: result.data.expiry_date,
                    license_key: result.data.license_key,
                    location: result.data.location,
                    name: result.data.name,
                    number: result.data.number,
                    status: result.data.status,
                });
            } else {
                setLicenseInfo(null);
            }
        } catch (error) {
            console.error(error);
            setLicenseInfo(null);
        }
    };

    useEffect(() => {
        getLicenseInfo();
    }, []);

    useEffect(() => {
        setLicenseData('machine_id', auth?.user?.machine_id);
    }, []);

    useEffect(() => {
        if (license_key) {
            setLicenseData('license_key', license_key);
        }
    }, [license_key]);

    const [machineId, setMachineId] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function loadMachineId() {
            // Running inside Electron?
            const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';

            if (isElectron) {
                const { ipcRenderer } = window.require('electron');
                const id = await ipcRenderer.invoke('get-machine-id');
                console.log('Machine ID (Electron):', id);
                setMachineId(id);
            }
        }

        loadMachineId();
    }, []);

    const submitLicense = async (e: React.FormEvent) => {
        e.preventDefault();
        setLicenseError(null);

        try {
            const params = new URLSearchParams(licenseData);
            console.log(licenseData);

            const response = await fetch(`https://debackend.myhotel2cloud.com/api/validate-license?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.status === 200 && result.success) {
                setTimeout(() => setLicenseSuccess(null), 3000);

                // Reset license input

                setLicenseSuccess(result.message || 'License activated');
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
        <div className="flex-1 overflow-auto rounded-xl">
            {licenseInfo && (
                <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                        <div>
                            <h3 className="text-lg font-semibold">License Details</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Information about your current subscription</p>
                        </div>

                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${licenseInfo?.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''} ${licenseInfo?.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''} ${licenseInfo?.status === 'suspended' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''} `}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${licenseInfo?.status === 'active' ? 'bg-emerald-500' : ''} ${licenseInfo?.status === 'expired' ? 'bg-red-500' : ''} ${licenseInfo?.status === 'suspended' ? 'bg-orange-500' : ''} `}
                            />
                            {licenseInfo?.status ? licenseInfo.status.charAt(0).toUpperCase() + licenseInfo.status.slice(1) : '-'}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        {/* Email */}
                        <InfoItem icon={Mail} label="Email" value={licenseInfo?.email} />

                        {/* Expiry */}
                        <InfoItem icon={CalendarClock} label="Expiry Date" value={licenseInfo?.expiry_date} />

                        {/* Contact Person */}
                        <InfoItem icon={User} label="Contact Person" value={licenseInfo?.contact_person_name} />

                        {/* Contact Number */}
                        <InfoItem icon={Phone} label="Contact Person" value={licenseInfo?.number} />

                        <InfoItem icon={KeyRound} label="License Key" value={licenseInfo?.license_key} />
                    </div>
                </section>
            )}

            <section className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500 p-2 text-white shadow-lg shadow-indigo-500/30">
                                    <span className="material-icons-outlined block">
                                        <Unlock />
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Activate Your License</h3>
                            </div>
                            <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                Enter your new license key below to renew your subscription or upgrade your plan. Your current data will remain safe.
                            </p>
                            <form className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="license-key">
                                        Machine Code
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="machine_id"
                                            required
                                            autoFocus
                                            value={machineId || ''}
                                            onChange={(e) => setLicenseData('machine_id', e.target.value)}
                                            className="dark:border-slate-700 dark:bg-slate-950"
                                            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                                    navigator.clipboard
                                                        .writeText(machineId || '')
                                                        .then(() => {
                                                            setCopied(true);
                                                            setTimeout(() => setCopied(false), 1500);
                                                        })
                                                        .catch(() => {
                                                            alert('Failed to copy!');
                                                        });
                                                } else {
                                                    // fallback for older browsers
                                                    const el = document.createElement('textarea');
                                                    el.value = machineId || '';
                                                    document.body.appendChild(el);
                                                    el.select();
                                                    document.execCommand('copy');
                                                    document.body.removeChild(el);
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
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="license-key">
                                        New License Key
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="license_key"
                                            required
                                            autoFocus
                                            value={licenseData.license_key}
                                            onChange={(e) => setLicenseData('license_key', e.target.value)}
                                            className="dark:border-slate-700 dark:bg-slate-950"
                                            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                                        />
                                    </div>
                                </div>
                                <div className="max-w-md space-y-4">
                                    {licenseError && <div className="mt-1 font-medium text-red-600 dark:text-red-400">{licenseError}</div>}

                                    {licenseSuccess && <div className="mt-1 font-medium text-green-600 dark:text-green-400">{licenseSuccess}</div>}
                                </div>
                                <div className="flex items-center justify-end pt-2">
                                    <GradientButton disabled={processing} onClick={submitLicense}>
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
