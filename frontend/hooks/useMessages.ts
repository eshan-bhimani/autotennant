import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface MessageOut {
  id: string;
  thread_id: string;
  sender_user_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface ThreadOut {
  id: string;
  landlord_id: string;
  tenant_id: string;
  property_id: string | null;
  created_at: string;
  last_message_at: string;
  counterparty_name: string;
  counterparty_role: "LANDLORD" | "TENANT";
  property_address: string | null;
  last_message_preview: string | null;
  unread_count: number;
}

export interface ThreadWithMessages extends ThreadOut {
  messages: MessageOut[];
}

export const useThreads = () =>
  useQuery({
    queryKey: ["messages", "threads"],
    queryFn: () =>
      api.get<ThreadOut[]>("/messages/threads").then((r) => r.data),
    refetchInterval: 10_000,
  });

export const useThread = (threadId: string | null) =>
  useQuery({
    queryKey: ["messages", "thread", threadId],
    queryFn: () =>
      api
        .get<ThreadWithMessages>(`/messages/threads/${threadId}`)
        .then((r) => r.data),
    enabled: !!threadId,
    refetchInterval: 5_000,
  });

export const useSendMessage = (threadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api
        .post<MessageOut>(`/messages/threads/${threadId}/messages`, { body })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "thread", threadId],
      });
      queryClient.invalidateQueries({ queryKey: ["messages", "threads"] });
    },
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      counterparty_user_id: string;
      property_id?: string | null;
      initial_message?: string | null;
    }) =>
      api.post<ThreadOut>("/messages/threads", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "threads"] });
    },
  });
};
