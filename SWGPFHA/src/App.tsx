// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Mission from "./pages/Mission";
import Programs from "./pages/Programs"; // ← fixed import (no .tsx)
import Media from "./pages/Media";
import GetInvolved from "./pages/GetInvolved";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin/Admin";
import Payment from "@/pages/Payment";
import PaymentPaystack from "./pages/PaymentPaystack";
import { AnimatePresence, motion } from "framer-motion";

const queryClient = new QueryClient();

/** Small wrapper that animates page mount/unmount. */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      // subtle lift & fade on enter, reverse on exit
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex-1"
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </div>
    </motion.main>
  );
}

/** Routes wrapped with AnimatePresence so pages can crossfade/slide. */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* use location+key so exiting page can animate out */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Home /></Page>} />
        <Route path="/about" element={<Page><About /></Page>} />
        <Route path="/mission" element={<Page><Mission /></Page>} />
        <Route path="/programs" element={<Page><Programs /></Page>} />
        <Route path="/media" element={<Page><Media /></Page>} />
        <Route path="/get-involved" element={<Page><GetInvolved /></Page>} />
        <Route path="/contact" element={<Page><Contact /></Page>} />
        <Route path="/admin" element={<Page><Admin /></Page>} />
        <Route path="/payment" element={<Page><Payment /></Page>} />
        <Route path="/payment/paystack" element={<Page><PaymentPaystack /></Page>} />

        {/* Keep this last */}
        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

/** Layout wrapper that hides Navigation/Footer on /admin routes */
function ConditionalLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navigation />}
      <AnimatedRoutes />
      {!isAdmin && <Footer />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <ConditionalLayout />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
