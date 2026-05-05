<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        $verificationUrl = $this->verificationUrl($notifiable);
        $userName = $notifiable->name ?? 'there';

        return (new MailMessage)
            ->subject('Confirma tu cuenta en Codex')
            ->greeting('Hola ' . $userName . ',')
            ->line('Gracias por registrarte en Codex, la red social académica para estudiantes de FP en Informática.')
            ->line('Para completar tu registro y acceder a todas las funcionalidades, confirma tu dirección de correo electrónico:')
            ->action('Confirmar mi cuenta', $verificationUrl)
            ->line('Este enlace expirará en 60 minutos.')
            ->line('Si no has creado una cuenta en Codex, puedes ignorar este mensaje.');
    }

    /**
     * Generate the verification URL.
     * Points to the API endpoint directly (frontend can also wrap this).
     */
    protected function verificationUrl(object $notifiable): string
    {
        // Generate a signed URL to the API verify endpoint
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(
                Config::get('auth.verification.expire', 60)
            ),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
