import { ThemeProvider } from "@/components/theme-provider"
import Citations from "./Citations"
import { Toaster } from "@src/components/ui/toaster"
import './style.css'
 
function App() {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
        <Citations />
        <Toaster />
    </ThemeProvider>
  )
}
 
export default App