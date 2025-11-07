import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderData {
  application_id: string
  applicant_id: string
  applicant_name: string
  residence_title: string
  next_payment_due: string
  days_before: number
  room_number: string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const today = new Date()
    console.log('Running payment reminders check for date:', today.toISOString())

    // Get all active applications with payment reminders enabled
    const { data: applications, error: appsError } = await supabaseClient
      .from('residence_applications')
      .select(`
        id,
        applicant_id,
        residence_id,
        room_id,
        next_payment_due,
        profiles!residence_applications_applicant_id_fkey(id, full_name),
        residences!inner(id, title),
        rooms(room_number),
        payment_reminders!inner(days_before, is_enabled)
      `)
      .eq('status', 'accepted')
      .eq('payment_reminders.is_enabled', true)
      .not('next_payment_due', 'is', null)

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      throw appsError
    }

    console.log(`Found ${applications?.length || 0} applications to check`)

    let remindersSent = 0

    for (const app of applications || []) {
      const dueDate = new Date(app.next_payment_due)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      const reminderDays = app.payment_reminders[0]?.days_before || 7

      console.log(`Application ${app.id}: ${daysUntilDue} days until due, reminder set for ${reminderDays} days`)

      const residenceTitle = Array.isArray(app.residences) ? app.residences[0]?.title : app.residences?.title
      const roomNumber = Array.isArray(app.rooms) ? app.rooms[0]?.room_number : app.rooms?.room_number

      // Send reminder if we're at the exact day threshold
      if (daysUntilDue === reminderDays) {
        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: app.applicant_id,
            type: 'payment_reminder',
            title: 'Recordatorio de pago',
            message: `Tu pago para ${residenceTitle}${roomNumber ? ` - Habitación ${roomNumber}` : ''} vence en ${daysUntilDue} días (${dueDate.toLocaleDateString('es-ES')}). Por favor, realiza tu pago a tiempo.`,
            is_read: false,
          })

        if (notificationError) {
          console.error(`Error creating notification for application ${app.id}:`, notificationError)
        } else {
          remindersSent++
          console.log(`Reminder sent for application ${app.id}`)
        }
      }

      // Also send overdue notifications
      if (daysUntilDue < 0) {
        const daysOverdue = Math.abs(daysUntilDue)
        
        const { error: overdueError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: app.applicant_id,
            type: 'payment_overdue',
            title: '⚠️ Pago vencido',
            message: `Tu pago para ${residenceTitle}${roomNumber ? ` - Habitación ${roomNumber}` : ''} está vencido desde hace ${daysOverdue} días. Por favor, realiza tu pago lo antes posible.`,
            is_read: false,
          })

        if (overdueError) {
          console.error(`Error creating overdue notification for application ${app.id}:`, overdueError)
        } else {
          remindersSent++
          console.log(`Overdue notification sent for application ${app.id}`)
        }
      }
    }

    console.log(`Payment reminders completed. Sent ${remindersSent} reminders.`)

    return new Response(
      JSON.stringify({
        success: true,
        checked: applications?.length || 0,
        sent: remindersSent,
        timestamp: today.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-payment-reminders function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
