import React from "react";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { json } from "@remix-run/node";

// Loader function to fetch order details based on order ID
export async function loader({ params }) {
  const { orderId } = params;

  try {
    const response = await axios.get(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/orders/${orderId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN,
        },
      }
    );
    return json(response.data.order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw new Response("Error fetching order details", { status: 500 });
  }
}

export default function OrderDetails() {
  const order = useLoaderData();

  return (
    <div>
      <h1>Order Details</h1>
      <h2>Order ID: {order.name.slice(1)}</h2>
      <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
      <p>Total Price: {order.total_price}</p>

      <h3>Customer Details</h3>
      <p>Name: {order.customer?.first_name} {order.customer?.last_name}</p>
      <p>Email: {order.customer?.email}</p>

      <h3>Shipping Address</h3>
      <div>
        <p>{order.shipping_address?.name}</p>
        <p>{order.shipping_address?.address1}</p>
        <p>{order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.zip}</p>
        <p>{order.shipping_address?.country}</p>
      </div>

      <h3>Products</h3>
      <ul>
        {order.line_items.map(item => (
          <li key={item.id}>
            {item.title} - Quantity: {item.quantity} - Price: {item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
