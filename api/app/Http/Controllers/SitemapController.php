<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic sitemap.xml
     */
    public function index(): Response
    {
        // Get global posts
        $posts = Post::global()->orderBy('created_at', 'desc')->get();
        
        // Get active users (who have posts or are active, let's just get all non-banned users, assuming no ban flag for now, just all users)
        $users = User::all();

        $baseUrl = config('app.frontend_url', 'https://codex.com');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Static Pages
        $xml .= '<url>';
        $xml .= '<loc>' . $baseUrl . '/welcome</loc>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>1.0</priority>';
        $xml .= '</url>';

        // Posts
        foreach ($posts as $post) {
            $xml .= '<url>';
            $xml .= '<loc>' . $baseUrl . '/post/' . $post->id . '</loc>';
            $xml .= '<lastmod>' . $post->updated_at->toAtomString() . '</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.8</priority>';
            $xml .= '</url>';
        }

        // User Profiles
        foreach ($users as $user) {
            $xml .= '<url>';
            $xml .= '<loc>' . $baseUrl . '/profile/' . $user->username . '</loc>';
            $xml .= '<lastmod>' . $user->updated_at->toAtomString() . '</lastmod>';
            $xml .= '<changefreq>monthly</changefreq>';
            $xml .= '<priority>0.5</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml'
        ]);
    }
}
