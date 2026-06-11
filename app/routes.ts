import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("./routes/home.tsx"), 
    route('dashboard', "./routes/dashboard.tsx"),
    route('proposels', "./routes/proposels.tsx"),
    route('create_proposels', "./routes/create_proposels.tsx"),
    route('history', "./routes/history.tsx"),
    route('profile', "./routes/profile.tsx"),
    route('proposel/:id', "./routes/proposel.tsx"),
    route('vote/:id', "./routes/vote.tsx"),
] satisfies RouteConfig; 
