import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { ResidenceChat as ChatComponent } from "@/components/chat/ResidenceChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const ResidenceChat = () => {
  const { residenceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [residenceTitle, setResidenceTitle] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Fetch residence details
      if (residenceId) {
        const { data: residence } = await supabase
          .from("residences")
          .select("title")
          .eq("id", residenceId)
          .single();

        if (residence) {
          setResidenceTitle(residence.title);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate, residenceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId || !residenceId) {
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
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{residenceTitle}</h1>
              <p className="text-muted-foreground">Chat de la residencia</p>
            </div>
          </div>
          <ChatComponent residenceId={residenceId} currentUserId={userId} />
        </div>
      </main>
    </div>
  );
};

export default ResidenceChat;