import { DialogContentText } from "@material-ui/core";
import ActionDialog from "@saleor/components/ActionDialog";
import {
  usePageBulkPublishMutation,
  usePageBulkRemoveMutation,
  usePageListQuery
} from "@saleor/graphql";
import useBulkActions from "@saleor/hooks/useBulkActions";
import useListSettings from "@saleor/hooks/useListSettings";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import { usePaginationReset } from "@saleor/hooks/usePaginationReset";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import { Button, DeleteIcon, IconButton } from "@saleor/macaw-ui";
import { maybe } from "@saleor/misc";
import { ListViews } from "@saleor/types";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import createSortHandler from "@saleor/utils/handlers/sortHandler";
import { mapEdgesToItems } from "@saleor/utils/maps";
import { getSortParams } from "@saleor/utils/sort";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import PageListPage from "../../components/PageListPage/PageListPage";
import {
  pageCreateUrl,
  pageListUrl,
  PageListUrlDialog,
  PageListUrlQueryParams,
  pageUrl
} from "../../urls";
import { getSortQueryVariables } from "./sort";

interface PageListProps {
  params: PageListUrlQueryParams;
}

export const PageList: React.FC<PageListProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const paginate = usePaginator();
  const { isSelected, listElements, reset, toggle, toggleAll } = useBulkActions(
    params.ids
  );
  const { updateListSettings, settings } = useListSettings(
    ListViews.PAGES_LIST
  );

  usePaginationReset(pageListUrl, params, settings.rowNumber);

  const intl = useIntl();

  const paginationState = createPaginationState(settings.rowNumber, params);
  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      sort: getSortQueryVariables(params)
    }),
    [params, settings.rowNumber]
  );
  const { data, loading, refetch } = usePageListQuery({
    displayLoader: true,
    variables: queryVariables
  });

  const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
    maybe(() => data.pages.pageInfo),
    paginationState,
    params
  );

  const [openModal, closeModal] = createDialogActionHandlers<
    PageListUrlDialog,
    PageListUrlQueryParams
  >(navigate, pageListUrl, params);

  const [bulkPageRemove, bulkPageRemoveOpts] = usePageBulkRemoveMutation({
    onCompleted: data => {
      if (data.pageBulkDelete.errors.length === 0) {
        closeModal();
        notify({
          status: "success",
          text: intl.formatMessage({
            defaultMessage: "Removed pages",
            description: "notification"
          })
        });
        reset();
        refetch();
      }
    }
  });

  const [bulkPagePublish, bulkPagePublishOpts] = usePageBulkPublishMutation({
    onCompleted: data => {
      if (data.pageBulkPublish.errors.length === 0) {
        closeModal();
        notify({
          status: "success",
          text: intl.formatMessage({
            defaultMessage: "Published pages",
            description: "notification"
          })
        });
        reset();
        refetch();
      }
    }
  });

  const handleSort = createSortHandler(navigate, pageListUrl, params);

  return (
    <>
      <PageListPage
        disabled={loading}
        settings={settings}
        pages={mapEdgesToItems(data?.pages)}
        pageInfo={pageInfo}
        onAdd={() => navigate(pageCreateUrl())}
        onNextPage={loadNextPage}
        onPreviousPage={loadPreviousPage}
        onUpdateListSettings={updateListSettings}
        onRowClick={id => () => navigate(pageUrl(id))}
        onSort={handleSort}
        toolbar={
          <>
            <Button
              onClick={() =>
                openModal("unpublish", {
                  ids: listElements
                })
              }
            >
              <FormattedMessage
                defaultMessage="Unpublish"
                description="unpublish page, button"
              />
            </Button>
            <Button
              onClick={() =>
                openModal("publish", {
                  ids: listElements
                })
              }
            >
              <FormattedMessage
                defaultMessage="Publish"
                description="publish page, button"
              />
            </Button>
            <IconButton
              variant="secondary"
              color="primary"
              onClick={() =>
                openModal("remove", {
                  ids: listElements
                })
              }
            >
              <DeleteIcon />
            </IconButton>
          </>
        }
        isChecked={isSelected}
        selected={listElements.length}
        sort={getSortParams(params)}
        toggle={toggle}
        toggleAll={toggleAll}
      />
      <ActionDialog
        open={params.action === "publish"}
        onClose={closeModal}
        confirmButtonState={bulkPagePublishOpts.status}
        onConfirm={() =>
          bulkPagePublish({
            variables: {
              ids: params.ids,
              isPublished: true
            }
          })
        }
        title={intl.formatMessage({
          defaultMessage: "Publish Pages",
          description: "dialog header"
        })}
      >
        <DialogContentText>
          <FormattedMessage
            defaultMessage="{counter,plural,one{Are you sure you want to publish this page?} other{Are you sure you want to publish {displayQuantity} pages?}}"
            description="dialog content"
            values={{
              counter: maybe(() => params.ids.length),
              displayQuantity: <strong>{maybe(() => params.ids.length)}</strong>
            }}
          />
        </DialogContentText>
      </ActionDialog>
      <ActionDialog
        open={params.action === "unpublish"}
        onClose={closeModal}
        confirmButtonState={bulkPagePublishOpts.status}
        onConfirm={() =>
          bulkPagePublish({
            variables: {
              ids: params.ids,
              isPublished: false
            }
          })
        }
        title={intl.formatMessage({
          defaultMessage: "Unpublish Pages",
          description: "dialog header"
        })}
      >
        <FormattedMessage
          defaultMessage="{counter,plural,one{Are you sure you want to unpublish this page?} other{Are you sure you want to unpublish {displayQuantity} pages?}}"
          description="dialog content"
          values={{
            counter: maybe(() => params.ids.length),
            displayQuantity: <strong>{maybe(() => params.ids.length)}</strong>
          }}
        />
      </ActionDialog>
      <ActionDialog
        open={params.action === "remove"}
        onClose={closeModal}
        confirmButtonState={bulkPageRemoveOpts.status}
        onConfirm={() =>
          bulkPageRemove({
            variables: {
              ids: params.ids
            }
          })
        }
        variant="delete"
        title={intl.formatMessage({
          defaultMessage: "Delete Pages",
          description: "dialog header"
        })}
      >
        <FormattedMessage
          defaultMessage="{counter,plural,one{Are you sure you want to delete this page?} other{Are you sure you want to delete {displayQuantity} pages?}}"
          description="dialog content"
          values={{
            counter: maybe(() => params.ids.length),
            displayQuantity: <strong>{maybe(() => params.ids.length)}</strong>
          }}
        />
      </ActionDialog>
    </>
  );
};

export default PageList;
