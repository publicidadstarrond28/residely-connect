import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface ApplicationStatus {
  [roomId: string]: {
    status: string;
    id: string;
    rejection_count: number;
  };
}

export const useRoomApplicationStatus = (residenceId: string | undefined, profileId: string | null) => {
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!residenceId || !profileId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from("residence_applications")
        .select("id, room_id, status, rejection_count")
        .eq("residence_id", residenceId)
        .eq("applicant_id", profileId);

      if (error) {
        console.error("Error fetching applications:", error);
      } else if (data) {
        const statusMap: ApplicationStatus = {};
        data.forEach((app) => {
          if (app.room_id) {
            statusMap[app.room_id] = {
              status: app.status,
              id: app.id,
              rejection_count: app.rejection_count || 0,
            };
          }
        });
        setApplicationStatus(statusMap);
      }
      setLoading(false);
    };

    fetchApplications();

    // Subscribe to real-time updates
    channel = supabase
      .channel(`applications-${residenceId}-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "residence_applications",
          filter: `residence_id=eq.${residenceId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newApp = payload.new as any;
            if (newApp.applicant_id === profileId && newApp.room_id) {
              setApplicationStatus((prev) => ({
                ...prev,
                [newApp.room_id]: {
                  status: newApp.status,
                  id: newApp.id,
                  rejection_count: newApp.rejection_count || 0,
                },
              }));
            }
          } else if (payload.eventType === "DELETE") {
            const oldApp = payload.old as any;
            if (oldApp.applicant_id === profileId && oldApp.room_id) {
              setApplicationStatus((prev) => {
                const newStatus = { ...prev };
                delete newStatus[oldApp.room_id];
                return newStatus;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residenceId, profileId]);

  return { applicationStatus, loading };
};
