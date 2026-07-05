import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from './provider/ThemeProvider';
import { store } from './redux/store';
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
