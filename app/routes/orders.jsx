import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import axios from "axios";

export async function loader() {
  console.log("SHOPIFY_STORE:", process.env.SHOPIFY_STORE);
  console.log("SHOPIFY_API_TOKEN:", process.env.SHOPIFY_API_TOKEN);

  try {
    const response = await axios.get(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/orders.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN,
        },
      }
    );

    return json(response.data.orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Response("Error fetching orders", { status: 500 });
  }
}

export default function Orders() {
  const orders = useLoaderData();

  return (
    <div>
      <h1>Shopify Orders</h1>
      {orders && orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h2>Order Number: {order.name}</h2>
            <p>Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <h3>Customer Details</h3>
            <p>{order.customer?.first_name} {order.customer?.last_name}</p>
            <h3>Products:</h3>
            <ul>
              {order.line_items.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong> - Quantity: {item.quantity}
                </li>
              ))}
            </ul>
            <p>Total Price: {order.total_price}</p>
           
          </div>
        ))
      ) : (
        <p>No orders found</p>
      )}
    </div>
  );
}
