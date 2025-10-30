import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Building2, LogOut, User, Home, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

export const Header = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchNotifications();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      fetchProfile(user.id);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) return;

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userProfile.id)
      .eq("is_read", false);

    setNotificationCount(count || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 group-hover:shadow-[var(--shadow-elegant)] transition-shadow">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              ResideHub
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {profile ? (
              <>
                {profile.role === "owner" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate("/create-residence")}
                    className="hidden sm:flex bg-gradient-to-r from-primary to-primary/90"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Residencia
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No hay notificaciones nuevas
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {profile.role === "owner" ? "Dueño" : "Residente"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <Home className="mr-2 h-4 w-4" />
                      Inicio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-primary/90"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
