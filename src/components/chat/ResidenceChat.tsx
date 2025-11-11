import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConversation } from "@/hooks/useConversation";
import { Send, Paperclip, File, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface ResidenceChatProps {
  conversationId: string | null;
  currentProfileId: string;
  otherUserName: string;
  residenceId?: string;
}

export const ResidenceChat = ({ conversationId, currentProfileId, otherUserName, residenceId }: ResidenceChatProps) => {
  const navigate = useNavigate();
  const { messages, loading } = useConversation(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const loadApplication = async () => {
      if (!residenceId || !currentProfileId) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentProfileId)
        .single();

      if (profile?.role === "resident") {
        const { data: appData } = await supabase
          .from("residence_applications")
          .select(`
            *,
            rooms:room_id (
              room_number,
              price_per_month
            )
          `)
          .eq("residence_id", residenceId)
          .eq("applicant_id", currentProfileId)
          .maybeSingle();

        setApplication(appData);
      }
    };

    loadApplication();
  }, [residenceId, currentProfileId]);

  const sendMessage = async (content: string, fileData?: any) => {
    if ((!content.trim() && !fileData) || !conversationId) return;

    setSending(true);
    try {
      const messageData: any = {
        content: content.trim(),
        sender_id: currentProfileId,
        conversation_id: conversationId,
      };

      if (fileData) {
        messageData.file_url = fileData.url;
        messageData.file_type = fileData.type;
        messageData.file_name = fileData.name;
        messageData.file_size = fileData.size;
      }

      const { error } = await supabase.from("messages").insert(messageData);

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

  if (!conversationId) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Inicia una conversación para comenzar a chatear</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Chat con {otherUserName}</CardTitle>
      </CardHeader>
      {application?.status === "accepted" && (
        <Alert className="mx-4 mt-4 bg-primary/10 border-primary">
          <DollarSign className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Tu aplicación fue aceptada. Procede con el pago.</span>
            <Button
              size="sm"
              onClick={() =>
                navigate(
                  `/payment?residenceId=${residenceId}&roomId=${application.room_id}&applicationId=${application.id}`
                )
              }
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Pagar Ahora
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-4 bg-gradient-to-b from-background to-muted/20" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === currentProfileId;
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {message.profiles?.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col max-w-[70%] ${
                      isCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border rounded-tl-sm"
                      }`}
                    >
                      {message.content && (
                        <p className="text-sm break-words">{message.content}</p>
                      )}
                      {renderFilePreview(message)}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {new Date(message.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t p-3 bg-background">
          <div className="flex gap-2 items-end">
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
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-full"
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
              className="flex-shrink-0 rounded-full"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};