import React, { useState } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import axios from "axios";
import { Page, Layout, Card, Text } from "@shopify/polaris";
import { Link, useNavigate } from "@remix-run/react";


// Function to fetch orders from Shopify API
async function fetchOrders() {
  const response = await axios.get(`https://${process.env.SHOPIFY_STORE}/admin/api/2023-04/orders.json`, {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN,
    },
  });
  return response.data.orders;
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
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN,
          },
        }
      );
      console.log("Single Order Response:", response.data); // Log single order response
      return json(response.data.order);
    } else {
      const response = await axios.get(
        `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/orders.json`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_API_TOKEN,
          },
        }
      );
      console.log("All Orders Response:", response.data); // Log all orders response
      console.log("Orders Length:", response.data.orders.length); // Check length of orders
      return json(response.data.orders);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Response("Error fetching orders", { status: 500 });
  }
}

export default function Index() {
  const orders = useLoaderData();
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) // Optional chaining
  );

  return (
   
      

    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
            <Card
              title="Total Orders"
              sectioned
              primaryFooterAction={{
                content: "View Orders",
                onAction: () => navigate("/orders"),
              }}
            >
              
                <Link to="/app/oder-list" style={{ textDecoration: "none", color: "inherit" }}>
                <Text class="center" variant="" as="h5">Total Orders:</Text> 
                <Text class="center" variant="heading2xl" as="h3">{orders.length} </Text>{/* Dynamic total orders displayed */}
                </Link>
             
            </Card>

            <Card title="Total Invoices Generated" sectioned>
              <Text variant="headingLg" as="p"></Text>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
