import './App.css'
import { ThemeProvider } from './components/theme-provider'
import { AllWalletsProvider } from './services/wallets/AllWalletsProvider'
import Home from './Home'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AllWalletsProvider>
        <Home />
      </AllWalletsProvider>
    </ThemeProvider>
  )
}

export default App
