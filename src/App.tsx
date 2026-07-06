import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from './context/ThemeContext';
import { store } from './app/store';
import { AppRoutes } from './routes/routes';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
