import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@myapp/ui/card';
import { Input } from '@myapp/ui/input';
import { Button } from '@myapp/ui/button';
import { useState } from 'react';
import { API } from '@myapp/types/api';

export const Route = createFileRoute('/users')({
  component: Users,
});

function Users() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = API.Validators.CreateUserSchema.safeParse({
      email,
      name,
      password,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
    } else {
      setErrors({});
      console.log('Valid user data:', result.data);
      alert('User validation successful! Check console for details.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-secondary-900">User Management</h1>
      
      <Card variant="elevated" padding="lg">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Create New User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="user@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          
          <Input
            type="text"
            label="Name"
            placeholder="John Doe"
            value={name}
            onChange={setName}
            error={errors.name}
          />
          
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            error={errors.password}
          />
          
          <Button type="submit" variant="primary" fullWidth>
            Create User
          </Button>
        </form>
      </Card>

      <Card variant="bordered" padding="lg">
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Type-Safe Validation
        </h3>
        <p className="text-sm text-secondary-600">
          This form uses Zod schemas from @myapp/types to validate input on the client-side.
          The same schemas can be used on the server for consistent validation.
        </p>
      </Card>
    </div>
  );
}
