<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class CenterScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * When a user is authenticated and this scope is applied,
     * it automatically filters posts to only show those belonging
     * to the user's center (the "Walled Garden" concept).
     *
     * This scope is NOT applied globally by default — it is applied
     * explicitly in center-specific queries via `Post::centerFiltered()`.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::guard('sanctum')->user();

        if ($user && $user->center_id) {
            $builder->where($model->getTable() . '.center_id', $user->center_id);
        } else {
            // User without center — show nothing from centers
            $builder->whereNull($model->getTable() . '.center_id');
        }
    }
}
