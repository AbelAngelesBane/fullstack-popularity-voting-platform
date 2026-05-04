import { useQuery } from "@tanstack/react-query"



export const useSearch = ()=>{
    
    const {data} = useQuery({
        queryKey:['search', ]
    })

}