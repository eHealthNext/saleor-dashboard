import CardSpacer from "@saleor/components/CardSpacer";
import Container from "@saleor/components/Container";
import Grid from "@saleor/components/Grid";
import PageHeader from "@saleor/components/PageHeader";
import {
  FulfillmentStatus,
  OrderErrorFragment,
  OrderRefundDataQuery
} from "@saleor/graphql";
import { SubmitPromise } from "@saleor/hooks/useForm";
import { Backlink } from "@saleor/macaw-ui";
import { renderCollection } from "@saleor/misc";
import React from "react";
import { useIntl } from "react-intl";

import OrderRefund from "../OrderRefund";
import OrderRefundFulfilledProducts from "../OrderRefundFulfilledProducts";
import OrderRefundAmount from "../OrderRefundReturnAmount";
import {
  getMiscellaneousAmountValues,
  getRefundProductsAmountValues
} from "../OrderRefundReturnAmount/utils";
import OrderRefundUnfulfilledProducts from "../OrderRefundUnfulfilledProducts";
import OrderRefundForm, {
  OrderRefundSubmitData,
  OrderRefundType
} from "./form";

export const refundFulfilledStatuses = [
  FulfillmentStatus.FULFILLED,
  FulfillmentStatus.RETURNED,
  FulfillmentStatus.WAITING_FOR_APPROVAL
];

export interface OrderRefundPageProps {
  order: OrderRefundDataQuery["order"];
  defaultType?: OrderRefundType;
  disabled: boolean;
  errors: OrderErrorFragment[];
  onBack: () => void;
  onSubmit: (data: OrderRefundSubmitData) => SubmitPromise;
}

const OrderRefundPage: React.FC<OrderRefundPageProps> = props => {
  const {
    order,
    defaultType = OrderRefundType.PRODUCTS,
    disabled,
    errors = [],
    onBack,
    onSubmit
  } = props;

  const intl = useIntl();

  const unfulfilledLines = order?.lines.filter(
    line => line.quantityToFulfill > 0
  );

  const fulfilledFulfillemnts =
    order?.fulfillments.filter(({ status }) =>
      refundFulfilledStatuses.includes(status)
    ) || [];

  return (
    <OrderRefundForm
      order={order}
      defaultType={defaultType}
      onSubmit={onSubmit}
    >
      {({ data, handlers, change, submit }) => {
        const isProductRefund = data.type === OrderRefundType.PRODUCTS;

        return (
          <Container>
            <Backlink onClick={onBack}>
              {order?.number
                ? intl.formatMessage(
                    {
                      defaultMessage: "Order #{orderNumber}",
                      description: "page header with order number"
                    },
                    {
                      orderNumber: order.number
                    }
                  )
                : intl.formatMessage({
                    defaultMessage: "Order",
                    description: "page header"
                  })}
            </Backlink>
            <PageHeader
              title={intl.formatMessage(
                {
                  defaultMessage: "Order no. {orderNumber} - Refund",
                  description: "page header"
                },
                {
                  orderNumber: order?.number
                }
              )}
            />
            <Grid>
              <div>
                <OrderRefund
                  data={data}
                  disabled={disabled}
                  onChange={change}
                />
                {isProductRefund && (
                  <>
                    {unfulfilledLines?.length > 0 && (
                      <>
                        <CardSpacer />
                        <OrderRefundUnfulfilledProducts
                          unfulfilledLines={unfulfilledLines}
                          data={data}
                          disabled={disabled}
                          onRefundedProductQuantityChange={
                            handlers.changeRefundedProductQuantity
                          }
                          onSetMaximalQuantities={
                            handlers.setMaximalRefundedProductQuantities
                          }
                        />
                      </>
                    )}
                    {renderCollection(fulfilledFulfillemnts, fulfillment => (
                      <React.Fragment key={fulfillment?.id}>
                        <CardSpacer />
                        <OrderRefundFulfilledProducts
                          fulfillment={fulfillment}
                          data={data}
                          disabled={disabled}
                          orderNumber={order?.number}
                          onRefundedProductQuantityChange={
                            handlers.changeRefundedFulfilledProductQuantity
                          }
                          onSetMaximalQuantities={() =>
                            handlers.setMaximalRefundedFulfilledProductQuantities(
                              fulfillment?.id
                            )
                          }
                        />
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
              <div>
                <OrderRefundAmount
                  amountData={
                    isProductRefund
                      ? getRefundProductsAmountValues(order, data)
                      : getMiscellaneousAmountValues(order)
                  }
                  data={data}
                  order={order}
                  disabled={disabled}
                  errors={errors}
                  onChange={change}
                  onRefund={submit}
                />
              </div>
            </Grid>
          </Container>
        );
      }}
    </OrderRefundForm>
  );
};
OrderRefundPage.displayName = "OrderRefundPage";
export default OrderRefundPage;
