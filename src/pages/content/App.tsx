import { ThemeProvider } from "@/components/theme-provider"
import Citations from "./Citations"
import { Toaster } from "@src/components/ui/toaster"
 
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Citations />
        <Toaster />
    </ThemeProvider>
  )
}
 
export default App