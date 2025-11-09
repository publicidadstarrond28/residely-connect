import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { ResidenceCard } from "@/components/residence/ResidenceCard";
import { ResidenceCardSkeleton } from "@/components/residence/ResidenceCardSkeleton";
import { ResidenceFiltersNav, FilterValues } from "@/components/residence/ResidenceFiltersNav";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Encuentra tu Hogar Ideal
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Conectamos residentes con los mejores espacios para vivir
          </p>
          {!isAuthenticated && (
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
              onClick={() => window.location.href = "/auth"}
            >
              Comenzar Búsqueda
            </Button>
          )}
        </div>
      </section>

      {/* Filters Navigation */}
      <ResidenceFiltersNav onFilterChange={handleFilterChange} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ResidenceCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredResidences.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No se encontraron residencias con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResidences.map((residence, index) => (
              <div
                key={residence.id}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <ResidenceCard residence={residence} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
