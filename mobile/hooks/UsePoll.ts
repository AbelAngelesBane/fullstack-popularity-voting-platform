import { api } from "@/lib/api";
import { CommentResponse, GetPollResponse } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const usePoll = (pollId?: string,commentsShown?:number) => {
    const { data, isPending, error } = useQuery({

        queryKey: ["poll", pollId], 
        queryFn: async () => {
            const response = await api.get<GetPollResponse>(`/user/poll/${pollId}`);
            return response.data.data
        },
        enabled: !!pollId, 
    });

    const {data:comments, isFetching:isCommentsFetching}= useQuery({
        //When the scrollToEnd doesnt work! check here if totalCommentCount is part of key
        queryKey:[`comments-${pollId}`, commentsShown],
        queryFn:async()=>{
            const data = await api.get<CommentResponse>(`/user/comments/${pollId}?commentShown=${commentsShown}`);
            return data.data.comments;
        }
    })

    const removeComment = useMutation({
        mutationFn:async (params:string)=> {
            const data =await api.delete(`/user/comment/${params}`)
            return data;
        }
    })

    const addComment = useMutation({
        mutationFn:async (body:{text:string, pollId:string})=> {
            const data =await api.post(`/user/comment`,body);
            return data;
        }
    })

    return { data, isPending, error, comments, isCommentsFetching, removeComment, addComment };
}


