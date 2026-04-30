import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dex", "routes/dex.tsx"),
    route("pokemon/:pokemon", "routes/pokemon.tsx")

] satisfies RouteConfig;
