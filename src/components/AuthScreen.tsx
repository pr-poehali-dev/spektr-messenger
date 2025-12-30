import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { User } from '@/pages/Index';

type AuthScreenProps = {
  onAuth: (user: User) => void;
};

type AuthStep = 'login' | 'register' | 'verify';

const AuthScreen = ({ onAuth }: AuthScreenProps) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleLogin = () => {
    if (!email || !username) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    const user: User = {
      username: username.startsWith('@') ? username : `@${username}`,
      firstName: 'Пользователь',
      email,
    };
    setPendingUser(user);
    setStep('verify');
    toast.success(`Код отправлен на ${email}`);
  };

  const handleRegister = () => {
    if (!email || !username || !firstName) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    const user: User = {
      username: username.startsWith('@') ? username : `@${username}`,
      firstName,
      lastName: lastName || undefined,
      email,
    };
    setPendingUser(user);
    setStep('verify');
    toast.success(`Код отправлен на ${email}`);
  };

  const handleVerify = () => {
    if (code.length !== 6) {
      toast.error('Введите 6-значный код');
      return;
    }
    if (pendingUser) {
      toast.success('Добро пожаловать в Spektr!');
      onAuth(pendingUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-4xl font-bold text-primary-foreground">S</span>
          </div>
          <CardTitle className="text-3xl">Spektr</CardTitle>
          <CardDescription>
            {step === 'verify'
              ? 'Введите код из письма'
              : step === 'register'
              ? 'Создайте аккаунт'
              : 'Войдите в аккаунт'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'verify' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button onClick={handleVerify} className="w-full" size="lg">
                Подтвердить
              </Button>
              <Button
                onClick={() => {
                  setStep('login');
                  setCode('');
                }}
                variant="ghost"
                className="w-full"
              >
                Назад
              </Button>
            </>
          ) : step === 'register' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Почта *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleRegister} className="w-full" size="lg">
                Зарегистрироваться
              </Button>
              <Button onClick={() => setStep('login')} variant="ghost" className="w-full">
                Уже есть аккаунт? Войти
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Почта</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginUsername">Username</Label>
                <Input
                  id="loginUsername"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <Button onClick={handleLogin} className="w-full" size="lg">
                Войти
              </Button>
              <Button onClick={() => setStep('register')} variant="ghost" className="w-full">
                Нет аккаунта? Зарегистрироваться
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
