import { useMutation, useQuery } from "@tanstack/react-query";
import { URL } from "constants/api.constants";

export const Counter = () => {
  const { isLoading, data, refetch } = useQuery({
    queryKey: ["counterData"],
    queryFn: () => fetch(`${URL}/counter`).then((res) => res.json()),
  });

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${URL}/counter`, { method: "post" });
    },
    onSuccess() {
      refetch();
    },
  });

  return (
    <div>
      <div>
        Counter: {isLoading || mutation.isLoading ? "..." : data?.counter}
      </div>
      <button
        onClick={() => {
          mutation.mutate();
        }}
        disabled={isLoading || mutation.isLoading}
      >
        Increase
      </button>
    </div>
  );
};
