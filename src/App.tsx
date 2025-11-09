import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import CreateResidence from "./pages/CreateResidence";
import EditResidence from "./pages/EditResidence";
import ResidenceChat from "./pages/ResidenceChat";
import ResidenceDetails from "./pages/ResidenceDetails";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentPage from "./pages/PaymentPage";
import OwnerPayments from "./pages/OwnerPayments";
import MyPayments from "./pages/MyPayments";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-residence" element={<CreateResidence />} />
          <Route path="/edit-residence/:residenceId" element={<EditResidence />} />
          <Route path="/residence/:residenceId" element={<ResidenceDetails />} />
          <Route path="/chat/:residenceId" element={<ResidenceChat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/owner-payments" element={<OwnerPayments />} />
          <Route path="/my-payments" element={<MyPayments />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
