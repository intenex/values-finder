import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Comparison from "@/pages/Comparison";
import Customize from "@/pages/Customize";
import Rating from "@/pages/Rating";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/comparison" component={Comparison} />
      <Route path="/customize" component={Customize} />
      <Route path="/rating" component={Rating} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
