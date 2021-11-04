import { IFilter } from "@saleor/components/Filter";
import { MultiAutocompleteChoiceType } from "@saleor/components/MultiAutocompleteSelectField";
import { commonMessages } from "@saleor/intl";
import { orderStatusMessages } from "@saleor/misc";
import { FilterOpts, MinMax } from "@saleor/types";
import { OrderStatusFilter } from "@saleor/types/globalTypes";
import {
  createBooleanField,
  createDateField,
  createOptionsField,
  createTextField
} from "@saleor/utils/filters/fields";
import { defineMessages, IntlShape } from "react-intl";

export enum OrderFilterKeys {
  created = "created",
  customer = "customer",
  status = "status",
  channel = "channel",
  clickAndCollect = "clickAndCollect",
  preorder = "preorder"
}

export interface OrderListFilterOpts {
  created: FilterOpts<MinMax>;
  customer: FilterOpts<string>;
  status: FilterOpts<OrderStatusFilter[]>;
  channel?: FilterOpts<MultiAutocompleteChoiceType[]>;
  clickAndCollect: FilterOpts<boolean>;
  preorder: FilterOpts<boolean>;
}

const messages = defineMessages({
  preorder: {
    defaultMessage: "Preorder",
    description: "is preorder"
  },
  clickAndCollect: {
    defaultMessage: "Click&Collect",
    description: "click and collect"
  },
  channel: {
    defaultMessage: "Channel",
    description: "order"
  },
  customer: {
    defaultMessage: "Customer",
    description: "order"
  },
  placed: {
    defaultMessage: "Created",
    description: "order"
  }
});

export function createFilterStructure(
  intl: IntlShape,
  opts: OrderListFilterOpts
): IFilter<OrderFilterKeys> {
  return [
    {
      ...createBooleanField(
        OrderFilterKeys.clickAndCollect,
        intl.formatMessage(messages.clickAndCollect),
        opts.clickAndCollect.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.clickAndCollect.active
    },
    {
      ...createBooleanField(
        OrderFilterKeys.preorder,
        intl.formatMessage(messages.preorder),
        opts.preorder.value,
        {
          negative: intl.formatMessage(commonMessages.no),
          positive: intl.formatMessage(commonMessages.yes)
        }
      ),
      active: opts.preorder.active
    },
    {
      ...createTextField(
        OrderFilterKeys.customer,
        intl.formatMessage(messages.customer),
        opts.customer.value
      ),
      active: opts.customer.active
    },
    {
      ...createDateField(
        OrderFilterKeys.created,
        intl.formatMessage(messages.placed),
        opts.created.value
      ),
      active: opts.created.active
    },
    {
      ...createOptionsField(
        OrderFilterKeys.status,
        intl.formatMessage(commonMessages.status),
        opts.status.value,
        true,
        [
          {
            label: intl.formatMessage(orderStatusMessages.cancelled),
            value: OrderStatusFilter.CANCELED
          },
          {
            label: intl.formatMessage(orderStatusMessages.fulfilled),
            value: OrderStatusFilter.FULFILLED
          },
          {
            label: intl.formatMessage(orderStatusMessages.partiallyFulfilled),
            value: OrderStatusFilter.PARTIALLY_FULFILLED
          },
          {
            label: intl.formatMessage(orderStatusMessages.unfulfilled),
            value: OrderStatusFilter.UNFULFILLED
          },
          {
            label: intl.formatMessage(orderStatusMessages.readyToCapture),
            value: OrderStatusFilter.READY_TO_CAPTURE
          },
          {
            label: intl.formatMessage(orderStatusMessages.readyToFulfill),
            value: OrderStatusFilter.READY_TO_FULFILL
          }
        ]
      ),
      active: opts.status.active
    },
    ...(opts?.channel?.value.length
      ? [
          {
            ...createOptionsField(
              OrderFilterKeys.channel,
              intl.formatMessage(messages.channel),
              [],
              true,
              opts.channel.value
            ),
            active: opts.channel.active
          }
        ]
      : [])
  ];
}
