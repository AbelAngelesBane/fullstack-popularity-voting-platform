import { api } from "@/lib/api"
import { HomePollsResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query"



export const useFeed = ()=>{
    const {data, isLoading, isError, isSuccess} = useQuery({
        queryFn: async()=>{
            const data = await api.get<HomePollsResponse>("/user/home");
            return data.data;
        },
        queryKey:['feed']
    });

    return {data, isLoading, isError, isSuccess}
}