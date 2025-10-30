import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, SlidersHorizontal } from "lucide-react";

interface ResidenceFiltersProps {
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

export const ResidenceFilters = ({ onFilterChange }: ResidenceFiltersProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    residenceType: "",
    genderPreference: "",
    status: "",
  });

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
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

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nombre o ubicación..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              placeholder="Ciudad..."
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="residenceType">Tipo</Label>
            <Select
              value={filters.residenceType}
              onValueChange={(value) => handleFilterChange("residenceType", value)}
            >
              <SelectTrigger id="residenceType">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="residence">Residencia</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genderPreference">Género</Label>
            <Select
              value={filters.genderPreference}
              onValueChange={(value) => handleFilterChange("genderPreference", value)}
            >
              <SelectTrigger id="genderPreference">
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="male">Caballeros</SelectItem>
                <SelectItem value="female">Damas</SelectItem>
                <SelectItem value="mixed">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Disponibilidad</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Seleccionar disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="occupied">Ocupadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minPrice">Precio Mínimo</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="$0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPrice">Precio Máximo</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="$10000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <Button variant="outline" onClick={handleReset} className="w-full">
          Resetear Filtros
        </Button>
      </CardContent>
    </Card>
  );
};
