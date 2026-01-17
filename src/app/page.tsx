import { requireAuth } from "@/lib/session";
import TodoList from "@/components/todo-list";
import { getCategories } from "@/actions/categories";
import { getTodos } from "@/actions/todos";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function Home() {
  await requireAuth();

  const queryClient = new QueryClient();

  // Prefetch todos and categories
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["todos", { showCompleted: false, categoryId: null, priority: "all", dueDate: "all" }],
      queryFn: () => getTodos({ showCompleted: false }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoList />
    </HydrationBoundary>
  );
}
