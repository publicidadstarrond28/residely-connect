import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { Send, Paperclip, Image as ImageIcon, Video, File, Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResidenceChatProps {
  residenceId: string;
  currentUserId: string;
}

export const ResidenceChat = ({ residenceId, currentUserId }: ResidenceChatProps) => {
  const { messages, loading } = useRealtimeMessages(residenceId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string, fileData?: any) => {
    if (!content.trim() && !fileData) return;

    setSending(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", currentUserId)
        .single();

      if (!profile) throw new Error("Perfil no encontrado");

      const { error } = await supabase.from("messages").insert({
        content: content.trim(),
        sender_id: profile.id,
        residence_id: residenceId,
        file_url: fileData?.url,
        file_type: fileData?.type,
        file_name: fileData?.name,
        file_size: fileData?.size,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande (máx 50MB)");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-files")
        .getPublicUrl(fileName);

      await sendMessage(file.name, {
        url: publicUrl,
        type: file.type,
        name: file.name,
        size: file.size,
      });

      toast.success("Archivo enviado");
    } catch (error: any) {
      toast.error(error.message || "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  const renderFilePreview = (message: any) => {
    if (!message.file_url) return null;

    const isImage = message.file_type?.startsWith("image/");
    const isVideo = message.file_type?.startsWith("video/");
    const isAudio = message.file_type?.startsWith("audio/");

    if (isImage) {
      return (
        <img
          src={message.file_url}
          alt={message.file_name}
          className="max-w-xs rounded-lg"
        />
      );
    }

    if (isVideo) {
      return (
        <video controls className="max-w-xs rounded-lg">
          <source src={message.file_url} type={message.file_type} />
        </video>
      );
    }

    if (isAudio) {
      return (
        <audio controls className="max-w-xs">
          <source src={message.file_url} type={message.file_type} />
        </audio>
      );
    }

    return (
      <a
        href={message.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-secondary rounded-lg hover:bg-secondary/80"
      >
        <File className="h-4 w-4" />
        <span className="text-sm">{message.file_name}</span>
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chat de la Residencia</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_id === currentUserId ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.profiles?.avatar_url} />
                  <AvatarFallback>
                    {message.profiles?.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col ${
                    message.sender_id === currentUserId ? "items-end" : ""
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-md ${
                      message.sender_id === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">
                      {message.profiles?.full_name || "Usuario"}
                    </p>
                    {message.content && <p className="text-sm">{message.content}</p>}
                    {renderFilePreview(message)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(newMessage);
                }
              }}
              disabled={sending}
            />
            <Button
              onClick={() => sendMessage(newMessage)}
              disabled={sending || (!newMessage.trim())}
              size="icon"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};