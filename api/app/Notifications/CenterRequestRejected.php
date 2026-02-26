<?php

namespace App\Notifications;

use App\Models\CenterRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CenterRequestRejected extends Notification
{
    use Queueable;

    public function __construct(
        private readonly CenterRequest $centerRequest,
        private readonly ?string $adminNotes = null
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $feedUrl = $frontendUrl . '/feed';

        $mail = (new MailMessage)
            ->subject('Actualizacion sobre tu solicitud de centro – Codex')
            ->greeting('Hola, ' . $notifiable->name . '.')
            ->line('Hemos revisado tu solicitud para crear el centro educativo **' . $this->centerRequest->center_name . '** en Codex.')
            ->line('Lamentablemente, tu solicitud ha sido **rechazada** en esta ocasión.')
            ->line('---');

        if ($this->adminNotes) {
            $mail->line('**Motivo indicado por el administrador:**')
                 ->line('_' . $this->adminNotes . '_')
                 ->line('---');
        }

        $mail->line('¿Qué puedes hacer ahora?')
             ->line('- Si crees que ha habido un error o dispones de documentacion adicional, puedes enviar una nueva solicitud desde la seccion Mi Centro en Codex.')
             ->line('- Mientras tanto, puedes seguir participando en el Feed Global de la comunidad.')
             ->action('Ir al Feed de Codex', $feedUrl)
             ->line('Pedimos disculpas por las molestias y agradecemos tu interes en Codex.')
             ->salutation('– El Equipo de Codex');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'center_request_rejected',
            'center_name' => $this->centerRequest->center_name,
            'domain'      => $this->centerRequest->domain,
        ];
    }
}
