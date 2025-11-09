import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ResidenceCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Title and rating */}
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-12" />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Location and occupants */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        {/* Price */}
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-8 w-32" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2 w-full">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardFooter>
    </Card>
  );
};
