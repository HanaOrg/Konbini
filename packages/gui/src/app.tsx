import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary } from "preact-iso";
import { LocationProvider, Route, Router } from "preact-iso/router";
import PackagePage from "./routes/package";
import Home from "./routes/home";
import NotFound from "./routes/not-found";
import Safety from "./routes/safety";
import Credits from "./routes/credits";
import AuthorPage from "./routes/author";
import Privacy from "./routes/privacy";
import Search from "./routes/search";
import Terms from "./routes/tos";
import About from "./routes/about";

export function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={Home} />
                    <Route path="/search" component={Search} />
                    <Route path="/author/:id" component={AuthorPage} />
                    <Route path="/package/:id" component={PackagePage} />
                    <Route path="/safety" component={Safety} />
                    <Route path="/credits" component={Credits} />
                    <Route path="/privacy" component={Privacy} />
                    <Route path="/tos" component={Terms} />
                    <Route path="/terms" component={Terms} />
                    <Route path="/about" component={About} />
                    <Route path="/about-us" component={About} />
                    <Route default component={NotFound} />
                </Router>
            </ErrorBoundary>
            <Analytics />
            <SpeedInsights />
        </LocationProvider>
    );
}
