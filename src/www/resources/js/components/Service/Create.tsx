'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const MATERIAL_ICONS = [
    'home',
    'account_circle',
    'person',
    'people',
    'group',
    'work',
    'school',
    'local_hospital',
    'restaurant',
    'shopping_cart',
    'payment',
    'credit_card',
    'support_agent',
    'settings',
    'security',
    'lock',
    'vpn_key',
    'notifications',
    'notifications_active',
    'notifications_none',
    'mail',
    'email',
    'inbox',
    'send',
    'call',
    'phone',
    'chat',
    'message',
    'forum',
    'help',
    'help_outline',
    'info',
    'info_outline',
    'warning',
    'error',
    'report',
    'visibility',
    'visibility_off',
    'search',
    'filter_list',
    'sort',
    'sort_by_alpha',
    'arrow_upward',
    'arrow_downward',
    'arrow_forward',
    'arrow_back',
    'menu',
    'close',
    'check',
    'check_circle',
    'cancel',
    'clear',
    'add',
    'remove',
    'edit',
    'create',
    'delete',
    'content_copy',
    'content_paste',
    'upload',
    'download',
    'cloud',
    'cloud_upload',
    'cloud_download',
    'file_upload',
    'file_download',
    'folder',
    'folder_open',
    'insert_drive_file',
    'assignment',
    'assignment_turned_in',
    'assignment_late',
    'calendar_today',
    'calendar_view_month',
    'event',
    'today',
    'alarm',
    'access_time',
    'schedule',
    'place',
    'location_on',
    'map',
    'directions',
    'directions_car',
    'directions_bike',
    'directions_walk',
    'local_taxi',
    'train',
    'flight',
    'airport_shuttle',
    'directions_boat',
    'directions_bus',
    'directions_subway',
    'directions_railway',
];

type CreateInterFace = {
    name: string;
    code: string;
    description: string;
    starting_number: number | null;
    icon: string | null;
};
export default function ItemEdit({ title, endpoint }: { title: any; endpoint: any }) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<CreateInterFace>({
        name: '',
        code: '',
        description: '',
        starting_number: null,
        icon: null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(endpoint, {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <GradientButton>Create {title} </GradientButton>
            </DialogTrigger>
            <DialogContent>
                <h2 className="text-xl font-bold">Create {title}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-w-md">
                        <Input placeholder="Name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="pt-1 pl-1 text-sm text-red-400">{errors.name}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input placeholder="Prefix" type="text" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        {errors.code && <p className="pt-1 pl-1 text-sm text-red-400">{errors.code}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Starting Number (e.g., 1000)"
                            // Use 'number' type for mobile keyboards and basic validation
                            type="number"
                            value={data.starting_number || ''}
                            onChange={(e) =>
                                // Convert value to a number for the state
                                setData('starting_number', Number(e.target.value || 0))
                            }
                        />
                        {errors.starting_number && <p className="pt-1 pl-1 text-sm text-red-400">{errors.starting_number}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="pt-1 pl-1 text-sm text-red-400">{errors.description}</p>}
                    </div>

                    <div className="max-w-md">
                        <Select onValueChange={(value) => setData('icon', value)} value={data.icon || ''}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Icon" />
                            </SelectTrigger>
                            <SelectContent>
                                {MATERIAL_ICONS.map((icon) => (
                                    <SelectItem key={icon} value={icon}>
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-round">{icon}</span>
                                            <span>{icon}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors.icon && <p className="pt-1 pl-1 text-sm text-red-400">{errors.icon}</p>}
                    </div>
                 
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        {processing ? 'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
