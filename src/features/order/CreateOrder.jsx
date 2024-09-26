import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store.js";
import { formatCurrency } from "../../utils/helpers";
import { fetchAddress } from "../user/userSlice.js";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

const fakeCart = [
  {
    pizzaId: 12,
    name: "Mediterranean",
    quantity: 2,
    unitPrice: 16,
    totalPrice: 32,
  },
  {
    pizzaId: 6,
    name: "Vegetale",
    quantity: 1,
    unitPrice: 13,
    totalPrice: 13,
  },
  {
    pizzaId: 11,
    name: "Spinach and Mushroom",
    quantity: 1,
    unitPrice: 15,
    totalPrice: 15,
  },
];

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const {
    username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector((state) => state.user);
  const isLoadingAddress = addressStatus === "loading";

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const formErrors = useActionData();
  const dispatch = useDispatch();

  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Let s go!</h2>

      {/* React Router-ből jön a <Form> elem,
          -POST a HTTP methodot jelölni
          -action="/order/new" melyik URL, nem kell külön deklarálni mert a Route-ból tudja a form
      */}
      {/* <Form method="POST" action="/order/new"> */}
      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow"
            type="text"
            name="customer"
            required
            defaultValue={username}
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />
            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              name="address"
              disabled={isLoadingAddress}
              defaultValue={address}
              required
            />
            {addressStatus === "error" && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {errorAddress}
              </p>
            )}
          </div>
          {!position.latitudde && !position.longitude && (
            <span className="absolute right-[3px] top-[3px] z-50 md:right-[5px] md:top-[5px]">
              <Button
                disabled={isLoadingAddress}
                type="small"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                Get Position
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            className="h-6 w-6 accent-yellow-400 focus:ring-yellow-400 focus:ring-offset-2"
            type="checkbox"
            name="priority"
            id="priority"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          {/* //Cart Objectet is átadjuk a postnak, egy hidden input fielddel vagyis amit nem kátunk az oldalon. Ez egy trükk amivel az action fgv láthatja a cart-ot */}
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <input
            type="hidden"
            name="position"
            value={
              position.longitude && position.latitude
                ? `${position.latitude},${position.longitude}`
                : ""
            }
          />
          <Button disabled={isSubmitting || isLoadingAddress} type="primary">
            {isSubmitting
              ? "Placing order..."
              : `Order now from ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

//Ha sumit-álok egy <Form> <Form> között lévő jsx-et akkor hívodik meg az akció, mintha egy post requestet küldene.
export async function action({ request }) {
  //FormData az egy regular WebApi amit a browser add. Form-ból vesszük ki vele a cart adatokat, hiszen nem a fetch apival történik az elérés, hanem az ott lévő React Router Post-al.
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  // console.log(data);

  //Átalakítjuk a küldendő adatokat (POST) kicsit, illetve hozzátesszük mindig külve legyen a priority ne csak akkor amikor bejelüljók a UI-n.
  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true",
  };
  console.log(order);

  const errors = {};
  //Ha nem jól adjuk meg a telefonszámot akkor hibát fog kiírni.
  if (!isValidPhone(order.phone))
    errors.phone =
      "Please give us your correct phone number. We might need it to contact you";

  // Ha az errorba akármilyen objektum akkor visszatér az error-al.
  if (Object.keys(errors).length > 0) return errors;

  // IF everything is okay create a new order and redirect.
  //Amit új adatot létrehozunk azzal vissza is tér a createOrder, vagyis rögtön meglehet jeleníteni az őj ordert.
  const newOrder = await createOrder(order);

  //Trükk -> Direktbe hívom a store-ból a dispatch-et a clearCart funkcióval. Mivel csak React Componenten belül lehet elérni a dispatch-et közvetlenül a useDispatch(), hook-al. (Performancia igényes, nem szabad túlhasználni.)
  store.dispatch(clearCart());

  //Mivel funkció a useNavigatet nem használhatjuk, helyette redirect, a visszatért értéket így beállítja az URL-nek és le is fetcheli az adatot
  // Innen http://localhost:5173/order/new -> Erre írja át az URL-t http://localhost:5173/order/3W7E7T
  return redirect(`/order/${newOrder.id}`);

  // return null;
}

export default CreateOrder;
