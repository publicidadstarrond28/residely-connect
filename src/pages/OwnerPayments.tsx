import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { OwnerPaymentPanel } from "@/components/payment/OwnerPaymentPanel";
import { PaymentStatsWidget } from "@/components/payment/PaymentStatsWidget";
import { supabase } from "@/integrations/supabase/client";

const OwnerPayments = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      if (profileData?.role !== "owner") {
        navigate("/");
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    getUser();
  }, [navigate]);

  if (loading) {
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
      <div className="container mx-auto px-4 py-8 space-y-6">
        <PaymentStatsWidget ownerId={profile.id} />
        <OwnerPaymentPanel ownerId={profile.id} />
      </div>
    </div>
  );
};

export default OwnerPayments;
