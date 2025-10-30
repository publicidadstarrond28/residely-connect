import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { ResidenceCard } from "@/components/residence/ResidenceCard";
import { ResidenceFilters, FilterValues } from "@/components/residence/ResidenceFilters";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import heroImage from "@/assets/residence-hero.jpg";

interface Residence {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  price_per_month: number;
  residence_type: string;
  gender_preference: string;
  status: string;
  capacity: number;
  current_occupants: number;
  photos?: Array<{ photo_url: string; is_primary: boolean }>;
  ratings?: Array<{ rating: number }>;
}

const Home = () => {
  const [residences, setResidences] = useState<Residence[]>([]);
  const [filteredResidences, setFilteredResidences] = useState<Residence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchResidences();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const fetchResidences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("residences")
      .select(`
        *,
        photos:residence_photos(*),
        ratings(rating)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching residences:", error);
    } else {
      setResidences(data || []);
      setFilteredResidences(data || []);
    }
    setLoading(false);
  };

  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...residences];

    if (filters.search) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.city.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.state.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.city) {
      filtered = filtered.filter((r) =>
        r.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter((r) => r.price_per_month >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((r) => r.price_per_month <= parseFloat(filters.maxPrice));
    }

    if (filters.residenceType && filters.residenceType !== "all") {
      filtered = filtered.filter((r) => r.residence_type === filters.residenceType);
    }

    if (filters.genderPreference && filters.genderPreference !== "all") {
      filtered = filtered.filter((r) => r.gender_preference === filters.genderPreference);
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    setFilteredResidences(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Residencias modernas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Encuentra tu{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                hogar ideal
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Conectamos residentes con los mejores espacios. Tu próxima aventura comienza aquí.
            </p>
            {!isAuthenticated && (
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-primary to-primary/90 shadow-[var(--shadow-elegant)]"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Comenzar Búsqueda
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ResidenceFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Residences Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {filteredResidences.length} residencias disponibles
              </h2>
              <p className="text-muted-foreground">
                Encuentra el lugar perfecto para ti
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredResidences.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">
                  No se encontraron residencias con estos filtros
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResidences.map((residence) => (
                  <ResidenceCard key={residence.id} residence={residence} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
