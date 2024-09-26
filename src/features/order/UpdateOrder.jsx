import { useFetcher } from "react-router-dom";
import Button from "../../ui/Button";
import { updateOrder } from "../../services/apiRestaurant";

function UpdateOrder({ order }) {
  const fetcher = useFetcher();

  return (
    // <fetcher.Form> ezzel is lehet fetchelni (HTTP POST GET stb req-et küldeni API-nak) annélkül hogy elnavigálnánk másholva (<Form> hasonlít ehhez de ezzel elnavigálunk)
    <fetcher.Form method="PATCH" className="text-right">
      <Button type="primary">Make priority</Button>;
    </fetcher.Form>
  );
}

export default UpdateOrder;

//Page-el az akciót csatlakoztatni kell.
export async function action({ request, params }) {
  //   // Teszt hogy működik-e.
  //   console.log("update");

  const data = { priority: true };
  await updateOrder(params.orderId, data);
  return null;
}
