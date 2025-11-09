import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Search, MapPin, Home, Users, DollarSign, CheckCircle, ChevronDown, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface ResidenceFiltersNavProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  residenceType: string;
  genderPreference: string;
  status: string;
}

export const ResidenceFiltersNav = ({ onFilterChange }: ResidenceFiltersNavProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    residenceType: "",
    genderPreference: "",
    status: "",
  });

  const [cities, setCities] = useState<string[]>([]);
  const [priceRanges] = useState([
    { label: "Menos de $200", min: "0", max: "200" },
    { label: "$200 - $500", min: "200", max: "500" },
    { label: "$500 - $1000", min: "500", max: "1000" },
    { label: "Más de $1000", min: "1000", max: "999999" },
  ]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    const { data } = await supabase
      .from("residences")
      .select("city")
      .order("city");
    
    if (data) {
      const uniqueCities = [...new Set(data.map(r => r.city))];
      setCities(uniqueCities);
    }
  };

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (min: string, max: string) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {
      search: "",
      city: "",
      minPrice: "",
      maxPrice: "",
      residenceType: "",
      genderPreference: "",
      status: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(v => v !== "").length;
  };

  const FiltersContent = () => (
    <>
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar residencias..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* City Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {filters.city || "Ciudad"}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto w-[200px]">
          <DropdownMenuItem onClick={() => handleFilterChange("city", "")}>
            Todas las ciudades
          </DropdownMenuItem>
          {cities.map((city) => (
            <DropdownMenuItem
              key={city}
              onClick={() => handleFilterChange("city", city)}
            >
              {city}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {filters.residenceType === "apartment" ? "Apartamento" : 
               filters.residenceType === "house" ? "Casa" : 
               filters.residenceType === "room" ? "Habitación" :
               filters.residenceType === "studio" ? "Estudio" : "Tipo"}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "")}>
            Todos los tipos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "apartment")}>
            Apartamento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "house")}>
            Casa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "room")}>
            Habitación
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "studio")}>
            Estudio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Gender Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {filters.genderPreference === "male" ? "Caballeros" : 
               filters.genderPreference === "female" ? "Damas" : 
               filters.genderPreference === "mixed" ? "Mixto" : "Género"}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "")}>
            Todas las preferencias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "male")}>
            Caballeros
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "female")}>
            Damas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "mixed")}>
            Mixto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Price Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {filters.minPrice && filters.maxPrice 
                ? `$${filters.minPrice}-$${filters.maxPrice}` 
                : "Precio"}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuItem onClick={() => handlePriceRangeChange("", "")}>
            Todos los precios
          </DropdownMenuItem>
          {priceRanges.map((range) => (
            <DropdownMenuItem
              key={range.label}
              onClick={() => handlePriceRangeChange(range.min, range.max)}
            >
              {range.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {filters.status === "available" ? "Disponibles" : 
               filters.status === "occupied" ? "Ocupadas" : "Estado"}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuItem onClick={() => handleFilterChange("status", "")}>
            Todas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("status", "available")}>
            Disponibles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterChange("status", "occupied")}>
            Ocupadas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  if (isMobile) {
    return (
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="border-b">
                  <DrawerTitle>Filtrar Residencias</DrawerTitle>
                  <DrawerDescription>
                    Personaliza tu búsqueda con los filtros disponibles
                  </DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto px-4 py-4">
                  <div className="flex flex-col gap-4">
                    <FiltersContent />
                  </div>
                </div>
                <DrawerFooter className="border-t flex-row gap-2">
                  {getActiveFiltersCount() > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  )}
                  <DrawerClose asChild>
                    <Button className="flex-1">
                      Aplicar Filtros
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar residencias..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" />
                {filters.city || "Ciudad"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => handleFilterChange("city", "")}>
                Todas las ciudades
              </DropdownMenuItem>
              {cities.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onClick={() => handleFilterChange("city", city)}
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                {filters.residenceType === "apartment" ? "Apartamento" : 
                 filters.residenceType === "house" ? "Casa" : 
                 filters.residenceType === "room" ? "Habitación" :
                 filters.residenceType === "studio" ? "Estudio" : "Tipo"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "")}>
                Todos los tipos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "apartment")}>
                Apartamento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "house")}>
                Casa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "room")}>
                Habitación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("residenceType", "studio")}>
                Estudio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                {filters.genderPreference === "male" ? "Caballeros" : 
                 filters.genderPreference === "female" ? "Damas" : 
                 filters.genderPreference === "mixed" ? "Mixto" : "Género"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "")}>
                Todas las preferencias
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "male")}>
                Caballeros
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "female")}>
                Damas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("genderPreference", "mixed")}>
                Mixto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <DollarSign className="h-4 w-4" />
                {filters.minPrice && filters.maxPrice 
                  ? `$${filters.minPrice}-$${filters.maxPrice}` 
                  : "Precio"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handlePriceRangeChange("", "")}>
                Todos los precios
              </DropdownMenuItem>
              {priceRanges.map((range) => (
                <DropdownMenuItem
                  key={range.label}
                  onClick={() => handlePriceRangeChange(range.min, range.max)}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {filters.status === "available" ? "Disponibles" : 
                 filters.status === "occupied" ? "Ocupadas" : "Estado"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleFilterChange("status", "")}>
                Todas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("status", "available")}>
                Disponibles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("status", "occupied")}>
                Ocupadas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {getActiveFiltersCount() > 0 && (
            <Button variant="ghost" onClick={handleReset} size="sm">
              Limpiar ({getActiveFiltersCount()})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
