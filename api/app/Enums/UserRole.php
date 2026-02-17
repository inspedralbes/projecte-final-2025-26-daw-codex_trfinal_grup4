<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case UserNormal = 'userNormal';
    case Student = 'student';
    case Teacher = 'teacher';
}
