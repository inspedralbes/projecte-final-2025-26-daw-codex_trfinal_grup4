<?php

namespace App\Notifications;

use App\Models\CenterRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CenterRequestApproved extends Notification implements ShouldQueue
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
        $centerHubUrl = $frontendUrl . '/center';

        $mail = (new MailMessage)
            ->subject('Tu centro ha sido aprobado – Codex')
            ->greeting('Enhorabuena, ' . $notifiable->name . '.')
            ->line('Tu solicitud para crear el centro educativo **' . $this->centerRequest->center_name . '** en Codex ha sido **aprobada**.')
            ->line('---')
            ->line('**Resumen de tu nuevo centro:**')
            ->line('Centro: ' . $this->centerRequest->center_name)
            ->line('Dominio: @' . $this->centerRequest->domain)
            ->line('Ciudad: ' . ($this->centerRequest->city ?: 'No especificada'))
            ->line('---')
            ->line('¿Qué significa esto?')
            ->line('- Tu cuenta ha sido promovida a Profesor en Codex.')
            ->line('- El Hub de tu centro ya está activo. Todos los usuarios con correo @' . $this->centerRequest->domain . ' tendrán acceso automáticamente.')
            ->line('- Como profesor, puedes moderar el contenido, fijar publicaciones y gestionar al alumnado de tu centro.');

        if ($this->adminNotes) {
            $mail->line('---')
                 ->line('**Notas del administrador:**')
                 ->line('_' . $this->adminNotes . '_');
        }

        $mail->action('Acceder a mi centro', $centerHubUrl)
             ->line('Si tienes alguna duda, puedes contactar con el equipo de Codex.')
             ->salutation('– El Equipo de Codex');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'center_request_approved',
            'center_name' => $this->centerRequest->center_name,
            'domain'      => $this->centerRequest->domain,
        ];
    }
}
