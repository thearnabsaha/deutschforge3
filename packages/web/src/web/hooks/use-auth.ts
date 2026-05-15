import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, signOut as authSignOut } from "../lib/auth";

export function useAuth() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    retry: false,
    staleTime: 60_000,
  });

  const user = sessionQuery.data?.user ?? null;
  const isLoading = sessionQuery.isLoading;

  const signOut = async () => {
    await authSignOut();
    queryClient.clear();
  };

  return { user, isLoading, signOut, refetch: sessionQuery.refetch };
}
