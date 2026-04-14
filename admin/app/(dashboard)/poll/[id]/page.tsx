"use client"
import { getPollById, getPollComments, updatePoll } from "@/app/actions/poll";
import { Badge } from "@/components/ui/badge"
import { NomineeDetail, Pagination, PollComment, PollData } from "@/types/poll";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Pie, PieChart } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { dateFormatter, formatToLocalDatetime } from "@/lib/utils";
import { toast } from "sonner";

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

const generateRandomColor = () => {
    const color = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    return `#${color}`;
};

interface UpdatePollParams {
    name?: string;
    deadLine?: string;
    isArchived?: boolean;
    isActive?: boolean
}
const dateToday = new Date().toISOString().slice(0, 16);

export default function PollDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [data, setData] = useState<PollData>();
    const [isFetchingData, startFetching] = useTransition();
    const [isSaving, startSaving] = useTransition();
    const [error, setError] = useState<string | null>(null);


    // Popup State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        archived: false,
        deadLine: "",
        active: false
    });


    //Populate the FORM 
    useEffect(() => {
        startFetching(async () => {
            if (!id) return;
            const res = await getPollById({ pollId: id });
            if (!("error" in res) && res) {
                setData(res);
                document.title = (res.name)
                setEditForm({
                    name: res.name,
                    archived: res.archived || false,
                    deadLine: formatToLocalDatetime(res.deadline),
                    active: res.active
                });
            }
            else {
                document.title = ("404")
            }
        });
    }, [id]);

    function handleEdit() {
        setIsEditDialogOpen(true);
    }


    async function handleSaveEdit() {
        setError(null);

        if (!editForm.name.trim()) {
            setError("Poll name cannot be empty.");
            return;
        }
        if (!editForm.deadLine) {
            setError("Please select a deadline.");
            return;
        }

        startSaving(async () => {
            const dataCopy = data
            try {
                const updateParams: UpdatePollParams = {};

                if (editForm.name !== data?.name) {
                    updateParams.name = editForm.name;
                }

                if (editForm.archived !== data?.archived) {
                    updateParams.isArchived = editForm.archived;
                    console.log(data?.archived, editForm.archived)
                }

                if (editForm.active !== data?.active) {
                    updateParams.isActive = editForm.active
                }

                const newDeadlineISO = new Date(editForm.deadLine).toISOString();
                if (newDeadlineISO !== data?.deadline) {
                    updateParams.deadLine = newDeadlineISO;
                }

                if (Object.keys(updateParams).length === 0) {
                    setIsEditDialogOpen(false);
                    return;
                }

                const status = await updatePoll({
                    pollId: id as string,
                    bodyParam: updateParams
                });
                if (status === 200) {
                    toast.success("SUCCESS")
                    setData((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                             name: editForm.name,
                             deadline: new Date(editForm.deadLine).toISOString(), 
                             archived: editForm.archived,
                             active: editForm.active,
                        };
                    });
                    setIsEditDialogOpen(false);
                } else {
                    toast.error("Error")
                    setEditForm({
                        active: dataCopy!.active,
                        archived: dataCopy!.archived,
                        name: dataCopy!.name,
                        deadLine: formatToLocalDatetime(dataCopy!.deadline)
                    })
                    setData(dataCopy)
                    setError(`Update failed (Status: ${status})`);
                }
            } catch (err) {
                setError("Network error. Please try again later.");
                console.error(err);
            }
        });
    }

    return <main className="space-y-4 p-4">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Edit Poll Settings</DialogTitle>
                    <DialogDescription>Update poll details. Save to apply changes.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deadline" className="text-right">Deadline</Label>
                        <Input
                            id="deadline"
                            type="datetime-local"
                            min={dateToday}
                            value={editForm.deadLine}
                            onChange={(e) => setEditForm({ ...editForm, deadLine: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="archived" className="text-right">Archived</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Switch
                                id="archived"
                                checked={editForm.archived}
                                onCheckedChange={(checked: boolean) => setEditForm({ ...editForm, archived: checked })}
                            />
                            <span className="text-sm text-muted-foreground">
                                {editForm.archived ? "Hidden" : "Public"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="active" className="text-right">Active</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Switch
                                id="active"
                                checked={editForm.active}
                                onCheckedChange={(checked: boolean) => setEditForm({ ...editForm, active: checked })}
                            />
                            <span className="text-sm text-muted-foreground">
                                {editForm.active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="cursor-pointer">Cancel</Button>
                    <Button onClick={handleSaveEdit} disabled={isSaving} className="cursor-pointer">
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                    {error && (
                        <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded">
                            {error}
                        </p>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {data ? (
            <>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h1 className="font-bold tracking-tight text-xl md:text-2xl text-muted-foreground">Poll Details</h1>
                        <h3 className="text-4xl font-extrabold break-words">{data.name}</h3>
                        <p className="mt-2 text-lg">Total Votes: <span className="font-bold text-primary">{data.totalVotes}</span></p>
                        <p>Deadline: <span className="font-bold">{dateFormatter({ date: data.deadline })}</span></p>
                    </div>
                    <Card className="flex-1 p-4">
                        <div className="flex flex-row justify-between"><p>Poll id: <span className="font-bold">{data.id}</span></p>
                            <button onClick={() => handleEdit()} className="cursor-pointer">
                                <Edit />
                            </button>

                        </div>

                        <p>Category: <span className="font-bold">{data.category}</span></p>
                        <p>Status: <Badge variant={data.active ? "default" : "secondary"}>{data.active ? "ACTIVE" : "INACTIVE"}</Badge>
                            {data.archived && <Badge variant={"destructive"}>{data.archived && "ARCHIVED"}</Badge>}
                        </p>
                        <p>Created at: <span className="font-bold">{data.id}</span></p>
                    </Card>
                </section>

                <section>
                    <Card className="p-4">
                        <h3 className="text-xl font-bold mb-4">Nominee Profiles</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {data.nominees.map((item) => (
                                <Card key={item.id} className="size-40 overflow-hidden border-0 shadow-none bg-accent/20 justify-center items-center">
                                    <div className="relative rounded-full size-16">
                                        <Image className="object-cover rounded-full" src={item.avatar} alt={item.name} fill />
                                    </div>
                                    <div className="p-2 text-center">
                                        <p className="truncate font-bold text-sm">{item.name}</p>
                                        {/* <p className="text-xs text-muted-foreground">{item.votes} votes</p> */}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </Card>
                </section>

                <ChartPieLabel nomineeList={data.nominees} />
                <CommentSection pollId={id} />
            </>
        ) : (
            <div className="space-y-6">
                <Skeleton className="h-20 w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        )}
    </main>
}

function CommentSection({ pollId }: { pollId: string }) {

    const [comments, setComments] = useState<PollComment[]>();
    const [isFetchingData, startFetching] = useTransition();
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>()
    useEffect(() => {
        startFetching(async () => {
            const data = await getPollComments({ pollId, page: currentPage });

            if (data && !("error" in data)) {
                setComments((prev) => {
                    const currentList = prev || [];
                    const newComments = data.comments.filter((newC) => !currentList.some((oldC) => oldC.id === newC.id)
                    );
                    return [...currentList, ...newComments];
                });
                setPagination(data.pagination);
            }
        });
    }, [pollId, currentPage]);

    function handleShowMore() {
        setCurrentPage(currentPage + 1)
    }

    return (
        <div>
            <Card className="p-4">
                <div className="border-b-2 py-2">
                    <h3 className="text-xl font-bold">Comments</h3>
                </div>
                {/* <div className={`space-y-2 ${comments || ((comments ?? []).length) > 0 && "border-b-2 py-4"}`}>
                    <Textarea placeholder="Comment here.." />
                    <div><Button>Add comment</Button></div>
                </div> */}
                {
                    comments && (comments ?? []).length > 0 ? (<div className="w-full">
                        {(isFetchingData && comments.length < 0) ?
                            <div className="flex flex-row space-x-2">
                                <Skeleton className="size-15 rounded-full" />
                                <Skeleton className="w-full" />
                            </div> :
                            (<>{
                                comments.map((item) => {
                                    return <div key={item.id} className="mt-2">
                                        <div className="flex flex-row">
                                            <Avatar className="size-18">
                                                <AvatarImage
                                                    src={item.author.image}
                                                    alt={item.author.name}
                                                />
                                                <AvatarFallback>
                                                    <div className="rounded-full size-full" style={{ backgroundColor: generateRandomColor() }} />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="w-full flex-col px-4 space-y-2 overflow-hidden">
                                                <div className="flex flex-row justify-between ">
                                                    <p className="font-bold">{item.author.name}</p>
                                                    <p>{dateFormatter({ date: item.createdAt })}</p>
                                                </div>
                                                <p className="wrap-break-word">{item.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                }
                                )}{
                                    pagination?.hasMore &&
                                    <div className="flex justify-center items-center">
                                        <Button variant="ghost" onClick={() => handleShowMore()}>Show more...</Button>
                                    </div>
                                }

                            </>

                            )
                        }

                    </div>) : null
                }
            </Card>
        </div>
    )
}



export function ChartPieLabel({ nomineeList }: { nomineeList: NomineeDetail[] }) {

    //UGH, AI BEAT ME TO THIS dynamicConfig logic!
    const dynamicConfig = nomineeList.reduce((acc, nominee, index) => {
        acc[nominee.name] = {
            label: nominee.name,
            color: COLORS[index % COLORS.length],
        };
        return acc;
    }, {} as ChartConfig);

    const chartData = nomineeList.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length] || generateRandomColor(),
    }));

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>
                    <h3 className="text-xl font-bold"> Votes Breakdown</h3></CardTitle>
                <CardDescription>Distribution of total votes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={dynamicConfig}
                    className="mx-auto aspect-square max-h-[250px] pb-0"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="votes"
                            nameKey="name"
                            label
                        />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            className="-translate-y-2 flex-wrap gap-2"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="leading-none text-muted-foreground italic">
                    Based on {chartData.reduce((acc, curr) => acc + curr.votes, 0)} total votes
                </div>
            </CardFooter>
        </Card>
    )
}
