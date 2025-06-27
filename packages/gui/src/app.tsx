import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary } from "preact-iso";
import { LocationProvider, Route, Router } from "preact-iso/router";
import PackagePage from "./routes/package";
import { Home } from "./routes/home";
import { NotFound } from "./routes/not-found";
import { Safety } from "./routes/safety";
import { Credits } from "./routes/credits";

export function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={Home} />
                    <Route path="/package/:id" component={PackagePage} />
                    <Route path="/safety" component={Safety} />
                    <Route path="/credits" component={Credits} />
                    <Route default component={NotFound} />
                </Router>
            </ErrorBoundary>
            <Analytics />
            <SpeedInsights />
        </LocationProvider>
    );
}
