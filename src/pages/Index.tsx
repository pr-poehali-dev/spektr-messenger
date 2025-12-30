import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreen from '@/components/AuthScreen';
import ChatList from '@/components/ChatList';
import type { Language, Theme } from '@/lib/i18n';

export type User = {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  language: Language;
  theme: Theme;
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('spektr_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      applyTheme(parsed.theme || 'blue-dark');
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleAuth = (userData: User) => {
    setUser(userData);
    localStorage.setItem('spektr_user', JSON.stringify(userData));
    applyTheme(userData.theme || 'blue-dark');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('spektr_user');
    document.documentElement.removeAttribute('data-theme');
  };

  const handleChatSelect = (chatId: number) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <ChatList user={user} onLogout={handleLogout} onChatSelect={handleChatSelect} onUserUpdate={setUser} />
      ) : (
        <AuthScreen onAuth={handleAuth} />
      )}
    </div>
  );
};

export default Index;
