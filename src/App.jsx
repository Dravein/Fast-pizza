import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Home from "./ui/Home";
import Menu, { loader as menuLoader } from "./features/menu/Menu";
import Cart from "./features/cart/Cart";
import CreateOrder, {
  action as createOrderAction,
} from "./features/order/CreateOrder";
import Order, { loader as orderLoader } from "./features/order/Order";
import { action as updateOrderAction } from "./features/order/UpdateOrder";
import AppLayout from "./ui/AppLayout";
import Error from "./ui/Error";

//Új mód a Route-okhoz.
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    //Ha Error van valmelyik Rout-nál ez jelenjen meg.
    errorElement: <Error />,
    //Annak az elementnek lesznek a Chldrenjei amiben vannak.
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/menu",
        element: <Menu />,
        //2. Csatlakoztatjuk a loader funkciót a Route-hoz URL-hez
        loader: menuLoader,
        //Előbb kapja el az Error messaget, és az app layout-ba bele renderelve mutatja meg
        errorElement: <Error />,
      },
      { path: "/cart", element: <Cart /> },
      {
        path: "/order/new",
        element: <CreateOrder />,
        action: createOrderAction,
      },
      {
        path: "/order/:orderId",
        element: <Order />,
        loader: orderLoader,
        errorElement: <Error />,
        //Működni fog a <fetcher.Form> miatt hiába nem pont ezene a route-on van "/order/:orderId" hanem  <Order /> egy childjen.
        action: updateOrderAction,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
