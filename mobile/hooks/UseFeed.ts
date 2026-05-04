import { api } from "@/lib/api"
import { HomePollsResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query"



export const useFeed = ()=>{
    const {data, isFetching, isError, isSuccess, error} = useQuery({
        queryFn: async()=>{
            const data = await api.get<HomePollsResponse>("/user/home");
            return data.data;
        },
        queryKey:['feed']
    });

    return {data, isFetching, isError, isSuccess, error}
}