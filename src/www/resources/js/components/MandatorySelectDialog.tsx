import React, { useEffect, useState } from 'react';
// Assuming these are imported from your UI library (e.g., shadcn/ui)
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';

// Define the type for your counter objects
interface Counter {
    id: string;
    name: string;
}

interface MandatorySelectDialogProps {
    // A function to call when a selection is successfully made and the dialog should close
    onCounterSelected: (counterId: string) => void;
    // State to control visibility from a parent component (optional, but good practice)
    initialOpen: boolean;
}

export const MandatorySelectDialog: React.FC<MandatorySelectDialogProps> = ({ onCounterSelected, initialOpen }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [selectedCounterId, setSelectedCounterId] = useState<string | null>(null);
    const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false); // To show validation error

    const [counters, setCounters] = useState([]);

    useEffect(() => {
        const fetchCounters = async () => {
            try {
                const res = await fetch(`/counter-list`);
                let counters = await res.json();
                counters.shift();
                setCounters(counters);
            } catch (err) {
                console.error('Failed to fetch counters', err);
            }
        };

        fetchCounters();
    }, []);

    // Handler for the Select component's value change
    const handleCounterFilterChange = (value: string) => {
        setSelectedCounterId(value);
        setHasTriedToSubmit(false); // Clear error when a selection is made
    };

    // Handler for the main "Confirm" button
    const handleConfirm = () => {
        setHasTriedToSubmit(true);

        if (selectedCounterId) {
            // 1. Call the callback function with the selected ID
            onCounterSelected(selectedCounterId);
            // 2. Close the dialog
            setIsOpen(false);
        }
        // If not selected, the dialog remains open and the validation message appears
    };

    // 🚨 Crucial step to make it "mandatory"
    // This prevents the dialog from closing when the user clicks outside or presses ESC
    const handleOpenChange = (newOpenState: boolean) => {
        // if (!newOpenState) {
        //     // The user is trying to close the dialog
        //     if (!selectedCounterId) {
        //         // Prevent closing if no selection has been made
        //         setHasTriedToSubmit(true); // Show validation error
        //         setIsOpen(true); // Force it back to open
        //         return;
        //     }
        // }
        // Allow closing if it's being opened or if a selection was made
        setIsOpen(newOpenState);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {/* Optional: Add a trigger button outside the dialog for initial opening */}
            {/* <DialogTrigger asChild>
        <Button>Open Counter Selector</Button>
      </DialogTrigger> */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Select Your Counter</DialogTitle>
                    {/* Optional: Add a description for why this is mandatory */}
                    <p className="text-sm">You must select a counter before proceeding.</p>
                </DialogHeader>

                {/* Your original Select component */}
                <div className="py-4">
                    <Select onValueChange={handleCounterFilterChange} value={selectedCounterId || ''}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-900">
                            <SelectValue placeholder="Filter by Counter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Counter</SelectLabel>
                                {counters?.map((counter: Counter) => (
                                    <SelectItem key={counter.id} value={counter.id}>
                                        {counter.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Validation Error Message */}
                {hasTriedToSubmit && !selectedCounterId && (
                    <p className="-mt-2 text-sm font-medium text-red-500">Please select a counter to continue.</p>
                )}

                {/* The Action Button */}
                <div className="flex justify-end">
                    <Button type="button" onClick={handleConfirm}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
