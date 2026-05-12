<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$scheduleHours = (int) env('TRENDING_SCHEDULE_HOURS', 24);
if ($scheduleHours === 12) {
    Schedule::command('trending:compute')->cron('0 */12 * * *');
} else {
    Schedule::command('trending:compute')->daily();
}
