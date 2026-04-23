"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import TextareaAutosize from 'react-textarea-autosize';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Calendar1Icon, ImageIcon, ImagePlus, Loader2, Plus, Search, SearchIcon, Trash2 } from "lucide-react"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,

} from "@/components/ui/input-group"
import { FieldError } from "@/components/ui/field";
import { addCategory, createNomineeProfile, createPoll, fetchPollAction, getCategories, searchNominees } from "@/app/actions/poll"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useSearchParams, useRouter, usePathname } from "next/navigation"; 
import { Clock2Icon } from "lucide-react"
import { format } from "date-fns";
import { Category, CreatePollParams, Nominees, PollData, PollResponse } from "@/types/poll";
import { toast } from "sonner";
import Link from "next/link";

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

                    <ToggleGroup
                        size="lg"
                        variant="outline"
                        type="single"
                        value={currentFilter} 
                        onValueChange={handleFilterChange} 
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
    
    // Dynamic Categories State
    const [categories, setCategories] = useState<Category[]>();
    const [isCategoryLoading, setIsCategoryLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState<string | null>(null);

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

    // Fetch Categories from Backend
// Fetch Categories from Backend
const fetchCategories = async () => {
        setIsCategoryLoading(true);
        try {
            const res = await getCategories();
            
            if (!("error" in res) && res.data) {
                if (Array.isArray(res.data)) {
                    setCategories(res.data);
                } else {
                    setCategories([res.data]);
                }
            }
        } catch (err) {
            toast.error("Failed to load categories");
        } finally {
            setIsCategoryLoading(false);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            setCategoryError("Category name is required");
            return;
        }
        setIsAddingCategory(true);
        setCategoryError(null);
        try {
            const res = await addCategory(newCategoryName.trim());
            
            if (!("error" in res) && res.data) {
                setCategories((prev) => prev ? [...prev, res.data] : [res.data]);
                
                toast.success("Category added successfully");
                setNewCategoryName("");

            } else {
                console.log(res);
                setCategoryError("Failed to add category");
            }
        } catch (err) {
            toast.error("Something went wrong!");
        } finally {
            setIsAddingCategory(false);
        }
    };

    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === "") {
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                const noms = await searchNominees({
                    searchInput: searchQuery,
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
            setBannerPreview(URL.createObjectURL(file));
            setBannerFile(file);
        }
    };

    const handleCreatePoll = () => {
        startCreatingPoll(async () => { 
            const err = [];
            if (!(selectedCateg?.id)) err.push("Category");
            if (!pollName) err.push("Poll Name");
            if (!date || !endTime) err.push("Date");
            if(!bannerFile || bannerFile === null)err.push("Banner")
            
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
                <div className="space-y-1">
                    <Label className="font-bold text-lg">Poll Banner</Label>
                    <div 
                        className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 overflow-hidden"
                        onClick={() => bannerInputRef.current?.click()}
                    >
                        {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <ImageIcon className="text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Click to upload banner</p>
                            </>
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={bannerInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleBannerChange} 
                    />
                </div>
                <h2 className="font-bold text-lg">Add Nominees</h2>

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
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="grid items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Bio</Label>
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
                                <Button type="submit">{isCreatingProfile ? <Loader2 className="animate-spin" /> : "Save Nominee"}</Button>
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

                <div className="relative">
                    {(searchResult ?? []).length !== 0 && searchQuery !== "" &&
                        <div className="absolute top-0 flex flex-col z-10 w-full bg-background border-2 rounded-b-sm px-2 overflow-y-scroll max-h-48">
                            {
                                searchResult && searchResult.map((profile) => (
                                    <div key={profile.id} className="min-h-12 overflow-hidden border-b-2 hover:bg-primary/10 cursor-pointer p-2" onClick={() => {
                                    if (!selectedProfiles.some((p) => p.id === profile.id)) {
                                        setSelectedProfiles([...selectedProfiles, profile]);
                                        setSearchQuery("");
                                    } else {
                                        toast.error("Nominee already added");
                                        setSearchQuery("");
                                    }
                                    }}>
                                        <p className="text-sm font-bold">{profile.name}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{profile.bio}</p>
                                    </div>
                                ))
                            }
                            <button className="text-xs p-2 text-primary">show more...</button>
                        </div>
                    }
                </div>

                <div className="grid grid-cols-4 gap-2 border-b-2 pb-2">
                    {selectedProfiles &&
                        selectedProfiles.map((profile) => (
                            <div key={profile.id} className="">
                                <Card className="p-2 relative items-center h-40 overflow-hidden hover:bg-primary/50 hover:cursor-pointer">  
                                <button onClick={() => {
                                    const updated = selectedProfiles.filter((item) => item.id !== profile.id)
                                    setSelectedProfiles(updated)
                                }}>
                                    <Trash2 className="absolute top-1 right-1 hover:scale-120 text-destructive" size={18}/>
                                </button>                                  

                                    <Avatar className="size-18 mx-auto">
                                        <AvatarImage
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback>{profile.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <p className="w-full text-center text-xs mt-2 break-words line-clamp-2">{profile.name}</p>
                                </Card>
                            </div>))
                    }
                </div>

                {/* Dynamic Categories Section */}
                <div className="border-b-2 pb-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Select a Category</h2>
                        
                        {/* ADD CATEGORY DIALOG */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                    <Plus className="size-3 mr-1" /> New Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Category</DialogTitle>
                                    <DialogDescription>Create a new category for polls.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Category Title</Label>
                                        <Input 
                                            placeholder="e.g. Sports" 
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                        />
                                        {categoryError && <p className="text-xs text-destructive">{categoryError}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddCategory} disabled={isAddingCategory}>
                                        {isAddingCategory ? <Loader2 className="animate-spin" /> : "Add Category"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {isCategoryLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Loader2 className="animate-spin size-4" /> Loading categories...
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {categories && categories.length !== 0 ? categories.map((categ) => (
                                <div 
                                    key={categ.id} 
                                    className={`px-3 py-1 text-sm border rounded-full transition-all hover:cursor-pointer ${
                                        selectedCateg?.id === categ.id 
                                        ? "bg-primary text-primary-foreground border-primary" 
                                        : "bg-background hover:bg-primary/10 border-input"
                                    }`} 
                                    onClick={() => setSelectedCategory(categ)}
                                >
                                    <p>{categ.title}</p>
                                </div>
                            ))  : <p>Add a category</p>}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="font-bold text-lg">Add details</h2>
                    <div className="p-2 space-y-1">
                        <p className="text-muted-foreground">Poll Name</p>
                        <Input 
                            value={pollName}
                            onChange={(e) => setPollName(e.target.value)}/>
                        <Popover>
                            <p className="text-muted-foreground mt-2">Date End</p>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full text-muted-foreground justify-between">
                                    <p>{date ? format(date, "PPP") : "No date selected"}</p>
                                    <Calendar1Icon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Card size="sm" className="border-none shadow-none">
                                    <CardContent className="p-3">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                    </CardContent>
                                    <CardFooter className="border-t bg-muted/50 p-3">
                                        <div className="flex flex-col gap-2 w-full">
                                            <Label htmlFor="time-to" className="text-xs">End Time</Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="time-to"
                                                    type="time"
                                                    step="1"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                />
                                                <InputGroupAddon>
                                                    <Clock2Icon className="size-4 text-muted-foreground" />
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button className="flex-1 cursor-pointer" variant="outline">Cancel</Button>
                <Button className="flex-1 cursor-pointer bg-primary" onClick={handleCreatePoll} disabled={isCreatingPoll}>
                    {isCreatingPoll ? <Loader2 className="animate-spin" /> : "Launch Poll"}
                </Button>
            </CardFooter>
        </Card>
    )
}

function PollCard({ data }: { data: PollData }) {
    const isActive = data.active
    return (
        <Card className="flex-1 py-8 hover:bg-primary/10 transition-all cursor-pointer hover:scale-[1.02]">
            <CardContent className="space-y-2">
                <CardTitle className="font-bold">{data.name}</CardTitle>
                <div>
                    <Badge variant={`${isActive ? "default" : "destructive"}`}>{isActive ? "Active" : "Inactive"}</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-bold text-foreground">Ends:</span> {dateFormatter({ date: data.deadline })}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}