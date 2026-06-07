import React, { useMemo } from "react";
import { Badge, Box, Flex, Grid, Separator, Spinner, Text } from "@radix-ui/themes";
import { RestaurantMenuOutlined, KitchenOutlined } from "@mui/icons-material";
import {
  ProductDataList,
  ProductVariantDto,
  ProductAddOnGroupDto,
} from "../../../../api/commons/types";
import { useApi } from "../../../../core/hooks";
import { ImageReader } from "../../../radix/ImageReader";
import { formatCurrency, formatId } from "../../../../business/strings";

export const ProductViewDialogContent: React.FC<{
  product: ProductDataList;
}> = ({ product }) => {
  const isMenuItem = product.isMenuItem;

  // Fetch variants and add-ons for menu items only
  const variantsApi = useApi(
    (api) =>
      product.isMenuItem
        ? api.commons.productVariantsByProduct(product.productID)
        : Promise.resolve({
            data: { success: true, response: [] },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {},
          } as any),
    [product.productID, product.isMenuItem],
  );

  const addOnsApi = useApi(
    (api) =>
      product.isMenuItem
        ? api.commons.productAddOnGroupsByProduct(product.productID)
        : Promise.resolve({
            data: { success: true, response: [] },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {},
          } as any),
    [product.productID, product.isMenuItem],
  );

  const variants: ProductVariantDto[] = useMemo(
    () => variantsApi.result?.data?.response ?? [],
    [variantsApi.result],
  );

  const addOnGroups: ProductAddOnGroupDto[] = useMemo(
    () => addOnsApi.result?.data?.response ?? [],
    [addOnsApi.result],
  );

  const categoryName = isMenuItem
    ? product.productCategoryName
    : product.ingredientCategoryName;
  const categoryLabel = isMenuItem ? "Menu Category" : "Ingredient Category";

  const typeColor: "indigo" | "green" = isMenuItem ? "indigo" : "green";

  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        {/* Header row with image, info, badges */}
        <Flex gap="4" justify="between" align="start">
          <Flex gap="3" align="center" style={{ flex: 1, minWidth: 0 }}>
            <ImageReader
              src={product.imageUrl}
              alt={product.name}
              size={48}
              radius="2"
              border
              fallbackText={product.name}
            />
            <Box style={{ minWidth: 0 }}>
              <Text size="3" weight="bold" as="div" truncate>
                {product.name}
              </Text>
              {product.description && (
                <Text size="1" color="gray" as="div" truncate>
                  {product.description}
                </Text>
              )}
              <Text
                size="1"
                color="gray"
                as="div"
                style={{ fontFamily: "monospace" }}
              >
                ID: {formatId(product.productID)}
              </Text>
            </Box>
          </Flex>
          <Flex gap="2" align="center">
            <Badge color={typeColor} variant="soft" radius="medium" size="2">
              {isMenuItem ? "Menu Item" : "Ingredient"}
            </Badge>
            <Badge
              color={product.isActive ? "green" : "gray"}
              variant="soft"
              radius="medium"
              size="2"
            >
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </Flex>
        </Flex>

        <Separator size="4" />

        {/* Pricing section */}
        <Box>
          <Text size="2" weight="bold" mb="2">
            Pricing
          </Text>
          <Grid columns="2" gap="3">
            {isMenuItem ? (
              <>
                {product.unitPrice ? (
                  <Box>
                    <Text size="1" color="gray" as="div">
                      Selling Price
                    </Text>
                    <Text
                      size="3"
                      weight="bold"
                      as="div"
                      style={{ color: "var(--green-11)" }}
                    >
                      {formatCurrency(product.unitPrice)}
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <Text size="1" color="gray" as="div">
                      Pricing
                    </Text>
                    <Badge
                      color="violet"
                      variant="soft"
                      size="1"
                      style={{ marginTop: "0.5rem" }}
                    >
                      Variant pricing
                    </Badge>
                  </Box>
                )}
                {product.costPrice && product.costPrice > 0 && (
                  <Box>
                    <Text size="1" color="gray" as="div">
                      Cost Price
                    </Text>
                    <Text size="2" weight="medium" as="div">
                      {formatCurrency(product.costPrice)}
                    </Text>
                  </Box>
                )}
              </>
            ) : (
              <>
                <Box>
                  <Text size="1" color="gray" as="div">
                    Cost Price
                  </Text>
                  <Text
                    size="3"
                    weight="bold"
                    as="div"
                    style={{ color: "var(--blue-11)" }}
                  >
                    {formatCurrency(product.costPrice ?? 0)}
                  </Text>
                </Box>
                {product.purchaseQuantity && (
                  <Box>
                    <Text size="1" color="gray" as="div">
                      Purchase Qty
                    </Text>
                    <Text size="2" weight="medium" as="div">
                      {product.purchaseQuantity} {product.purchaseUnitName}
                    </Text>
                  </Box>
                )}
                {product.stockUnitName && (
                  <Box>
                    <Text size="1" color="gray" as="div">
                      Stock Unit
                    </Text>
                    <Text size="2" weight="medium" as="div">
                      {product.stockUnitName}
                    </Text>
                  </Box>
                )}
                {product.costPerStockUnit && (
                  <Box>
                    <Text size="1" color="gray" as="div">
                      Cost per Stock Unit
                    </Text>
                    <Text size="2" weight="medium" as="div">
                      {formatCurrency(product.costPerStockUnit)}
                    </Text>
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Box>

        <Separator size="4" />

        {/* Category & Brand */}
        <Grid columns="2" gap="4">
          <Box>
            <Text size="1" color="gray" as="div">
              {categoryLabel}
            </Text>
            <Flex gap="2" align="center" style={{ marginTop: "0.5rem" }}>
              <Avatar
                size="1"
                radius="full"
                color="indigo"
                variant="soft"
                fallback={isMenuItem ? <RestaurantMenuOutlined fontSize="small" /> : <KitchenOutlined fontSize="small" />}
              />
              <Text size="2" weight="medium">
                {categoryName || "Uncategorized"}
              </Text>
            </Flex>
          </Box>

          {product.brandName && (
            <Box>
              <Text size="1" color="gray" as="div">
                Brand
              </Text>
              <Text size="2" weight="medium" style={{ marginTop: "0.5rem" }}>
                {product.brandName}
              </Text>
            </Box>
          )}
        </Grid>

        {isMenuItem && (
          <>
            <Separator size="4" />

            {/* Variants section */}
            <Box>
              <Flex gap="2" align="center" mb="2">
                <Text size="2" weight="bold">
                  Variants
                </Text>
                {variantsApi.loading && <Spinner />}
              </Flex>
              {variants.length > 0 ? (
                <Flex direction="column" gap="2">
                  {variants.map((v) => (
                    <Flex
                      key={v.productVariantID}
                      justify="between"
                      align="center"
                      p="2"
                      style={{
                        border: "1px solid var(--gray-a4)",
                        borderRadius: "var(--radius-2)",
                        backgroundColor: "var(--gray-a1)",
                      }}
                    >
                      <Text size="2" weight="medium">
                        {v.name}
                      </Text>
                      <Text
                        size="2"
                        weight="bold"
                        style={{ color: "var(--green-11)" }}
                      >
                        {formatCurrency(v.price)}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <Text size="1" color="gray">
                  No variants configured
                </Text>
              )}
            </Box>

            {/* Add-ons section */}
            <Box>
              <Flex gap="2" align="center" mb="2">
                <Text size="2" weight="bold">
                  Add-on Groups
                </Text>
                {addOnsApi.loading && <Spinner />}
              </Flex>
              {addOnGroups.length > 0 ? (
                <Flex direction="column" gap="3">
                  {addOnGroups.map((group) => (
                    <Box
                      key={group.productAddOnGroupID}
                      p="3"
                      style={{
                        border: "1px solid var(--gray-a4)",
                        borderRadius: "var(--radius-2)",
                        backgroundColor: "var(--gray-a1)",
                      }}
                    >
                      <Flex gap="2" align="center" mb="2">
                        <Text size="2" weight="bold">
                          {group.name}
                        </Text>
                        <Badge
                          color={group.isRequired ? "amber" : "gray"}
                          variant="soft"
                          size="1"
                        >
                          {group.isRequired ? "Required" : "Optional"}
                        </Badge>
                        {group.maxSelections && (
                          <Text size="1" color="gray">
                            max {group.maxSelections}
                          </Text>
                        )}
                      </Flex>
                      <Flex direction="column" gap="1">
                        {group.items && group.items.length > 0 ? (
                          group.items.map((item) => (
                            <Flex
                              key={item.productAddOnItemID}
                              justify="between"
                              align="center"
                              p="2"
                              style={{
                                backgroundColor: "var(--color-panel-solid)",
                                borderRadius: "var(--radius-1)",
                              }}
                            >
                              <Text size="1">{item.name}</Text>
                              {item.additionalPrice > 0 && (
                                <Text size="1" weight="medium" color="indigo">
                                  +{formatCurrency(item.additionalPrice)}
                                </Text>
                              )}
                              {item.additionalPrice === 0 && (
                                <Text size="1" color="gray">
                                  Free
                                </Text>
                              )}
                            </Flex>
                          ))
                        ) : (
                          <Text size="1" color="gray">
                            No items in this group
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Text size="1" color="gray">
                  No add-on groups configured
                </Text>
              )}
            </Box>
          </>
        )}

        <Separator size="4" />

        {/* Audit section */}
        <Box>
          <Text size="2" weight="bold" mb="2">
            Audit Info
          </Text>
          <Grid columns="2" gap="4">
            <Box>
              <Text size="1" color="gray" as="div">
                Created By
              </Text>
              <Text size="2" weight="medium">
                {product.createdBy || "System"}
              </Text>
              {product.createdAt && (
                <Text size="1" color="gray">
                  {new Date(product.createdAt).toLocaleString()}
                </Text>
              )}
            </Box>
            <Box>
              <Text size="1" color="gray" as="div">
                Updated By
              </Text>
              <Text size="2" weight="medium">
                {product.updatedBy || "—"}
              </Text>
              {product.updatedAt && (
                <Text size="1" color="gray">
                  {new Date(product.updatedAt).toLocaleString()}
                </Text>
              )}
            </Box>
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
};

interface AvatarProps {
  size: "1" | "2" | "3";
  radius: "full" | "2";
  color: "indigo" | "green";
  variant: "soft";
  fallback: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ fallback }) => {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "9999px",
        backgroundColor: "var(--indigo-a3)",
        color: "var(--indigo-11)",
        fontSize: "14px",
      }}
    >
      {fallback}
    </Flex>
  );
};
