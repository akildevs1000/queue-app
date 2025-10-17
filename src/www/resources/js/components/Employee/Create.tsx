"use client";

import React from "react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { toast } from "sonner";

import { Label } from "../ui/label";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { Popover, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { PopoverContent } from "@radix-ui/react-popover";

export interface FormInterface {
    full_name: string;
    employee_code: string;
    date_of_birth: string;
    profile_picture: File | null;
    [key: string]: string | number | File | null;
}


const Create: React.FC = () => {

    const [open, setOpen] = React.useState(false);

    const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(new Date());
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false); // State to control popover visibility

    const handleSelectDate = (date: Date | undefined) => {
        if (date) {
            setDateOfBirth(date);
            setData("date_of_birth", date.toLocaleDateString("en-CA")); // "en-CA" gives YYYY-MM-DD format
            setIsPopoverOpen(false); // Close the popover after selecting a date
        }
    };


    // Initialization
    const { data, setData, post, processing, reset, errors } = useForm<FormInterface>({
        full_name: "",
        employee_code: "",
        date_of_birth: "",  // Empty string is fine if it's a string type
        profile_picture: null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post("/employees", {
            onSuccess: () => {
                reset();
                setOpen(false);
                toast.success("Employee created successfully");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <GradientButton>Create Employee</GradientButton>
            </DialogTrigger>
            <DialogContent>
                <h2 className="text-xl font-bold">Create Employee</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="max-w-md">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            type="text"
                            value={data.full_name}
                            onChange={(e) => setData("full_name", e.target.value)}
                        />
                        {errors.full_name && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.full_name}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="employee_code">Employee Code</Label>
                        <Input
                            id="employee_code"
                            type="text"
                            value={data.employee_code}
                            onChange={(e) => setData("employee_code", e.target.value)}
                        />
                        {errors.employee_code && (
                            <p className="text-red-400 text-sm pt-1">{errors.employee_code}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="employee_code">Date Of Birth</Label>
                        <div>
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateOfBirth ? dateOfBirth.toLocaleDateString("en-CA") : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-black"> {/* Ensure bg-white is applied */}
                                    <Calendar
                                        mode="single"
                                        selected={dateOfBirth}
                                        onSelect={handleSelectDate}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date_of_birth && (
                                <p className="text-red-400 pl-1 pt-1 text-sm">{errors.date_of_birth}</p>
                            )}
                        </div>
                    </div>





                    <div className="max-w-md">
                        <Label htmlFor="description">Profile Picture</Label>

                        <Input
                            placeholder="Profile Picture"
                            type="file"
                            id="profile_picture"
                            onChange={(e) => setData('profile_picture', e.target.files?.[0] || null)}
                        />
                        {errors.profile_picture && <p className="text-red-400 pl-1 pt-1 text-sm">{errors.profile_picture}</p>}
                    </div>

                    <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? "Submitting..." : "Submit"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Create;