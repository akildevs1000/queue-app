import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Check, Copy, LoaderCircle, LucideIcon, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';

// Detect Electron Node crypto
let cryptoNode: any = undefined;
if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
    cryptoNode = window.require('crypto'); // Electron renderer
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
        license_key: 'LIC-EAVD-C52E-QYKU-01PQ',
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

        if (!licenseData.license_key || !machineId) {
            setLicenseError('License key or machine ID is missing.');
            return;
        }

        let licenseKey = licenseData.license_key;



        try {
            if (!cryptoNode) throw new Error('Crypto unavailable');

            if (licenseKey.startsWith('LIC-')) {
                licenseKey = licenseKey.slice(4);
            }

            const LICENSE_REGEX = /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/;
            if (!LICENSE_REGEX.test(licenseKey)) {
                setLicenseError('Invalid license format');
                return;
            }

            const blocks = licenseKey.split('-');

            if (blocks.length !== 4) {
                setLicenseError('Invalid license format');
                return;
            }

            // Decode expiry block
            const decodedExpiry = decodeDateSegment(blocks[3]);
            if (!decodedExpiry) {
                setLicenseError('Invalid expiry date');
                return;
            }

            if (isExpired(decodedExpiry)) {
                setLicenseError('License expired');
                return;
            }

            // SHA256(machineId)
            const hash = cryptoNode
                .createHash('sha256')
                .update(machineId)
                .digest();

            const bytes: any = Array.from(hash);
            const base32 = toBase32(bytes);
            const first16 = base32.slice(0, 16);

            const expectedBlocks = first16.match(/.{1,4}/g);
            if (!expectedBlocks) {
                setLicenseError('Hash generation failed');
                return;
            }

            const expectedPrefix = expectedBlocks.slice(0, 3).join('-');
            const licensePrefix = blocks.slice(0, 3).join('-');

            if (expectedPrefix === licensePrefix) {
                setLicenseSuccess('License activated successfully!');
                setLicenseError(null);
            } else {
                setLicenseError('License does not match this machine');
            }
        } catch (err) {
            console.error(err);
            setLicenseSuccess(null);
            setLicenseError('Invalid license or mismatched machine.');
        }
    };

    // --- Offline License Validation Helpers ---
    function toBase32(bytes: number[]): string {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let output = '';
        for (const b of bytes) bits += b.toString(2).padStart(8, '0');
        for (let i = 0; i + 5 <= bits.length; i += 5) {
            output += alphabet[parseInt(bits.slice(i, i + 5), 2)];
        }
        return output;
    }

    function isExpired(expiry: string): boolean {
        if (!expiry) return false;
        return new Date() > new Date(expiry);
    }

    function decodeDateSegment(encoded: string): string | null {
        const base = new Date('2020-01-01T00:00:00Z');

        // Convert base36 back to number of days
        const days = parseInt(encoded, 36);
        if (!Number.isFinite(days) || days < 0) return null;

        // Add days to base date
        const decodedDate = new Date(base.getTime() + days * 86400000);

        // Return YYYY-MM-DD
        return decodedDate.toISOString().slice(0, 10);
    }

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
                                        <Input className='border rounded dark:border-slate-700 dark:bg-slate-900'
                                            required
                                            value={machineId || ''}
                                            onChange={(e) => setLicenseData('machine_id', e.target.value)}
                                            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!machineId) return;
                                                navigator.clipboard.writeText(machineId).then(() => {
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 1500);
                                                });
                                            }}
                                            className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">License Key</label>
                                    <Input className='border rounded dark:border-slate-700 dark:bg-slate-900'
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
