import React, { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";;
import {
  TabsContextProvider,
  TabsHeaderDesktop,
  TabsHeaderMobile,
  TabPanel,
  TabOption,
} from "core-lib/components/radix/tabs";
import { useResolution } from "core-lib/core/hooks";
import { LookupAdminBlock } from "core-lib/components/blocks/lookups/LookupAdminBlock";
import {
  INGREDIENT_CATEGORY_CONFIG,
  UNIT_CONFIG,
  BRAND_CONFIG,
  LOCATION_CONFIG,
  BUSINESS_SUPPLY_CATEGORY_CONFIG,
} from "core-lib/components/blocks/lookups/configs";
import { ProductCategoryBlock } from "@/components/contents/products/categories/ProductCategoryBlock";
import { VariantTemplatesBlock } from "./templates/VariantTemplatesBlock";
import { AddOnTemplatesBlock } from "./templates/AddOnTemplatesBlock";

interface CategoryTab {
  id: string;
  label: string;
  component: React.ReactNode;
}

const CATEGORY_TABS: CategoryTab[] = [
  {
    id: "product-categories",
    label: "Product Categories",
    component: <ProductCategoryBlock />,
  },
  {
    id: "ingredient-categories",
    label: "Ingredient Categories",
    component: <LookupAdminBlock config={INGREDIENT_CATEGORY_CONFIG} />,
  },
  {
    id: "units",
    label: "Units",
    component: <LookupAdminBlock config={UNIT_CONFIG} />,
  },
  {
    id: "brands",
    label: "Brands",
    component: <LookupAdminBlock config={BRAND_CONFIG} />,
  },
  {
    id: "locations",
    label: "Locations",
    component: <LookupAdminBlock config={LOCATION_CONFIG} />,
  },
  {
    id: "business-supply",
    label: "Business Supply",
    component: <LookupAdminBlock config={BUSINESS_SUPPLY_CATEGORY_CONFIG} />,
  },
];

const CategoriesSidebarLayout: React.FC = () => {
  const { isMobile } = useResolution();
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORY_TABS[0].id);
  const activeComponent = CATEGORY_TABS.find((t) => t.id === activeCategory)?.component;

  if (isMobile) {
    return (
      <Flex direction="column" gap="3">
        <style>{`
          .cat-pill-scroll::-webkit-scrollbar { display: none; }
          .cat-pill-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>
        <Flex
          className="cat-pill-scroll"
          gap="2"
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: 4,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <Box
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                px="3"
                py="1"
                style={{
                  flexShrink: 0,
                  cursor: "pointer",
                  borderRadius: "9999px",
                  background: isActive ? "var(--accent-9)" : "var(--gray-a3)",
                  color: isActive ? "var(--accent-contrast)" : "var(--gray-11)",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                <Text
                  size="2"
                  weight={isActive ? "bold" : "regular"}
                  style={{ color: "inherit" }}
                >
                  {tab.label}
                </Text>
              </Box>
            );
          })}
        </Flex>
        <Box key={activeCategory}>{activeComponent}</Box>
      </Flex>
    );
  }

  return (
    <Flex gap="4" align="start">
      <Box
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--gray-a4)",
          paddingRight: "var(--space-4)",
        }}
      >
        <Text
          size="1"
          weight="bold"
          color="gray"
          style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Category Type
        </Text>
        <Flex direction="column" gap="1" mt="3">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <Box
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                px="3"
                py="2"
                style={{
                  cursor: "pointer",
                  borderRadius: "var(--radius-2)",
                  borderLeft: isActive
                    ? "3px solid var(--accent-9)"
                    : "3px solid transparent",
                  background: isActive ? "var(--accent-a3)" : "transparent",
                  transition: "background 0.15s ease",
                  userSelect: "none",
                }}
              >
                <Text
                  size="2"
                  weight={isActive ? "bold" : "regular"}
                  style={{ color: isActive ? "var(--accent-11)" : "var(--gray-11)" }}
                >
                  {tab.label}
                </Text>
              </Box>
            );
          })}
        </Flex>
      </Box>

      <Box key={activeCategory} style={{ flex: 1, minWidth: 0 }}>
        {activeComponent}
      </Box>
    </Flex>
  );
};

const TemplatesSubTabs: React.FC = () => {
  const { isMobile } = useResolution();

  const templateTabs = useMemo<TabOption[]>(
    () => [
      {
        key: "variant_templates",
        label: "Variant Templates",
        content: <VariantTemplatesBlock />,
      },
      {
        key: "addon_templates",
        label: "Add-On Templates",
        content: <AddOnTemplatesBlock />,
      },
    ],
    [],
  );

  return (
    <TabsContextProvider>
      {isMobile ? (
        <TabsHeaderMobile id="templates_sub_mobile" tabs={templateTabs} />
      ) : (
        <TabsHeaderDesktop id="templates_sub_desktop" tabs={templateTabs} />
      )}
      {templateTabs.map((tab, index) => (
        <TabPanel
          index={index}
          id={`${tab.key}_tabpanel_${index}`}
          aria-labelledby={`${tab.key}_tab_${index}`}
          key={tab.key}
        >
          <Box pt="4">{tab.content}</Box>
        </TabPanel>
      ))}
    </TabsContextProvider>
  );
};

export const CategoriesAndTemplatesBlock: React.FC = () => {
  const { isMobile } = useResolution();

  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "categories_tab",
        label: "Categories",
        content: <CategoriesSidebarLayout />,
      },
      {
        key: "templates_tab",
        label: "Templates",
        content: <TemplatesSubTabs />,
      },
    ],
    [],
  );

  return (
    <TabsContextProvider>
      {isMobile ? (
        <TabsHeaderMobile id="categories_hub_mobile" tabs={tabs} />
      ) : (
        <TabsHeaderDesktop id="categories_hub_desktop" tabs={tabs} />
      )}
      {tabs.map((tab, index) => (
        <TabPanel
          index={index}
          id={`${tab.key}_tabpanel_${index}`}
          aria-labelledby={`${tab.key}_tab_${index}`}
          key={tab.key}
        >
          <Box pt="4">{tab.content}</Box>
        </TabPanel>
      ))}
    </TabsContextProvider>
  );
};
