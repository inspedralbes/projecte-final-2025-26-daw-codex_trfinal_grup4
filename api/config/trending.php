<?php

return [
    'window_hours' => (int) env('TRENDING_WINDOW_HOURS', 24),
    'limit' => (int) env('TRENDING_LIMIT', 10),
    'weights' => [
        'like' => (float) env('TRENDING_WEIGHT_LIKE', 1.0),
        'comment' => (float) env('TRENDING_WEIGHT_COMMENT', 2.0),
        'repost' => (float) env('TRENDING_WEIGHT_REPOST', 3.0),
        'bookmark' => (float) env('TRENDING_WEIGHT_BOOKMARK', 1.5),
    ],
];
