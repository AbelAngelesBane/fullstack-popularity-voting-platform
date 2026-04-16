import { api } from "@/lib/api";
import { MyVotesResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

export const useVotes = ({ loaded }: { loaded: number }) => {
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["myvotes", loaded],
    queryFn: async () => {
      const data = await api.get<MyVotesResponse>(
        `/user/votes?loaded=${loaded}`,
      );
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  return { data, isLoading, isError, isSuccess };
};
