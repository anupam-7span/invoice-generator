import React from 'react';
import Barcode from 'react-barcode';

const OrderInvoice = ({ order }) => {
  const {
    shopLogo,
    shopLogoWidth,
    accentColor,
    dateFormat = "MMM D, YYYY",
    showProductImages = true,
    productImageSize = 58,
    showOrderNumberBarcode = true,
    shopName,
    orderNumber,
    poNumber,
    createdAt,
    shippingAddress,
    billingAddress,
    customer,
    paymentMethod,
    paymentTerms,
    shippingMethod,
    lineItems,
    note,
    totalDiscounts,
    discounts,
    subtotal,
    shippingCost,
    duties,
    tax,
    total,
  } = order;

  return (
    <div className="invoice-container">
      <div className="header">
        <div className="shop-title">
          {shopLogo ? (
            <img src={shopLogo} alt="Shop Logo" style={{ width: shopLogoWidth }} />
          ) : (
            <h1>{shopName}</h1>
          )}
        </div>
        <div className="order-title">
          <p>
            {showOrderNumberBarcode && orderNumber && (
              <>
                <Barcode value={orderNumber} format="CODE128" />
                <br />
              </>
            )}
            Receipt / Tax Invoice {orderNumber}
            {poNumber && <><br />Purchase order {poNumber}</>}
          </p>
          <p>{new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
        </div>
      </div>

      <div className="customer-info">
        {shippingAddress && (
          <div className="shipping-address">
            <p><strong>Shipping address</strong></p>
            <p>
              {shippingAddress.formatted}<br />
              {shippingAddress.phone && `Tel. ${shippingAddress.phone}`}
            </p>
          </div>
        )}
        <div className="billing-address">
          <p><strong>Customer</strong></p>
          <p>
            {billingAddress ? (
              <>
                {billingAddress.formatted}
                {billingAddress.phone && <><br />Tel. {billingAddress.phone}</>}
              </>
            ) : (
              <>{customer.name}<br />{customer.email}<br />Tel. {customer.phone}</>
            )}
          </p>
        </div>
      </div>

      <hr />

      <div className="order-details">
        <div className="payment-info">
          {paymentMethod && (
            <div>
              <p><strong>Payment method</strong></p>
              <p>{paymentMethod}</p>
            </div>
          )}
          {paymentTerms && (
            <div>
              <p>{paymentTerms.overdue ? 'Overdue' : `Due on ${new Date(paymentTerms.dueAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}`}</p>
            </div>
          )}
        </div>
        {shippingMethod && (
          <div>
            <p><strong>Shipping method</strong></p>
            <p>{shippingMethod.title}</p>
          </div>
        )}
      </div>

      <hr />

      <div className="order-table">
        <div className="table-header">
          <div>Items</div>
          <div>Price</div>
          <div>Tax</div>
          <div>Qty</div>
          <div>Item Total</div>
        </div>
        <div className="table-body">
          {lineItems.map(item => (
            <div key={item.id} className="table-row">
              {showProductImages && (
                <div>
                  <img src={item.image || '/product_image_placeholder.svg'} alt={item.productTitle} style={{ width: productImageSize, height: productImageSize }} />
                </div>
              )}
              <div>
                <p>{item.productTitle}</p>
                {item.variantTitle && <p>{item.variantTitle}</p>}
                {item.sku && <p>SKU: {item.sku}</p>}
                {item.properties.map((prop, index) => (
                  <p key={index}>{prop.name}: {prop.value}</p>
                ))}
                {item.refunded && <p><span>Refunded</span></p>}
              </div>
              <div>{item.price}</div>
              <div>{item.taxRate}%</div>
              <div>{item.quantity}</div>
              <div>{item.lineTotal}</div>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div className="notes">
        {note && (
          <div>
            <strong>Notes:</strong>
            <p>{note}</p>
          </div>
        )}
        <div className="pricing-summary">
          {totalDiscounts > 0 && (
            <div>
              <p>Discounts: {discounts.map(discount => discount.title).join(", ")}</p>
            </div>
          )}
          <p>Subtotal: {subtotal}</p>
          <p>Shipping: {shippingCost}</p>
          {duties && <p>Import Duties: {duties}</p>}
          <p>Tax: {tax}</p>
          <p>Total: {total}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
