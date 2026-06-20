import { useParams } from 'react-router-dom';

export default function ProductPricesPage() {
  const { productId } = useParams();

  return (
    <div className="screenlet">
      <div className="screenlet-title">Product Prices</div>
      <div className="screenlet-body">
        <p>
          Price management for <strong>{productId}</strong> is not yet available in the catalog
          microservice. In OFBiz, product prices are maintained via ProductPrice rules (list price,
          default price, promo price, etc.) and are typically owned by a pricing or order service.
        </p>
        <p className="placeholder-note">
          This tab is reserved for future integration with product pricing APIs.
        </p>
      </div>
    </div>
  );
}
