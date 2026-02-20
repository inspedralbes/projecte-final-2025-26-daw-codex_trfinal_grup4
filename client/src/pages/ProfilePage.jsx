import React from 'react';
import { useParams } from 'react-router-dom';
import Profile from '@/components/profile/Profile';

export default function ProfilePage() {
    const { username } = useParams();
    return <Profile username={username} />;
}
