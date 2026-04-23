import { api } from "@/lib/api";
import { CommentResponse, GetPollResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export const usePoll = (pollId: string) => {
    const { data, isFetching, isLoading, error } = useQuery({

        queryKey: ["poll", pollId], 
        queryFn: async () => {
            if (!pollId) throw new Error("Poll ID is missing");
            const response = await api.get<GetPollResponse>(`/user/poll/${pollId}`);
            console.log("Response:", response)
            return response.data.data;
        },
        // this runs the query
        enabled: !!pollId, 
    });

    const {data:comments, isFetching:isCommentsFetching}= useQuery({
        queryKey:[`comments-${pollId}`,pollId],
        queryFn:async()=>{
            const data = await api.get<CommentResponse>(`/user/comments/${pollId}`);
            return data.data.comments;
        }
    })

    return { data, isFetching, isLoading, error, comments, isCommentsFetching };
}
