import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun, LucideIcon } from 'lucide-react';

export default function UiMode() {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    // Ensure a fallback to avoid undefined
    const selected = tabs.find((t) => t.value === appearance) ?? tabs[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <selected.icon className="h-4 w-4" />
                    {selected.label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {tabs.map(({ value, icon: Icon, label }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => updateAppearance(value)}
                        className="flex items-center gap-2"
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}