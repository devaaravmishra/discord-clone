"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search } from "lucide-react";

interface ServerSearchProps {
  data: {
    label: string;
    type: "channel" | "member";
    data:
      | {
          id: string;
          name: string;
          icon: React.ReactNode;
        }[]
      | undefined;
  }[];
}

const ServerSearch = ({ data }: ServerSearchProps) => {
  const router = useRouter();
  const params = useParams();

  const [isOpen, setIsOpen] = useState(false);

  const onClick = ({
    id,
    type,
  }: {
    id: string;
    type: "channel" | "member";
  }) => {
    setIsOpen(false);

    if (type === "channel") {
      router.push(`/servers/${params.serverId}/channels/${id}`);
    }

    if (type === "member") {
      router.push(`/servers/${params.serverId}/conversations/${id}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group px-2 py-2 rounded-md flex gap-x-2 items-center w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
      >
        <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
          Search
        </p>
        <kbd
          className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] 
            font-medium text-muted-foreground"
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>
          {data.map(({ label, data, type }) => {
            if (!data?.length) return null;

            return (
              <CommandGroup key={label} heading={label}>
                {data.map(({ id, name, icon }) => (
                  <CommandItem key={id} onClick={() => onClick({ id, type })}>
                    {icon}
                    <span className="text-sm font-semibold">{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default ServerSearch;
