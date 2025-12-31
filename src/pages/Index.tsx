import { useState } from 'react';
import AuthScreen from '@/components/AuthScreen';
import MessengerScreen from '@/components/MessengerScreen';

export type User = {
  username: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatar?: string;
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <MessengerScreen user={user} onLogout={() => setUser(null)} />
      ) : (
        <AuthScreen onAuth={setUser} />
      )}
    </div>
  );
};

export default Index;
