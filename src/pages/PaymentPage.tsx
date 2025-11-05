import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const residenceId = searchParams.get("residence");
  const roomId = searchParams.get("room");
  const applicationId = searchParams.get("application");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setUser(user);
      setProfile(profileData);
      setLoading(false);
    };

    getUser();
  }, [navigate]);

  const handleSuccess = () => {
    toast({
      title: "¡Proceso completado!",
      description: "Serás redirigido a la página de la residencia",
    });
    setTimeout(() => {
      navigate(`/residence/${residenceId}`);
    }, 2000);
  };

  if (loading || !residenceId || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Realizar Pago</h1>
          <div className="bg-card rounded-lg p-6 shadow-md">
            <PaymentForm
              residenceId={residenceId}
              roomId={roomId || undefined}
              applicationId={applicationId || undefined}
              userId={profile.id}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
