"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import TextareaAutosize from 'react-textarea-autosize';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Calendar1Icon, Check, Cross, ImageIcon, ImagePlus, Loader2, Plus, Search, SearchIcon, Trash2, } from "lucide-react"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,

} from "@/components/ui/input-group"
import { FieldError } from "@/components/ui/field";
import { createNomineeProfile, createPoll, fetchPollAction, searchNominees } from "@/app/actions/poll"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dateFormatter } from "@/lib/utils";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button"
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import z from "zod"
import { createNomineeSchema } from "@/app/schemas/poll"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // Added these
import { Clock2Icon } from "lucide-react"
import { format } from "date-fns";
import { CreatePollParams, Nominees, PollData, PollResponse } from "@/types/poll";
import { toast } from "sonner";
import Link from "next/link";






const categories = [
    {
        "id": "13be2e82-1215-40e0-9e3b-35c5dd078b0d",
        "title": "Business"
    },
    {
        "id": "4d7c45b3-f872-43b1-9e87-c206bb49066b",
        "title": "Pageantry"
    },
    {
        "id": "545aace6-22aa-47f4-8f1c-5e5d0321f30e",
        "title": "Lifestyle"
    },
    {
        "id": "7f1457f0-227d-49dc-a361-19efd155a326",
        "title": "Film"
    },
    {
        "id": "aaeb79b5-6035-4d34-8c00-9793caf1e8af",
        "title": "Television"
    },
    {
        "id": "ac08c2c1-6d3f-4f34-bcf8-a5da81489e51",
        "title": "Social Media"
    },
    {
        "id": "b1e9a656-a009-4ee2-899b-4563cc83c6c8",
        "title": "Politics"
    },
    {
        "id": "b7064947-354f-4d97-a44a-72ca0325bd2c",
        "title": "Music"
    },
    {
        "id": "bfc0daf3-6314-415e-917b-bc59e1599b30",
        "title": "Drama"
    }
]
export default function PollsView() {


    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isPending, startTransition] = useTransition();
    const [data, setData] = useState<PollData[]>();

    const currentFilter = searchParams.get("filter") || "all";

    useEffect(() => {
        startTransition(async () => {
            const res = await fetchPollAction(currentFilter);
            if (res && "error" in res) {
                console.log(res.error);
                return;
            }
            setData(res);
        });
    }, [currentFilter]);

    const handleFilterChange = (value: string) => {
        if (!value) return;

        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
            params.delete("filter");
        } else {
            params.set("filter", value);
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };


    return (
        <main className="flex min-h-screen">
            <div className="flex-1 grid grid-cols-2 gap-4">
                <section className="w-full flex flex-col space-y-4">
                    <h1 className="text-xl font-bold md:text-2xl">Active Polls</h1>
                    <InputGroup className="has-focus-visible:ring-2 has-focus-visible:ring-amber-300 has-focus-visible:border-amber-300 w-70">
                        <InputGroupInput
                            placeholder="Search..."
                            className="focus-visible:ring-0 focus-visible:border-none"
                        />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                    </InputGroup>

                    {/* UPDATED TOGGLE GROUP */}
                    <ToggleGroup
                        size="lg"
                        variant="outline"
                        type="single"
                        value={currentFilter} // Controlled by the URL
                        onValueChange={handleFilterChange} // Updates the URL
                    >
                        <ToggleGroupItem
                            value="all"
                            className="data-[state=on]:bg-text-primary data-[state=on]:text-white"
                        >
                            All
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="active"
                            className="data-[state=on]:bg-text-primary data-[state=on]:text-white"
                        >
                            Active
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="inactive"
                            className="data-[state=on]:bg-text-primary data-[state=on]:text-white"
                        >
                            Inactive
                        </ToggleGroupItem>
                                                <ToggleGroupItem
                            value="archived"
                            className="data-[state=on]:bg-text-primary data-[state=on]:text-white"
                        >
                            Archived
                        </ToggleGroupItem>
                    </ToggleGroup>

                    {isPending ? (
                        <h1>Loading Polls...</h1>
                    ) : !data || data.length === 0 ? (
                        <h1>No polls found</h1>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data && data.map((item) => (
                                <Link href={`/poll/${item.id}`} key={item.id} >
                                    <PollCard data={item}/>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
                <aside>
                    <CreatePollCard />
                </aside>
                
            </div>
        </main>
    );
}

function CreatePollCard() {
    const [selectedProfiles, setSelectedProfiles] = useState<Nominees[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [searchResult, setSearchResult] = useState<Nominees[] | []>();
    const [selectedCateg, setSelectedCategory] = useState<{ title: string, id: string }>()

    const [date, setDate] = useState<Date | undefined>(() => {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay;
    });
    const [endTime, setEndTime] = useState("12:30:00");

    const [isCreatingProfile, startTransition] = useTransition()
    const [isCreatingPoll, startCreatingPoll] = useTransition()

    const [pollName, setPollName] = useState("")

    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);



    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === "") {
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {

                const noms = await searchNominees({
                    searchInput: searchQuery,
                    //o for now and ill implement the infinite scroll later
                    alreadyLoaded: 0
                });

                if (noms && !("error" in noms)) {
                    setSearchResult(noms.nominees);
                }
            } catch (error) {
                console.error("Search failed:", error);
            }
        }, 500);


        return () => clearTimeout(delayDebounceFn);

    }, [searchQuery]);

    const fileInputRef = useRef<HTMLInputElement>(null);


    const nomineeForm = useForm({
        resolver: zodResolver(createNomineeSchema),
        defaultValues: {
            name: "",
            bio: "",
            avatar: undefined
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            nomineeForm.setValue("avatar", file, { shouldValidate: true });
        }
    };


    const combineDateTime = (baseDate: Date | undefined, timeString: string) => {
        if (!baseDate) return null;
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        const newDate = new Date(baseDate);
        newDate.setHours(hours, minutes, seconds || 0);
        return newDate;
    };

    const handleCreateProfile = (values: z.infer<typeof createNomineeSchema>) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("bio", values.bio);
        if (values.avatar) {
            formData.append("avatar", values.avatar);
        }
        startTransition(async () => {
            try {
                const result = await createNomineeProfile(formData);
                if (result && "error" in result) {
                    toast.error("Something went wrong", { position: "top-center" })
                } else {
                    toast.success("Nominee added", { position: "top-center" })
                    setSelectedProfiles([...selectedProfiles, result])
                    nomineeForm.reset();
                    setPreview(null);
                }
            } catch (err) {
                toast.error("Something went wrong", { position: "top-center" })
            }
        })

    }
const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Create the local blob URL for immediate preview
        setBannerPreview(URL.createObjectURL(file));
        // Save the actual file object to send later
        setBannerFile(file);
    }
};

const handleCreatePoll = () => {
    startCreatingPoll(async () => { 
        const err = [];
        if (!(selectedCateg?.id)) err.push("Category");
        if (!pollName) err.push("Poll Name");
        if (!date || !endTime) err.push("Date");
        
        if (err.length > 0) {
            toast.error(`${err.length > 1 ? "Fields are" : "Field is"} required: ${err.join(", ")}`);
            return; 
        }

        if (!selectedProfiles || selectedProfiles.length < 2) {
            toast.error("Add at least two nominees.");
            return;
        }

        const combinedDate = combineDateTime(date, endTime);

        const formData = new FormData();

        formData.append("name", pollName);
        formData.append("categoryId", selectedCateg?.id ?? "");
        formData.append("deadline", combinedDate ? combinedDate.toISOString() : "");

        if (bannerFile) {
            formData.append("banner", bannerFile);
        }

        selectedProfiles.forEach((profile) => {
            formData.append("nomineeIds", profile.id);
        });

        try {

            const data = await createPoll({ formData});
            console.log("ajrhekajhdb", data)
            if (data && !("error" in data)) {
                setSelectedCategory(undefined);
                setSelectedProfiles([]);
                setPollName("");
                setBannerFile(null);       
                setBannerPreview(null);    
                
                toast.success("Poll launched!");
            } else {
                toast.error("Error creating poll");
            }
        } catch (e) {
            console.error("Submission Error:", e);
            toast.error("Failed to launch poll");
        }
    });
};

    return (
        <Card>
            <CardHeader>
                <h1 className="font-bold text-xl">Create New Poll</h1>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Banner Upload Field */}
<div className="space-y-1">
    <Label className="font-bold text-lg">Poll Banner</Label>
    <div 
        className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 overflow-hidden"
        onClick={() => bannerInputRef.current?.click()} // Trigger the hidden input
    >
        {bannerPreview ? (
            // Show the preview if an image is selected
            <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
        ) : (
            // Default placeholder if empty
            <>
                <ImageIcon className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Click to upload banner</p>
            </>
        )}
    </div>
    
    {/* Hidden File Input */}
    <input 
        type="file" 
        ref={bannerInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleBannerChange} 
    />
</div>
                <h2 className="font-bold text-lg">Add Nominees</h2>

                {/*A POPUP DIALOG FOR CREATE NOMINEE*/}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Create Nominee Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                        <form onSubmit={nomineeForm.handleSubmit(handleCreateProfile)}>
                            <DialogHeader>
                                <DialogTitle className="font-bold text-2xl">Create Nominee Profile</DialogTitle>
                                <DialogDescription>
                                    Add a new nominee to the database. They will appear in your search list once saved.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="items-center space-y-2">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Controller name="name" control={nomineeForm.control} render={({ field, fieldState }) => (
                                        <div className="">
                                            <Input {...field} aria-invalid={fieldState.invalid} placeholder="e.g. Catriona Gray" className="col-span-3" />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </div>
                                    )} />
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    {/* Image Preview Circle */}
                                    <Controller
                                        name="avatar"
                                        control={nomineeForm.control}
                                        render={({ fieldState }) => (
                                            <div className="flex flex-col items-center gap-2"                                         
                                            onClick={() => fileInputRef.current?.click()}
>
                                                <Avatar className={`size-24 border-2 border-dashed ${fieldState.invalid ? 'border-destructive' : 'border-muted-foreground/50'}`}>
                                                {
                                                    preview && <AvatarImage src={preview || ""} className="object-cover" />
                                                }
                                                    
                                                    <AvatarFallback className="bg-muted">
                                                        <ImagePlus className="size-8 text-muted-foreground" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                {fieldState.error && (
                                                    <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />


                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="grid  items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Bio</Label>
                                    {/* CONTROL FOR NOMINEE NAME */}
                                    <Controller
                                        name="bio"
                                        control={nomineeForm.control}
                                        render={({ field, fieldState }) => (
                                            <div className="flex flex-col w-full gap-1">
                                                <TextareaAutosize
                                                    {...field}
                                                    aria-invalid={fieldState.invalid}
                                                    minRows={3}
                                                    maxRows={10}
                                                    placeholder="Tell us about the nominee..."
                                                    className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none ${fieldState.invalid ? "border-destructive" : ""
                                                        }`}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{isCreatingProfile ? <Loader2 /> : "Save Nominee"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <InputGroup className="w-full">
                    <InputGroupInput value={searchQuery} placeholder="Search existing nominees" onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        if (value.trim() === "") {
                            setSearchResult([]);
                            setSearchQuery("")
                        }
                    }} />
                    <InputGroupAddon align="inline-end">
                        <Search />
                    </InputGroupAddon>
                </InputGroup>

                {/* This is the DIV for search Results */}
                <div className="relative">
                    {/* Use callback later */}
                    {(searchResult ?? []).length !== 0 && searchQuery !== "" &&
                        <div className="absolute top-0 flex flex-col z-10 w-full bg-background border-2 rounded-b-sm px-2 overflow-y-scroll">
                            {
                                searchResult && searchResult.map((profile) => (
                                    <div key={profile.id} className="h-12 overflow-hidden" onClick={() => {
                                    if (!selectedProfiles.some((p) => p.id === profile.id)) {
                                        setSelectedProfiles([...selectedProfiles, profile]);
                                        setSearchQuery("");
                                    } else {
                                        toast.error("Nominee already added");
                                        setSearchQuery("");
}
                                    }}>
                                        <div className="border-b-2 hover:bg-primary cursor-pointer rounded-sm w-full ">
                                            <p className="text-lg">{profile.name}</p>
                                            <p className="text-sm text-muted-foreground">{profile.bio}</p>
                                        </div>
                                    </div>
                                ))
                            }
                            <button className="cursor-pointer">show more...</button>
                        </div>
                    }
                </div>

                {/* DIV for the selected Nominees */}
                <div className=" grid grid-cols-4 gap-2 border-b-2 pb-2">
                    {selectedProfiles &&
                        selectedProfiles.map((profile) => (
                            <div key={profile.id} className="">
                                <Card className="p-2 relative items-center h-40 overflow-hidden hover:bg-primary/50 hover:cursor-pointer">  
                                <button onClick={() => {
                                    if (selectedProfiles?.includes(profile)) {
                                        const updated = selectedProfiles.filter((item) => item !== profile)
                                        setSelectedProfiles(updated)
                                    }
                                    else {
                                        setSelectedProfiles([...selectedProfiles, profile])
                                    }
                                }
                                }>
                                    <Trash2 className="absolute top-1 right-1 hover:scale-120" size={18}/>
                                </button>                                  

                                    <Avatar className="size-18">
                                        <AvatarImage
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className="grayscale"
                                        />
                                        <AvatarFallback>{profile.name}</AvatarFallback>
                                        <div className={` border border-primary size-5 items-center justify-center rounded-full absolute bottom-0 -right-1 ${selectedProfiles?.includes(profile) ? "bg-primary" : "bg-transparent"}`}>
                                            {selectedProfiles?.includes(profile) && <Check color="white" className="size-5" />}
                                        </div>
                                    </Avatar>
                                    <p className="w-full text-center break-words">{profile.name}</p>
                                </Card>
                            </div>))
                    }
                </div>
                {/* Select a category section */}
                <div className="border-b-2 pb-2">
                    <h2 className="font-bold text-lg">Select a Category</h2>
                    <div className="grid grid-cols-5 gap-2 text-center md:grid-cols-2">
                        {
                            categories.map((categ) => (
                                <div key={categ.id} className={`${categ === selectedCateg && "bg-primary border-primary-foreground"} border rounded-full hover:cursor-pointer hover:bg-primary/50`} onClick={() => {
                                    if (selectedCateg !== categ) {
                                        setSelectedCategory(categ)
                                    }
                                }}>
                                    <p>{categ.title}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div>
                    <h2 className="font-bold text-lg">Add details</h2>
                    <div className="p-2 space-y-1">
                        <p className="text-muted-foreground">Poll Name</p>
                        <Input 
                            value={pollName}
                            onChange={(e) => setPollName(e.target.value)}/>
                        <Popover>
                            <p className="text-muted-foreground">Date End</p>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full text-muted-foreground justify-between">
                                    <p>  {date ? format(date, "PPP") : "No date selected"}</p>
                                    <Calendar1Icon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverHeader>
                                </PopoverHeader>
                                <div>
                                    <Card size="sm" className="mx-auto w-fit">
                                        <CardContent>
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                className="p-0"
                                                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                            />
                                        </CardContent>
                                        <CardFooter className="border-t bg-card pt-4">
                                            <FieldGroup className="flex gap-4">
                                                <Field>
                                                    <FieldLabel htmlFor="time-to">End Time</FieldLabel>
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            id="time-to"
                                                            type="time"
                                                            step="1"
                                                            value={endTime}
                                                            onChange={(e) => setEndTime(e.target.value)}
                                                            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                                        />
                                                        <InputGroupAddon>
                                                            <Clock2Icon className="size-4 text-muted-foreground" />
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </Field>
                                            </FieldGroup>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="border-accent flex-1 cursor-pointer bg-gray-200" variant="ghost">Cancel</Button>
                <Button className="flex-1 cursor-pointer bg-primary" variant="ghost" onClick={()=>handleCreatePoll()}>{isCreatingPoll ? <Loader2/> :"Launch Poll"}</Button>
            </CardFooter>
        </Card>
    )
}

function PollCard({ data }: { data: PollData }) {

    const isActive = data.active
    return (
        <Card className="flex-1 py-8 hover:bg-primary/50 cursor-pointer hover:scale-110">

            <CardContent className="space-y-2">
                <CardTitle className="font-bold">{data.name}</CardTitle>
                <div>
                    <Badge variant={`${isActive ? "default" : "destructive"}`}>{isActive ? "Active" : "Inactive"}</Badge>
                    {/* Number of noms */}
                    {/* <div><User/> <p>{data.}</p></div> */}
                    <p><span className="font-bold">Ends:</span> {dateFormatter({ date: data.deadline })}</p>
                </div>
            </CardContent>
        </Card>
    )
}