import React from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;
