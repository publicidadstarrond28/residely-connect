import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { ResidenceChat as ChatComponent } from "@/components/chat/ResidenceChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ResidenceChat = () => {
  const { residenceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [residenceTitle, setResidenceTitle] = useState("");

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        // Get current user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          toast.error("Perfil no encontrado");
          return;
        }

        setCurrentProfileId(profile.id);

        if (!residenceId) return;

        // Fetch residence details and owner
        const { data: residence } = await supabase
          .from("residences")
          .select(`
            title,
            owner_id,
            profiles:owner_id (
              id,
              full_name
            )
          `)
          .eq("id", residenceId)
          .single();

        if (!residence) {
          toast.error("Residencia no encontrada");
          return;
        }

        setResidenceTitle(residence.title);

        // Determine if current user is owner or client
        const isOwner = residence.owner_id === profile.id;
        const ownerId = residence.owner_id;
        const clientId = isOwner ? profile.id : profile.id;

        // Check if conversation exists
        let { data: existingConversation } = await supabase
          .from("conversations")
          .select("id, client_id, owner_id, profiles!conversations_client_id_fkey(full_name), profiles!conversations_owner_id_fkey(full_name)")
          .eq("residence_id", residenceId)
          .or(`client_id.eq.${profile.id},owner_id.eq.${profile.id}`)
          .single();

        if (existingConversation) {
          setConversationId(existingConversation.id);
          // Set other user's name
          if (existingConversation.owner_id === profile.id) {
            setOtherUserName((existingConversation as any).profiles?.full_name || "Cliente");
          } else {
            setOtherUserName((residence.profiles as any)?.full_name || "Propietario");
          }
        } else if (!isOwner) {
          // Only clients can create new conversations
          const { data: newConversation, error } = await supabase
            .from("conversations")
            .insert({
              residence_id: residenceId,
              client_id: profile.id,
              owner_id: ownerId,
            })
            .select()
            .single();

          if (error) {
            console.error("Error creating conversation:", error);
            toast.error("Error al crear conversación");
            return;
          }

          setConversationId(newConversation.id);
          setOtherUserName((residence.profiles as any)?.full_name || "Propietario");
        } else {
          toast.error("No hay conversación activa con este cliente");
        }
      } catch (error: any) {
        console.error("Error initializing chat:", error);
        toast.error("Error al cargar el chat");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [navigate, residenceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentProfileId || !residenceId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/residence/${residenceId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{residenceTitle}</h1>
              <p className="text-muted-foreground text-sm">
                Conversación con {otherUserName}
              </p>
            </div>
          </div>
          <ChatComponent 
            conversationId={conversationId} 
            currentProfileId={currentProfileId}
            otherUserName={otherUserName}
            residenceId={residenceId}
          />
        </div>
      </main>
    </div>
  );
};

export default ResidenceChat;