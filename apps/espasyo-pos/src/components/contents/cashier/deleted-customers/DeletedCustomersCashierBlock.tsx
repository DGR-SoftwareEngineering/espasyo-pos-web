import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { InfoOutlined, RestoreOutlined } from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { CustomerDto } from "core-lib/api/crm";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";

export const DeletedCustomersCashierBlock: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToastContext();

  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [restoreTarget, setRestoreTarget] = useState<CustomerDto | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const listDeletedCb = useApiCallback(
    async (api, params: { search?: string; pageNumber: number; pageSize: number }) =>
      api.crm.listDeleted(params),
  );
  const restoreCb = useApiCallback(async (api, id: string) => api.crm.restore(id));

  const loadDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listDeletedCb.execute({ search: search || undefined, pageNumber, pageSize });
      if (result?.data?.response) {
        setCustomers(result.data.response.items ?? []);
        setTotalCount(result.data.response.totalItems ?? 0);
      }
    } catch {
      showToast("Failed to load deleted customers", "error");
    } finally {
      setLoading(false);
    }
  }, [listDeletedCb, search, pageNumber, pageSize, showToast]);

  useEffect(() => {
    loadDeleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const handleSearch = useCallback(() => {
    setPageNumber(1);
    loadDeleted();
  }, [loadDeleted]);

  const handleRestore = useCallback(async () => {
    if (!restoreTarget) return;
    setRestoreLoading(true);
    try {
      const result = await restoreCb.execute(restoreTarget.customerID);
      if (result?.data?.success) {
        showToast(`${restoreTarget.fullName} restored`, "success");
        setRestoreTarget(null);
        setCustomers((prev) => prev.filter((c) => c.customerID !== restoreTarget.customerID));
        setTotalCount((n) => n - 1);
      } else {
        showToast(result?.data?.message ?? "Failed to restore", "error");
      }
    } catch {
      showToast("Failed to restore customer", "error");
    } finally {
      setRestoreLoading(false);
    }
  }, [restoreTarget, restoreCb, showToast]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Deleted Customers"
          subtitle={`${totalCount} deleted customer${totalCount !== 1 ? "s" : ""}`}
          icon={<RestoreOutlined style={{ fontSize: 24, color: "var(--teal-11)" }} />}
          extraContent={
            <Flex gap="2">
              <Button variant="soft" color="gray" onClick={() => router.push("/cashier/pos")}>
                <ArrowLeftIcon />
                Back to POS
              </Button>
              <Button variant="soft" color="indigo" onClick={loadDeleted} disabled={loading}>
                <ReloadIcon />
                Refresh
              </Button>
            </Flex>
          }
        />
      </Card>

      <Card variant="surface" size="3" mb="3">
        <Callout.Root color="blue" variant="soft" size="1">
          <Callout.Icon>
            <InfoOutlined style={{ fontSize: 16 }} />
          </Callout.Icon>
          <Callout.Text>
            You can restore deleted customers. To permanently remove a customer, contact an admin.
          </Callout.Text>
        </Callout.Root>
      </Card>

      <Card variant="surface" size="3">
        <Flex gap="2" mb="4">
          <TextField.Root
            style={{ flex: 1 }}
            placeholder="Search deleted customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
          <Button onClick={handleSearch} color="indigo" variant="solid">
            Search
          </Button>
        </Flex>

        {loading ? (
          <Flex align="center" justify="center" py="8">
            <Text color="gray">Loading…</Text>
          </Flex>
        ) : customers.length === 0 ? (
          <Flex align="center" justify="center" py="8">
            <Text color="gray">No deleted customers found.</Text>
          </Flex>
        ) : (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Customer</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Phone</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Segment</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {customers.map((c) => (
                <Table.Row key={c.customerID}>
                  <Table.Cell>
                    <Flex direction="column">
                      <Text size="2" weight="bold">{c.fullName}</Text>
                      <Text size="1" color="gray">{c.customerNumber}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" color="gray">{c.email ?? "—"}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" color="gray">{c.phone ?? "—"}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="gray" variant="soft" size="1">{c.segment}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="1" color="teal" variant="soft" onClick={() => setRestoreTarget(c)}>
                      <RestoreOutlined style={{ fontSize: 14 }} />
                      Restore
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}

        {totalPages > 1 && (
          <Flex justify="between" align="center" mt="4">
            <Button variant="soft" color="gray" disabled={pageNumber <= 1} onClick={() => setPageNumber((n) => n - 1)}>
              Previous
            </Button>
            <Text size="2" color="gray">Page {pageNumber} of {totalPages}</Text>
            <Button variant="soft" color="gray" disabled={pageNumber >= totalPages} onClick={() => setPageNumber((n) => n + 1)}>
              Next
            </Button>
          </Flex>
        )}
      </Card>

      <AlertDialog.Root open={!!restoreTarget} onOpenChange={(o) => !o && setRestoreTarget(null)}>
        <AlertDialog.Content>
          <AlertDialog.Title>Restore Customer</AlertDialog.Title>
          <AlertDialog.Description>
            Restore <strong>{restoreTarget?.fullName}</strong>? They will reappear in the active customer list.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="teal" onClick={handleRestore} loading={restoreLoading}>
                Restore
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};
