"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  LogOut,
  Send,
  Trash2,
  User as UserIcon,
  ChevronsLeft,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// A more refined ChatMessage component
const ChatMessage = ({ content, isUser }) => (
  <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
    {!isUser && (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-700">
        <UserIcon className="size-5 text-gray-400" />
      </div>
    )}
    <div
      className={cn(
        "max-w-[85%] sm:max-w-[70%] rounded-lg px-4 py-2",
        isUser
          ? "rounded-br-none bg-blue-600 text-white"
          : "rounded-bl-none bg-gray-700 text-gray-200"
      )}
    >
      <p className="break-words">{content}</p>
    </div>
    {isUser && (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
        <UserIcon className="size-5 text-white" />
      </div>
    )}
  </div>
);

// Sidebar Component
const Sidebar = ({ isOpen, user, room, onLogout }) => (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-700 bg-[#2a2a2a] p-4 transition-all duration-300",
        "fixed inset-y-0 left-0 z-20 w-72 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
        <div className="flex items-center justify-between">
            <img src="/apple-touch-icon.png" alt="Arcanus Logo" className="size-10 rounded-lg" />
            <h1 className="text-xl font-bold">Arcanus</h1>
        </div>
        <div className="mt-8 flex-1">
            <h2 className="mb-4 text-lg font-semibold text-gray-400">Room Info</h2>
            <div className="space-y-2 text-sm">
                <p className="font-semibold">Room ID</p>
                <p className="break-all text-gray-400">{room}</p>
            </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="mt-auto w-full justify-start gap-2">
                    <UserIcon className="size-5" />
                    <span className="truncate">{user?.email || "Loading..."}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium leading-none">Logged In As</p>
                    <p className="truncate text-xs leading-none text-muted-foreground">
                        {user?.email}
                    </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </aside>
);


export default function Room() {
  const router = useRouter();
  const { room } = useParams();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const messagesEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
    });
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase.from("Messages").select("*").eq("RoomId", room).order("timestamp", { ascending: true });
      setMessages(data || []);
    };
    loadMessages();

    const messageChannel = supabase.channel(`messages-${room}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "Messages", filter: `RoomId=eq.${room}`}, (payload) => setMessages((prev) => [...prev, payload.new])).subscribe();
    const roomChannel = supabase
      .channel(`room-delete-${room}`)
      .on("broadcast", { event: "room-deleted" }, (message) => {
        if (message.payload.senderId !== user?.id) {
          setRoomDeleted(true);
          toast.warning("Room was deleted. Redirecting...");
          setTimeout(() => router.push("/"), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [room, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    await supabase.from("Messages").insert({ RoomId: room, SenderId: user.id, Content: content });
    setContent("");
  };

  const deleteRoom = async () => {
    const channel = supabase.channel(`room-delete-${room}`);
    await channel.send({
      type: "broadcast",
      event: "room-deleted",
      payload: { senderId: user.id },
    });
    await supabase.from("Chatroom").delete().eq("token", room);
    toast.success("Room deleted successfully.");
    router.push("/");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("You have been logged out.");
    router.push("/login");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(room);
    toast.success("Room ID copied to clipboard!");
  };

  if (roomDeleted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#1e1e1e] text-white">
        <h2 className="mb-2 text-xl font-semibold">Room Deleted</h2>
        <p>This room no longer exists. Redirecting to home...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-[#1e1e1e] text-gray-200">
        <Sidebar isOpen={isSidebarOpen} user={user} room={room} onLogout={logout} />
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-10 bg-black/50 md:hidden" />}
        
        <main className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-gray-700 px-4 bg-[#2a2a2a] md:justify-end">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden">
              <Menu className="size-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={copyRoomId}>
                    <Copy className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Copy Room ID</p></TooltipContent>
              </Tooltip>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon"><Trash2 className="size-5" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete the chat room. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteRoom}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500"><p>No messages yet. Send the first one!</p></div>
              ) : (
                messages.map((msg) => <ChatMessage key={msg.id} content={msg.Content} isUser={msg.SenderId === user?.id} />)
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-gray-700 p-4 bg-[#2a2a2a]">
            <form onSubmit={sendMessage} className="mx-auto flex max-w-4xl items-center gap-2">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-white"
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!content.trim()}><Send className="size-5" /></Button>
            </form>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
