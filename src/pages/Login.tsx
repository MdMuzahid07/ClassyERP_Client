import React from 'react';
import { useLoginMutation } from '../redux/feature/auth/authApi';

export const Login: React.FC = () => {
  const [login] = useLoginMutation();

  return (
    <div>
      <h1>Login Page</h1>
    </div>
  );
};
