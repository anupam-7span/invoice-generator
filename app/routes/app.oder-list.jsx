import React, { useState, useEffect } from "react";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import axios from "axios";
import { Page, Layout, Card, TextField, Button, Link } from "@shopify/polaris";
import jsPDF from "jspdf";

// Function to generate PDF for a specific order
function generateOrderPDF(order) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text(`Order Receipt: ${order.name}`, 10, 10);
  doc.setFontSize(12);
  doc.text(`Order ID: ${order.id}`, 10, 20);
  doc.text(`Customer Name: ${order.customerName}`, 10, 30);

  order.line_items.forEach((item, index) => {
    doc.text(`${item.title} - ${item.variant_title || ""}`, 10, 40 + index * 10);
  });

  doc.save(`${order.name}_receipt.pdf`);
}

// Loader function to fetch data from API
export async function loader({ request }) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  try {
    if (orderId) {
      const response = await axios.get(
        `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/orders/${orderId}.json`,
        {
          headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN },
        }
      );
      return json({ order: response.data.order });
    } else {
      const response = await axios.get(
        `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/orders.json`,
        {
          headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN },
        }
      );
      return json({ orders: response.data.orders });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Response("Error fetching orders", { status: 500 });
  }
}

const OrderList = () => {
  const { order, orders } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(orders || []);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  const formatAddress = (address) =>
    [
      address?.name,
      address?.address1,
      address?.city,
      address?.province,
      address?.zip,
      address?.country,
    ]
      .filter(Boolean)
      .join(",\n");

  const formatProducts = (lineItems) =>
    lineItems.map((item) => `${item.title} - ${item.variant_title || ""}`).join(",\n");

  if (order) {
    return (
      <Page title={`Order Details for ${order.name}`}>
        <Button onClick={() => setSearchParams({})}>Back to Order List</Button>
        <Card sectioned title={`Order ID: ${order.id}`}>
          <p>Customer: {order.customer?.first_name} {order.customer?.last_name}</p>
          <p>Total: {order.total_price}</p>
          <p>Shipping Address: <pre>{formatAddress(order.shipping_address)}</pre></p>
          <p>Products: <pre>{formatProducts(order.line_items)}</pre></p>
          <Button onClick={() => generateOrderPDF(order)}>Download PDF</Button>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Orders List">
      <Link url="/" external><Button>Back</Button></Link>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextField
              label="Search by Order ID"
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              placeholder="Enter Order ID"
              clearButton
              onClearButtonClick={() => {
                setSearchTerm("");
                setFilteredOrders(orders);
              }}
            />
            <Button onClick={handleSearch} primary>Search</Button>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            {filteredOrders.length === 0 && searchTerm ? (
              <p>No orders found for the given search term.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Product with Variants</th>
                    <th>Quantity</th>
                    <th>Shipping Address</th>
                    <th>Payment Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #ccc" }}>
                      <td>
                        <Link url={`/orders?orderId=${order.id}`} external>{order.name.slice(1)}</Link>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{order.customer?.first_name} {order.customer?.last_name}</td>
                      <td><pre>{formatProducts(order.line_items)}</pre></td>
                      <td>{order.line_items.reduce((total, item) => total + item.quantity, 0)}</td>
                      <td><pre>{formatAddress(order.shipping_address)}</pre></td>
                      <td>{order.financial_status}</td>
                      <td>{order.total_price}</td>
                      <td>
                        <button onClick={() => generateOrderPDF(order)} className="button">
                          Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default OrderList;
