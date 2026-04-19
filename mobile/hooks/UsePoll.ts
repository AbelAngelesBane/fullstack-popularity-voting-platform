import { api } from "@/lib/api";
import { GetPollResponse } from "@/types/types";
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
        // this runbs the query
        enabled: !!pollId, 
    });

    return { data, isFetching, isLoading, error };
}
