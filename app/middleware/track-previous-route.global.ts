export default defineNuxtRouteMiddleware((to, from) => {
  // Store the previous route's full path in a global state
  const previousRoute = useState("previousRoute", () => "");

  previousRoute.value = from.fullPath;
});
